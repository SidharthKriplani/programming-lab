// AutogradModel — Room 7 (Tensors & Autograd). A tiny graph d = a*b + b runs
// forward (define-by-run: the graph records itself as ops execute), then .backward()
// replays the chain rule from d to the leaves. The payoff: b feeds BOTH c and d, so
// its gradient SUMS the two paths. Values + grads are hand-computed (PyTorch isn't in
// Pyodide) but exact. Stepper.
import { useState, useEffect } from 'react';

// a=2, b=3 → c=a*b=6, d=c+b=9 ; ∂d/∂a = b = 3 ; ∂d/∂b = a + 1 = 3
const VAL = { a: 2, b: 3, c: 6, d: 9 };
const STEPS = [
  { note: 'forward: the ops run and the graph records itself as it goes (define-by-run). No gradients yet.', active: [], grads: {} },
  { note: '.backward() seeds the root: d.grad = 1.', active: ['d'], grads: { d: 1 } },
  { note: 'd = c + b → ∂d/∂c = 1 and ∂d/∂b = 1. Push grad back: c.grad = 1, b.grad = 1.', active: ['d', 'c', 'b'], grads: { d: 1, c: 1, b: 1 } },
  { note: 'c = a × b → ∂c/∂a = b = 3, ∂c/∂b = a = 2. Chain rule × c.grad(1): a.grad = 3, and b.grad += 2.', active: ['c', 'a', 'b'], grads: { d: 1, c: 1, a: 3, b: 3 } },
  { note: 'Done. a.grad = 3. b.grad = 3 — b fed BOTH c and d, so its gradient is the SUM of the two paths (2 + 1).', active: ['a', 'b'], grads: { d: 1, c: 1, a: 3, b: 3 }, done: true },
];

export function AutogradModel() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = STEPS[Math.min(i, STEPS.length - 1)];

  useEffect(() => {
    if (!playing) return;
    if (i >= STEPS.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setI(x => Math.min(x + 1, STEPS.length - 1)), 1300);
    return () => clearTimeout(t);
  }, [playing, i]);

  const Node = ({ id, expr }) => {
    const on = step.active.includes(id);
    const g = step.grads[id];
    return (
      <div style={{
        minWidth: 96, padding: '0.5rem 0.7rem', borderRadius: 'var(--radius-sm)', textAlign: 'center',
        border: '1px solid ' + (on ? 'var(--accent)' : 'var(--border)'),
        background: on ? 'var(--accent-bg)' : 'var(--surface)',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: on ? 'var(--accent)' : 'var(--text)' }}>{expr}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>= {VAL[id]}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', marginTop: '0.2rem', color: g !== undefined ? 'var(--green-text)' : 'var(--text-dim)' }}>
          {g !== undefined ? 'grad ' + g : 'grad ·'}
        </div>
      </div>
    );
  };

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', gap: '0.6rem', alignItems: 'center', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>d = a*b + b  (a=2, b=3)</span>
        <span style={{ flex: 1 }} />
        <Btn onClick={() => setI(x => Math.max(0, x - 1))} disabled={i === 0}>◀</Btn>
        <Btn onClick={() => setPlaying(p => !p)} disabled={i >= STEPS.length - 1}>{playing ? 'pause' : 'play'}</Btn>
        <Btn onClick={() => setI(x => Math.min(STEPS.length - 1, x + 1))} disabled={i >= STEPS.length - 1}>▶</Btn>
        <Btn onClick={() => { setI(0); setPlaying(false); }} ghost>reset</Btn>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>{i + 1}/{STEPS.length}</span>
      </div>

      <div style={{ padding: '1.1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.9rem', alignItems: 'center' }}>
        <Node id="d" expr="d = c + b" />
        <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>▲ from c, b</span>
        <Node id="c" expr="c = a × b" />
        <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>▲ from a, b</span>
        <div style={{ display: 'flex', gap: '1.2rem' }}>
          <Node id="a" expr="a" />
          <Node id="b" expr="b" />
        </div>
        <p style={{ margin: '0.2rem 0 0', textAlign: 'center', fontSize: '0.88rem', color: step.done ? 'var(--green-text)' : 'var(--text-secondary)', lineHeight: 1.55, fontWeight: step.done ? 700 : 400, maxWidth: '52ch' }}>{step.note}</p>
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

export default AutogradModel;
