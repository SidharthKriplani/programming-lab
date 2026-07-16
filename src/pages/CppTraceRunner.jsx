// CppTraceRunner — steps a compiler-verified CppTrace (cppTraces.js): code pane
// with the current line lit, live stack frames + heap blocks per step, and
// predict-before-step gates. The browser replays RECORDED truth (the verified
// line on every trace names the compiler run) — it never simulates C++.
import { useState } from 'react';
import { Icon } from '../components/shared/Icon.jsx';

function Predict({ p, onAnswer }) {
  const [picked, setPicked] = useState(null);
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.8rem 0.95rem' }}>
      <div style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
        Predict before stepping
      </div>
      <p style={{ margin: '0 0 0.6rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>{p.q}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {p.options.map((o, i) => {
          const chosen = picked === i;
          const correct = picked !== null && i === p.answer;
          return (
            <button key={i} onClick={() => { setPicked(i); onAnswer(i === p.answer); }}
              style={{
                textAlign: 'left', fontSize: '0.82rem', padding: '0.45rem 0.7rem', borderRadius: 8, cursor: 'pointer',
                border: '1px solid ' + (correct ? 'var(--green-border)' : chosen ? 'var(--red-border)' : 'var(--border)'),
                background: correct ? 'var(--green-bg)' : chosen ? 'var(--red-bg)' : 'var(--surface-2)',
                color: 'var(--text)',
              }}>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CppTraceRunner({ trace, onBack }) {
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState({});
  const step = trace.steps[i];
  const gated = step.predict && !answered[i];

  const next = () => { if (i < trace.steps.length - 1) setI(i + 1); };
  const prev = () => { if (i > 0) setI(i - 1); };

  return (
    <div className='pal-page-enter' style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
        <button onClick={onBack} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.5rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }} aria-label='Back'>
          <Icon name='arrow-left' size={16} color='var(--text-muted)' />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>{trace.title}</h1>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--green-text)' }}>
            ✓ {trace.verified}
          </p>
        </div>
        <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>step {i + 1}/{trace.steps.length}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.1fr) minmax(240px, 1fr)', gap: '0.8rem', alignItems: 'start' }}>
        {/* code pane */}
        <pre style={{ margin: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.7rem 0', overflow: 'auto', fontSize: '0.78rem', lineHeight: 1.65, fontFamily: 'var(--font-mono)' }}>
          {trace.code.map((ln, n) => (
            <div key={n} style={{
              padding: '0 0.9rem',
              background: n + 1 === step.line ? 'var(--accent-soft, var(--surface-2))' : 'transparent',
              borderLeft: '3px solid ' + (n + 1 === step.line ? 'var(--accent)' : 'transparent'),
              color: n + 1 === step.line ? 'var(--text)' : 'var(--text-secondary)',
            }}>
              <span style={{ color: 'var(--text-dim)', marginRight: '0.7rem', userSelect: 'none' }}>{String(n + 1).padStart(2, ' ')}</span>
              {ln}
            </div>
          ))}
        </pre>

        {/* machine state */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.8rem' }}>
            <div style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Stack (top first)</div>
            {step.stack.length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>empty</span>}
            {step.stack.map((f, k) => (
              <div key={k} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '0.35rem 0.55rem', marginBottom: '0.35rem', background: k === 0 ? 'var(--surface-2)' : 'transparent' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{f.fn}</div>
                {Object.entries(f.vars).map(([name, val]) => (
                  <div key={name} style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{name} = {val}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.8rem' }}>
            <div style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Heap</div>
            {step.heap.length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>empty</span>}
            {step.heap.map((h, k) => (
              <div key={k} style={{ border: '1px solid ' + (h.freed ? 'var(--red-border)' : 'var(--border)'), borderRadius: 6, padding: '0.35rem 0.55rem', marginBottom: '0.35rem', opacity: h.freed ? 0.55 : 1 }}>
                <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: h.freed ? 'var(--red-text)' : 'var(--text)' }}>
                  {h.addr} · {h.label}{h.freed ? ' · FREED' : ''}
                </div>
                <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{h.value}</div>
              </div>
            ))}
          </div>
          {step.out && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.8rem' }}>
              <div style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', color: 'var(--green-text)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>stdout</div>
              <pre style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{step.out}</pre>
            </div>
          )}
        </div>
      </div>

      {gated
        ? <Predict key={i} p={step.predict} onAnswer={(right) => { if (right) setAnswered(a => ({ ...a, [i]: true })); }} />
        : (
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.95rem' }}>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6 }}>{step.note}</p>
          </div>
        )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {i > 0 && (
          <button onClick={prev} style={{ fontSize: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.85rem', cursor: 'pointer', color: 'var(--text-muted)' }}>Back</button>
        )}
        {i < trace.steps.length - 1
          ? <button onClick={next} disabled={gated} className='pal-btn-primary' style={{ fontSize: '0.8rem', opacity: gated ? 0.5 : 1 }}>
              {gated ? 'Answer the prediction first' : 'Step →'}
            </button>
          : <button onClick={onBack} className='pal-btn-primary' style={{ fontSize: '0.8rem' }}>Done · back to the room</button>}
      </div>
    </div>
  );
}

export default CppTraceRunner;
