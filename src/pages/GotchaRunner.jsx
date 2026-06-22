// GotchaRunner — works one Python gotcha end to end.
// Flow: setup -> predict MCQ -> run the code (real output + glass-box footer)
//       -> reveal (lesson + what the machine does + the fix, runnable) -> copy as post.
// Props: { problem, onBack, onNext, unlocked }
import { useState, useEffect } from 'react';
import { PythonCell } from '../components/ide/PythonCell.jsx';
import { GateOverlay } from '../components/shared/GateOverlay.jsx';
import { ForwardPointerCard } from '../components/shared/ForwardPointerCard.jsx';
import { Icon } from '../components/shared/Icon.jsx';
import { CLUSTERS } from '../data/gotchaProblems.js';
import { markSeen, markSolved } from '../utils/gotchaProgress.js';

function Chip({ label, color }) {
  return (
    <span className="pl-chip" style={{ color, borderColor: color, background: 'transparent' }}>{label}</span>
  );
}

export function GotchaRunner({ problem, onBack, onNext, unlocked }) {
  const [picked, setPicked] = useState(null);   // index the user chose in predict
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const cluster = CLUSTERS[problem.cluster] || { label: problem.cluster, accent: 'var(--accent)' };
  const hasPredict = !!problem.predict;
  const answered = picked !== null;
  const correct = answered && picked === problem.predict.answerIndex;

  useEffect(() => {
    markSeen(problem.id);
    setPicked(null); setRevealed(false); setCopied(false);
  }, [problem.id]);

  function reveal() {
    setRevealed(true);
    markSolved(problem.id);
  }

  async function copyPost() {
    try {
      await navigator.clipboard.writeText(problem.linkedinPost);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <button
          onClick={onBack}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.5rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          aria-label="Back to all gotchas"
        >
          <Icon name="arrow-left" size={16} color="var(--text-muted)" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <Chip label={cluster.label} color={cluster.accent} />
            <Chip label="Warmup" color="var(--text-muted)" />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{problem.title}</h1>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--text-muted)', fontSize: '0.92rem' }}>{problem.hook}</p>
        </div>
      </div>

      {/* Setup */}
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.55 }}>{problem.setup}</p>

      {/* Predict */}
      {hasPredict && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Predict first</div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 600 }}>{problem.predict.question}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {problem.predict.options.map((opt, i) => {
              const isAnswer = i === problem.predict.answerIndex;
              const isPicked = picked === i;
              let bg = 'var(--surface)', border = 'var(--border)', cls = '';
              if (answered) {
                if (isAnswer) { bg = 'var(--green-bg)'; border = 'var(--green-border)'; if (isPicked) cls = 'pal-success-ring'; }
                else if (isPicked) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; cls = 'pal-shake'; }
              }
              return (
                <button
                  key={i}
                  className={cls}
                  onClick={() => { if (!answered) setPicked(i); }}
                  disabled={answered}
                  style={{
                    textAlign: 'left', padding: '0.55rem 0.8rem', borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${border}`, background: bg, cursor: answered ? 'default' : 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}
                >
                  {answered && isAnswer && <Icon name="check" size={14} color="var(--green-text)" />}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          {answered && (
            <div style={{ fontSize: '0.85rem', color: correct ? 'var(--green-text)' : 'var(--text-muted)' }}>
              {correct ? 'Right. Now run it and watch.' : 'Not quite - run it and see what really happens.'}
            </div>
          )}
        </div>
      )}

      {/* The code (runnable, glass-box footer) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Run it</div>
        <PythonCell initialCode={problem.code} label="gotcha.py" height={Math.min(260, 70 + problem.code.split('\n').length * 19)} />
      </div>

      {/* Reveal control */}
      {!revealed && (
        <button
          onClick={reveal}
          className={hasPredict && answered ? 'pal-glow-pulse pal-btn-primary' : 'pal-btn-primary'}
          style={{ alignSelf: 'flex-start' }}
        >
          Reveal what the machine does
        </button>
      )}

      {/* Reveal panel (the "deep dive" — gated when Stripe is live; passthrough in beta) */}
      {revealed && (
        <GateOverlay unlocked={unlocked} context="gotcha-deep-dive">
          <div className="pal-reveal-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Icon name="zap" size={15} color="var(--yellow)" />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--yellow-text)' }}>Why it happens</span>
              </div>
              <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.95rem', lineHeight: 1.6 }}>{problem.glassBox.lesson}</p>
            </div>

            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--teal)', borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.9rem' }}>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: '0.25rem' }}>What the machine does</div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55 }}>{problem.glassBox.whatMachineDoes}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--green-text)' }}>The fix</div>
              <PythonCell initialCode={problem.fix.code} label="fixed.py" height={Math.min(260, 70 + problem.fix.code.split('\n').length * 19)} />
              <p style={{ margin: '0.15rem 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>{problem.fix.note}</p>
            </div>

            <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.9rem' }}>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '0.25rem' }}>The reflex</div>
              <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.55 }}>{problem.debrief}</p>
            </div>

            {/* Copy as LinkedIn post — this lab's content doubles as the daily post */}
            <button
              onClick={copyPost}
              style={{
                alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.45rem',
                background: copied ? 'var(--green-bg)' : 'var(--surface-2)',
                border: `1px solid ${copied ? 'var(--green-border)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.85rem', cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 600, color: copied ? 'var(--green-text)' : 'var(--text)',
              }}
            >
              <Icon name={copied ? 'clipboard-check' : 'copy'} size={14} color={copied ? 'var(--green-text)' : 'var(--text-muted)'} />
              {copied ? 'Copied — ready to post' : 'Copy as LinkedIn post'}
            </button>

            <ForwardPointerCard room="gotchas" onNext={onNext} onNavigate={onBack} />
          </div>
        </GateOverlay>
      )}
    </div>
  );
}

export default GotchaRunner;
