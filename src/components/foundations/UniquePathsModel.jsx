// UniquePathsModel — Room 6 (Competitive Programming) / dynamic programming.
// Count paths through a grid moving only right/down. Each interior cell = the cell
// above + the cell to the left (the recurrence); edges are 1. Fill the table and
// watch each cell pull from its two neighbours — that reuse is what makes DP O(R·C)
// instead of exponential. Stepper.
import { useState, useEffect } from 'react';

const R = 3, C = 4;

function buildSteps() {
  const g = Array.from({ length: R }, () => Array(C).fill(null));
  const steps = [];
  for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) {
    let val, top = null, left = null, note;
    if (i === 0 || j === 0) { val = 1; note = 'edge cell → 1 (only one way in: straight along the border)'; }
    else { top = [i - 1, j]; left = [i, j - 1]; val = g[i - 1][j] + g[i][j - 1]; note = 'interior = top (' + g[i - 1][j] + ') + left (' + g[i][j - 1] + ') = ' + val; }
    g[i][j] = val;
    const last = i === R - 1 && j === C - 1;
    steps.push({ i, j, top, left, vals: g.map(r => r.slice()), note: last ? ('bottom-right = ' + val + ' — that many unique paths') : note, done: last });
  }
  return steps;
}

const STEPS = buildSteps();

export function UniquePathsModel() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = STEPS[Math.min(i, STEPS.length - 1)];

  useEffect(() => {
    if (!playing) return;
    if (i >= STEPS.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setI(x => Math.min(x + 1, STEPS.length - 1)), 600);
    return () => clearTimeout(t);
  }, [playing, i]);

  const isSrc = (r, c) => (step.top && step.top[0] === r && step.top[1] === c) || (step.left && step.left[0] === r && step.left[1] === c);

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', gap: '0.6rem', alignItems: 'center', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>paths through a {R}×{C} grid (right/down only)</span>
        <span style={{ flex: 1 }} />
        <Btn onClick={() => setI(x => Math.max(0, x - 1))} disabled={i === 0}>◀</Btn>
        <Btn onClick={() => setPlaying(p => !p)} disabled={i >= STEPS.length - 1}>{playing ? 'pause' : 'play'}</Btn>
        <Btn onClick={() => setI(x => Math.min(STEPS.length - 1, x + 1))} disabled={i >= STEPS.length - 1}>▶</Btn>
        <Btn onClick={() => { setI(0); setPlaying(false); }} ghost>reset</Btn>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>{i + 1}/{STEPS.length}</span>
      </div>

      <div style={{ padding: '1.1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.9rem', alignItems: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + C + ', 44px)', gap: 5 }}>
          {STEPS[0].vals.map((_, r) => step.vals[r].map((v, c) => {
            const cur = r === step.i && c === step.j;
            const src = isSrc(r, c);
            const filled = step.vals[r][c] !== null;
            const win = cur && step.done;
            return (
              <div key={r + '-' + c} style={{
                width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', borderRadius: 'var(--radius-sm)',
                border: '1px solid ' + (win ? 'var(--green-text)' : cur ? 'var(--accent)' : src ? 'var(--teal)' : 'var(--border)'),
                background: win ? 'var(--green-bg)' : cur ? 'var(--accent-bg)' : src ? 'var(--surface)' : 'var(--surface)',
                color: win ? 'var(--green-text)' : cur ? 'var(--accent)' : src ? 'var(--teal)' : filled ? 'var(--text)' : 'var(--text-dim)',
                opacity: filled ? 1 : 0.35,
              }}>{filled ? step.vals[r][c] : ''}</div>
            );
          }))}
        </div>
        <p style={{ margin: 0, textAlign: 'center', fontSize: '0.88rem', color: step.done ? 'var(--green-text)' : 'var(--text-secondary)', lineHeight: 1.55, fontWeight: step.done ? 700 : 400 }}>{step.note}</p>
        <p style={{ margin: 0, textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-dim)' }}>Each cell is computed once and reused by the cells below and right — overlapping subproblems solved once. That is dynamic programming.</p>
      </div>
    </div>
  );
}

function Btn({ onClick, children, ghost, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600,
      padding: '0.28rem 0.6rem', borderRadius: 'var(--radius-sm)', cursor: disabled ? 'default' : 'pointer',
      border: '1px solid var(--border)', opacity: disabled ? 0.45 : 1,
      background: ghost ? 'transparent' : 'var(--surface)', color: ghost ? 'var(--text-dim)' : 'var(--text)',
    }}>{children}</button>
  );
}

export default UniquePathsModel;
