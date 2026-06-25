import { useState, useMemo } from 'react';
import { Icon } from './Icon.jsx';
import { CompanyLogo } from './CompanyLogo.jsx';
import { companyFor } from '../../data/pyLabCompanies.js';

// Seed-stable shuffle — deterministic per session so the same 3 are picked on retry,
// but different next session (Date.now seeded). Good enough for a gate quiz.
function sample(arr, n, seed) {
  const a = [...arr];
  let s = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s ^ (s >>> 16), 0x45d9f3b) ^ (s >>> 17)) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

// Flatten problems + their MCQs into a list of quiz items.
// Each item: { problem, mcq, methodMap }
function buildQuizItems(problems, count) {
  const candidates = [];
  for (const p of problems) {
    if (!Array.isArray(p.mcqs) || p.mcqs.length === 0) continue;
    // Build a map from method id -> name for this problem
    const methodMap = {};
    (p.methods || []).forEach(m => { methodMap[m.id] = m.name; });
    for (const mcq of p.mcqs) {
      if (mcq.options && mcq.options.length >= 2 && mcq.answerId) {
        candidates.push({ problem: p, mcq, methodMap });
      }
    }
  }
  if (candidates.length === 0) return [];
  const seed = Date.now() >>> 0;
  return sample(candidates, Math.min(count, candidates.length), seed);
}

// Single question card
function QuizQuestion({ item, onAnswer }) {
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const { problem, mcq, methodMap } = item;
  const co = companyFor(problem);

  function choose(optId) {
    if (revealed) return;
    setPicked(optId);
    setRevealed(true);
  }

  const correct = picked === mcq.answerId;

  return (
    <div className="pal-reveal-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Problem framing */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CompanyLogo company={co.name} size={16} />
        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>{co.name}</span>
        <span style={{ fontSize: '0.76rem', color: 'var(--text-dim, var(--text-muted))', marginLeft: '0.2rem' }}>
          · {problem.title}
        </span>
      </div>

      {/* Stem */}
      <p style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.45 }}>
        {mcq.stem}
      </p>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {mcq.options.map(optId => {
          const label = methodMap[optId] || optId;
          const isAnswer = optId === mcq.answerId;
          const isPicked = optId === picked;

          let bg = 'var(--surface)';
          let border = 'var(--border)';
          let color = 'var(--text)';
          if (revealed) {
            if (isAnswer) { bg = 'var(--green-bg, var(--surface-2))'; border = 'var(--green-text)'; color = 'var(--green-text)'; }
            else if (isPicked && !isAnswer) { bg = 'var(--red-bg, var(--surface-2))'; border = 'var(--red-text)'; color = 'var(--red-text)'; }
            else { color = 'var(--text-muted)'; }
          }

          return (
            <button
              key={optId}
              onClick={() => choose(optId)}
              disabled={revealed}
              style={{
                textAlign: 'left', padding: '0.65rem 0.85rem',
                border: '1px solid ' + border, borderRadius: 'var(--radius-sm)',
                background: bg, color, cursor: revealed ? 'default' : 'pointer',
                fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.4,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              {revealed && isAnswer && <Icon name="check" size={14} color="var(--green-text)" />}
              {revealed && isPicked && !isAnswer && <Icon name="x" size={14} color="var(--red-text)" />}
              {label}
            </button>
          );
        })}
      </div>

      {/* Explanation (post-reveal) */}
      {revealed && (
        <div className="pal-reveal-in" style={{
          padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)',
          background: correct ? 'var(--green-bg, var(--surface-2))' : 'var(--surface-2)',
          border: '1px solid ' + (correct ? 'var(--green-text)' : 'var(--border)'),
          fontSize: '0.84rem', color: 'var(--text-secondary, var(--text-muted))', lineHeight: 1.55,
        }}>
          <span style={{ fontWeight: 700, color: correct ? 'var(--green-text)' : 'var(--red-text)', marginRight: '0.35rem' }}>
            {correct ? 'Correct.' : 'Not quite.'}
          </span>
          {mcq.explanation}
        </div>
      )}

      {revealed && (
        <button
          onClick={() => onAnswer(correct)}
          className="pal-btn-primary pal-glow-pulse"
          style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.1rem', fontSize: '0.88rem' }}
        >
          Next <Icon name="arrow-right" size={14} color="currentColor" />
        </button>
      )}
    </div>
  );
}

