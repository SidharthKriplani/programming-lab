// DecoratorModel — Room 1 / decorators-and-context. A decorator is just
// deco(func) → wrapper. Step a call to a decorated function and watch the name
// resolve to the wrapper, the wrapper run its before/after around the original,
// and the value flow back out. Deterministic stepper — the flow is the lesson.
import { useState, useEffect } from 'react';

const STEPS = [
  { code: 'greet = timer(greet)', note: 'At definition, @timer rebinds the name greet to the wrapper timer returned. The original is captured inside.', at: 'setup' },
  { code: 'greet("Sam")', note: 'You call greet — but greet is the wrapper now, so this really calls wrapper("Sam").', at: 'wrapper' },
  { code: '  # before', note: 'Inside wrapper: the before-code runs (start a timer, log, validate…).', at: 'wrapper' },
  { code: '  return func("Sam")', note: 'wrapper calls func — the original greet — with the same args.', at: 'original' },
  { code: '  → "Hello, Sam"', note: 'The original runs and returns "Hello, Sam" back up into the wrapper.', at: 'original' },
  { code: '  # after', note: 'Back in wrapper: the after-code runs (stop the timer, log the result…).', at: 'wrapper' },
  { code: 'return "Hello, Sam"', note: 'wrapper returns the value to the caller. From the outside it looked like one plain call.', at: 'done' },
];

const NODES = [
  { key: 'wrapper', label: 'wrapper' },
  { key: 'original', label: 'greet (original)' },
];

export function DecoratorModel() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = STEPS[i];

  useEffect(() => {
    if (!playing) return;
    if (i >= STEPS.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setI(x => Math.min(x + 1, STEPS.length - 1)), 1100);
    return () => clearTimeout(t);
  }, [playing, i]);

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', gap: '0.6rem', alignItems: 'center', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>@timer def greet(name): …</span>
        <span style={{ flex: 1 }} />
        <Btn onClick={() => setI(x => Math.max(0, x - 1))} disabled={i === 0}>◀</Btn>
        <Btn onClick={() => setPlaying(p => !p)}>{playing ? 'pause' : 'play'}</Btn>
        <Btn onClick={() => setI(x => Math.min(STEPS.length - 1, x + 1))} disabled={i >= STEPS.length - 1}>▶</Btn>
        <Btn onClick={() => { setI(0); setPlaying(false); }} ghost>reset</Btn>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>{i + 1}/{STEPS.length}</span>
      </div>

      <div style={{ padding: '1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {/* name → wrapper → original flow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: '#fff', background: 'var(--accent)', borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.55rem' }}>greet</span>
          <span style={{ color: 'var(--text-dim)' }}>──▶</span>
          {NODES.map((n, idx) => (
            <span key={n.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.82rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)',
                border: '1px solid ' + (step.at === n.key ? 'var(--accent)' : 'var(--border)'),
                background: step.at === n.key ? 'var(--accent-bg)' : 'var(--surface)',
                color: step.at === n.key ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: step.at === n.key ? 700 : 400,
              }}>{n.label}</span>
              {idx < NODES.length - 1 && <span style={{ color: 'var(--text-dim)' }}>calls ▶</span>}
            </span>
          ))}
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem' }}>{step.code}</div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: step.at === 'done' ? 'var(--green-text)' : 'var(--text-secondary)', lineHeight: 1.55, fontWeight: step.at === 'done' ? 600 : 400 }}>{step.note}</p>
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

export default DecoratorModel;
