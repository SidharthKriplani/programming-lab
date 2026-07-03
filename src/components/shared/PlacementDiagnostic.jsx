// PlacementDiagnostic — the "find my level" quiz (PYLAB-VISION §5). A short, self-contained
// concept quiz (no Pyodide) that places the learner on the seniority ladder and hands the
// result back to PyLabBrowser (which sets the role + level filter). Placement persists in
// localStorage so the readiness view can show it. Pure UI: 9 MCQs across fluency / correctness
// / judgment; the placement is the first ladder rung the learner does NOT clear.
import { useState } from 'react';
import { ROLES, ROLE_ORDER, LEVELS } from '../../data/pyLabMeta.js';
import { Icon } from './Icon.jsx';

const KEY = 'pl-placement-v1';

export function savePlacement(role, level) {
  try { localStorage.setItem(KEY, JSON.stringify({ role, level, ts: Date.now() })); } catch { /* ignore */ }
}
export function getPlacement() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
}

// Each question: level it probes, prompt, options, and the index of the correct one.
const QUESTIONS = [
  { level: 'fluency', q: 'Which expression returns the number of ROWS in a DataFrame df?', options: ['len(df)', 'df.size', 'df.rows', 'df.count()'], answer: 0 },
  { level: 'fluency', q: 'How do you get the distinct values of a Series s?', options: ['s.distinct()', 's.unique()', 's.set()', 's.groupby()'], answer: 1 },
  { level: 'fluency', q: 'What does [x * 2 for x in nums] produce?', options: ['the sum of nums', 'a doubled copy of each element', 'nums sorted', 'the even numbers'], answer: 1 },
  { level: 'correctness', q: 'By default, df.groupby("k")["v"].sum() with a missing (NaN) value in column k...', options: ['keeps NaN as its own group', 'raises an error', 'silently drops the NaN-key rows', 'fills NaN with 0'], answer: 2 },
  { level: 'correctness', q: 'Does sorted(set(items)) keep the items in their first-seen order?', options: ['Yes, order is preserved', 'No, it returns them sorted', 'Only for strings', 'Only if items are unique'], answer: 1 },
  { level: 'correctness', q: 'A function def f(x, acc=[]): ... — is the default list acc shared across calls?', options: ['No, a fresh list each call', 'Yes, one list is reused across calls', 'Only if you mutate it', 'Only in Python 2'], answer: 1 },
  { level: 'judgment', q: 'To attach a price by merging, when the price table has a DUPLICATE key, you should first...', options: ['use how="left"', 'dedup the price table to one row per key', 'sort both frames', 'nothing — merge handles it'], answer: 1 },
  { level: 'judgment', q: 'When standardizing a test set (z-score), the mean and std should come from...', options: ['the test set itself', 'the training set', 'both combined', 'whichever is larger'], answer: 1 },
  { level: 'judgment', q: 'Which gives category SHARES that sum to 1?', options: ['value_counts()', 'value_counts(normalize=True)', 'groupby().size()', 'nunique()'], answer: 1 },
];

const LADDER = ['fluency', 'correctness', 'judgment', 'systems'];

// Placement = the first rung where the learner got fewer than 2 of that rung's 3 questions right.
// Clear all three rungs -> systems.
function placeLevel(correctByLevel) {
  for (const lvl of ['fluency', 'correctness', 'judgment']) {
    if ((correctByLevel[lvl] || 0) < 2) return lvl;
  }
  return 'systems';
}

const btn = { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 600 };

export function PlacementDiagnostic({ onPlace, onExit }) {
  const [role, setRole] = useState('all');
  const [answers, setAnswers] = useState({});   // qIndex -> optionIndex
  const [result, setResult] = useState(null);   // placed level

  const allAnswered = Object.keys(answers).length === QUESTIONS.length;

  function submit() {
    const correctByLevel = {};
    QUESTIONS.forEach((q, i) => {
      if (answers[i] === q.answer) correctByLevel[q.level] = (correctByLevel[q.level] || 0) + 1;
    });
    const level = placeLevel(correctByLevel);
    savePlacement(role, level);
    setResult(level);
  }

  return (
    <div className="pal-page-enter" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <button onClick={onExit} style={{ ...btn, padding: '0.35rem 0.5rem' }} aria-label="Back">
          <Icon name="arrow-left" size={16} color="var(--text)" />
        </button>
        <Icon name="target" size={20} color="var(--accent)" />
        <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)' }}>Find my level</h1>
      </div>

      {!result && (
        <>
          <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Nine quick concept questions place you on the ladder (Fluency → Systems). No code to run — pick the best answer. Choose your target role to tailor the readiness view.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Target role:</span>
            <select value={role} onChange={e => setRole(e.target.value)} style={{ padding: '0.35rem 0.55rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '0.84rem' }}>
              <option value="all">All roles</option>
              {ROLE_ORDER.map(r => <option key={r} value={r}>{ROLES[r]}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {QUESTIONS.map((q, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', padding: '0.85rem 1rem' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.6rem' }}>
                  <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginRight: '0.4rem' }}>{i + 1}.</span>{q.q}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {q.options.map((opt, j) => {
                    const chosen = answers[i] === j;
                    return (
                      <button key={j} onClick={() => setAnswers(a => ({ ...a, [i]: j }))} style={{ textAlign: 'left', padding: '0.45rem 0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid ' + (chosen ? 'var(--accent)' : 'var(--border)'), background: chosen ? 'var(--accent-bg)' : 'var(--surface-2)', color: chosen ? 'var(--accent)' : 'var(--text)', cursor: 'pointer', fontSize: '0.86rem', fontWeight: chosen ? 700 : 500 }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '1.2rem' }}>
            <button onClick={submit} disabled={!allAnswered} className="pal-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', opacity: allAnswered ? 1 : 0.5 }}>
              <Icon name="check" size={14} color="currentColor" /> See my placement
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{Object.keys(answers).length} / {QUESTIONS.length} answered</span>
          </div>
        </>
      )}

      {result && (
        <div className="pal-reveal-in" style={{ border: '1px solid var(--accent-border)', background: 'var(--accent-bg)', borderRadius: 'var(--radius)', padding: '1.1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>You are placed at</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>{LEVELS[result].label}</div>
          <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{LEVELS[result].sub}. Start here — clear this rung, then the readiness view will point you up the ladder{role !== 'all' ? ' for ' + ROLES[role] : ''}.</div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
            <button onClick={() => onPlace(role === 'all' ? null : role, result)} className="pal-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              Show me {LEVELS[result].label} problems →
            </button>
            <button onClick={() => { setResult(null); setAnswers({}); }} style={btn}>Retake</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlacementDiagnostic;
