// CallStackModel — Room 2 / execution. Step a recursive factorial and watch the
// call stack push frames on the way down and pop them (with return values) on the
// way up. Deterministic JS stepper — the animation IS the lesson; the base case is
// what stops it, and a missing base case is what blows the stack.
import { useState, useEffect } from 'react';

function buildSteps(n) {
  const steps = [];
  const stack = [];
  const snap = () => stack.map(f => ({ ...f }));
  // descent: push frames until the base case
  for (let k = n; k >= 0; k--) {
    stack.push({ label: 'fact(' + k + ')', k });
    steps.push({
      stack: snap(),
      note: k > 0 ? 'fact(' + k + ') calls fact(' + (k - 1) + ') — push a frame' : 'fact(0) — base case, returns 1 (this is what stops the recursion)',
      base: k === 0,
    });
  }
  // ascent: unwind, computing return values
  let prev = 1;            // fact(0)
  stack.pop();             // fact(0) returned
  steps.push({ stack: snap(), note: 'fact(0) returned 1 — pop its frame' });
  for (let k = 1; k <= n; k++) {
    const val = k * prev;
    steps.push({ stack: snap(), note: 'fact(' + k + ') = ' + k + ' × ' + prev + ' = ' + val + ' — returns, pop', ret: val });
    stack.pop();
    prev = val;
  }
  steps.push({ stack: [], note: 'fact(' + n + ') = ' + prev, done: true, result: prev });
  return steps;
}

export function CallStackModel() {
  const [n, setN] = useState(4);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = buildSteps(n);
  const step = steps[Math.min(i, steps.length - 1)];

  useEffect(() => { setI(0); setPlaying(false); }, [n]);

  useEffect(() => {
    if (!playing) return;
    if (i >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setI(x => Math.min(x + 1, steps.length - 1)), 750);
    return () => clearTimeout(t);
  }, [playing, i, steps.length]);

  const topIdx = step.stack.length - 1;

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>factorial(n)</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>n =</span>
        <input type="range" min={0} max={6} step={1} value={n} onChange={e => setN(Number(e.target.value))} style={{ flex: '0 0 120px' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', minWidth: 16 }}>{n}</span>
        <span style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 0.1rem' }} />
        <Btn onClick={() => setI(x => Math.max(0, x - 1))} disabled={i === 0}>◀</Btn>
        <Btn onClick={() => setPlaying(p => !p)}>{playing ? 'pause' : 'play'}</Btn>
        <Btn onClick={() => setI(x => Math.min(steps.length - 1, x + 1))} disabled={i >= steps.length - 1}>▶</Btn>
        <Btn onClick={() => { setI(0); setPlaying(false); }} ghost>reset</Btn>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>step {Math.min(i, steps.length - 1) + 1}/{steps.length}</span>
      </div>

      <div style={{ padding: '1rem 0.9rem', display: 'flex', gap: '1.2rem', alignItems: 'flex-end', minHeight: 150 }}>
        {/* the stack, top frame on top */}
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '0.3rem', minWidth: 150 }}>
          <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textAlign: 'center', marginTop: '0.2rem' }}>call stack</div>
          {step.stack.length === 0 && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'center', padding: '0.6rem' }}>(empty)</div>
          )}
          {step.stack.map((f, idx) => {
            const isTop = idx === topIdx;
            return (
              <div key={idx} style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: isTop ? 700 : 500,
                padding: '0.4rem 0.7rem', borderRadius: 'var(--radius-sm)', textAlign: 'center',
                border: '1px solid ' + (isTop ? 'var(--accent)' : 'var(--border)'),
                background: isTop ? 'var(--accent-bg)' : 'var(--surface)',
                color: isTop ? 'var(--accent)' : 'var(--text-muted)',
                display: 'flex', justifyContent: 'space-between', gap: '0.5rem',
              }}>
                <span>{f.label}</span>
                {isTop && step.ret !== undefined && <span style={{ color: 'var(--green-text)' }}>→ {step.ret}</span>}
              </div>
            );
          })}
        </div>

        {/* the narration */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.88rem', color: step.base ? 'var(--green-text)' : 'var(--text-secondary)', lineHeight: 1.55, fontWeight: step.base || step.done ? 700 : 400 }}>{step.note}</p>
          {step.done && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>= {step.result}</div>
          )}
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Each call waits for the one it made. Without the <code>n == 0</code> base case, the stack would push forever — that is a <code>RecursionError</code>.
          </p>
        </div>
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
      background: ghost ? 'transparent' : 'var(--surface)',
      color: ghost ? 'var(--text-dim)' : 'var(--text)',
    }}>{children}</button>
  );
}

export default CallStackModel;
