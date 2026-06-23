// SlidingWindowModel — Room 3 / patterns. A fixed-size window slides across the
// array; instead of re-summing each window (O(n·k)), you add the entering element
// and subtract the leaving one (O(n)). Step it and watch the running sum + max.
import { useState, useEffect } from 'react';

const ARR = [2, 1, 5, 1, 3, 2];
const K = 3;

function buildSteps(arr, k) {
  const s = []; let sum = 0, max = -Infinity;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
    if (i >= k) sum -= arr[i - k];
    if (i >= k - 1) {
      const start = i - k + 1;
      max = Math.max(max, sum);
      const note = start === 0 ? 'first window: add the ' + k + ' elements → sum ' + sum : 'slide: +' + arr[i] + ' (enters) −' + arr[i - k] + ' (leaves) → sum ' + sum;
      s.push({ start, end: i, sum, max, note });
    }
  }
  return s;
}

export function SlidingWindowModel() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const steps = buildSteps(ARR, K);
  const step = steps[Math.min(i, steps.length - 1)];

  useEffect(() => {
    if (!playing) return;
    if (i >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setI(x => Math.min(x + 1, steps.length - 1)), 950);
    return () => clearTimeout(t);
  }, [playing, i, steps.length]);

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', gap: '0.6rem', alignItems: 'center', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>max sum of a window of size {K}</span>
        <span style={{ flex: 1 }} />
        <Btn onClick={() => setI(x => Math.max(0, x - 1))} disabled={i === 0}>◀</Btn>
        <Btn onClick={() => setPlaying(p => !p)} disabled={i >= steps.length - 1}>{playing ? 'pause' : 'play'}</Btn>
        <Btn onClick={() => setI(x => Math.min(steps.length - 1, x + 1))} disabled={i >= steps.length - 1}>▶</Btn>
        <Btn onClick={() => { setI(0); setPlaying(false); }} ghost>reset</Btn>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>{i + 1}/{steps.length}</span>
      </div>

      <div style={{ padding: '1.1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
          {ARR.map((v, idx) => {
            const inWin = idx >= step.start && idx <= step.end;
            return (
              <div key={idx} style={{
                width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', borderRadius: 'var(--radius-sm)',
                border: '1px solid ' + (inWin ? 'var(--accent)' : 'var(--border)'),
                background: inWin ? 'var(--accent-bg)' : 'var(--surface)',
                color: inWin ? 'var(--accent)' : 'var(--text-dim)',
                opacity: inWin ? 1 : 0.55,
              }}>{v}</div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <Stat label="window sum" value={step.sum} hue="var(--accent)" />
          <Stat label="best so far" value={step.max} hue="var(--green-text)" />
        </div>
        <p style={{ margin: 0, textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{step.note}</p>
        <p style={{ margin: 0, textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-dim)' }}>One add + one subtract per slide — never re-sum the window. O(n), not O(n·k).</p>
      </div>
    </div>
  );
}

function Stat({ label, value, hue }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: hue }}>{value}</div>
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

export default SlidingWindowModel;