// GateQuiz — renders a short MCQ quiz drawn from the world\'s problem bank.
// If the world has < 3 MCQs available, shows a "not enough questions" fallback
// and surfaces self-declare instead.
// Props:
//   world      — world object from PYLAB_WORLDS
//   problems   — problems filtered to this world\'s topics
//   onPass(defaultLevel) — called on >= 80% score; defaultLevel is 'judgment' if perfect, else 'correctness'
//   onFail()   — called when user dismisses after failing (no unlock)
//   onClose()  — back button
export function GateQuiz({ world, problems, onPass, onFail, onClose }) {
  const quizItems = useMemo(() => buildQuizItems(problems, world.quizCount), [world.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // array of bool

  // Not enough questions — fall back to self-declare
  if (quizItems.length < 3) {
    return (
      <div className="pal-page-enter" style={{ maxWidth: 520, margin: '0 auto', padding: '2rem 1rem' }}>
        <button onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.84rem', padding: '0 0 1.5rem 0' }}>
          <Icon name="arrow-left" size={14} color="var(--text-muted)" /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <Icon name={world.icon} size={20} color="var(--accent)" />
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>{world.label}</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Not enough quiz questions in this world yet — more problems are being authored. Self-declare to unlock now; the quiz will be available once the bank fills in.
        </p>
        <button onClick={onFail} className="pal-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Icon name="arrow-left" size={14} color="currentColor" /> Back to gate
        </button>
      </div>
    );
  }

  const done = idx >= quizItems.length;

  if (done) {
    const correct = answers.filter(Boolean).length;
    const total = quizItems.length;
    const pct = Math.round(correct / total * 100);
    const passed = pct >= 80;
    const defaultLevel = (correct === total) ? 'judgment' : 'correctness';

    return (
      <div className="pal-page-enter" style={{ maxWidth: 520, margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            {passed
              ? <Icon name="check-circle" size={48} color="var(--green-text)" />
              : <Icon name="x-circle" size={48} color="var(--red-text)" />
            }
          </div>
          <h2 style={{ margin: '0 0 0.3rem', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>
            {passed ? 'World unlocked' : 'Not quite'}
          </h2>
          <p style={{ margin: '0 0 0.25rem', fontSize: '1rem', color: passed ? 'var(--green-text)' : 'var(--red-text)', fontWeight: 700 }}>
            {correct} / {total} correct ({pct}%)
          </p>
          <p style={{ margin: '0 0 2rem', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {passed
              ? correct === total
                ? 'Perfect score — opening at Judgment level.'
                : 'Opening at Correctness level. Keep solving to push toward Judgment.'
              : 'Need 80% to pass. Review the explanations above and try again — or self-declare to jump in.'}
          </p>
          {passed
            ? (
              <button onClick={() => onPass(defaultLevel)} className="pal-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.4rem', fontSize: '0.9rem' }}>
                Enter {world.label} <Icon name="arrow-right" size={14} color="currentColor" />
              </button>
            )
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', alignItems: 'center' }}>
                <button onClick={() => { setIdx(0); setAnswers([]); }} className="pal-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Icon name="rotate-ccw" size={14} color="currentColor" /> Try again
                </button>
                <button onClick={onFail} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  Self-declare instead
                </button>
              </div>
            )
          }
        </div>
      </div>
    );
  }

  const item = quizItems[idx];

  return (
    <div className="pal-page-enter" style={{ maxWidth: 580, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <button onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.84rem', padding: 0 }}>
          <Icon name="arrow-left" size={14} color="var(--text-muted)" /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name={world.icon} size={14} color="var(--accent)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>{world.label}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {idx + 1} / {quizItems.length}
          </span>
        </div>
        {/* progress dots */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {quizItems.map((_, i) => (
            <span key={i} style={{
              width: 7, height: 7, borderRadius: '50%',
              background: i < answers.length
                ? (answers[i] ? 'var(--green-text)' : 'var(--red-text)')
                : i === idx ? 'var(--accent)' : 'var(--border)',
              transition: 'background 0.2s',
            }} />
          ))}
        </div>
      </div>

      <QuizQuestion
        key={idx}
        item={item}
        onAnswer={(correct) => {
          setAnswers(prev => [...prev, correct]);
          setIdx(i => i + 1);
        }}
      />
    </div>
  );
}
