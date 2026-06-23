// TwoPointerModel — Room 3 / patterns. On a SORTED array, two pointers converge:
// if the pair-sum is too small move the left one right, too big move the right one
// left. Sorted order is what lets you decide — O(n), no nested loop. Stepper.
import { useState, useEffect } from 'react';

const ARR = [2, 3, 5, 8, 11, 14];

function buildSteps(arr, target) {
  const s = []; let lo = 0, hi = arr.length - 1;
  while (lo < hi) {
    const sum = arr[lo] + arr[hi];
    if (sum === target) { s.push({ lo, hi, sum, note: 'sum == target → found ' + arr[lo] + ' + ' + arr[hi], found: true }); return s; }
    if (sum < target) { s.push({ lo, hi, sum, note: 'sum ' + sum + ' < ' + target + ' → too small, move left pointer right' }); lo++; }
    else { s.push({ lo, hi, sum, note: 'sum ' + sum + ' > ' + target + ' → too big, move right pointer left' }); hi--; }
  }
  s.push({ lo, hi, sum: null, note: 'pointers met — no two values sum to ' + target, done: true });
  return s;
}

export function TwoPointerModel() {
  const [target, setTarget] = useState(19);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const steps = buildSteps(ARR, target);
  const step = steps[Math.min(i, steps.length - 1)];

  useEffect(() => { setI(0); setPlaying(false); }, [target]);
  useEffect(() => {
    if (!playing) return;
    if (i >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setI(x => Math.min(x + 1, steps.length - 1)), 850);
    return () => clearTimeout(t);
  }, [playing, i, steps.length]);

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', gap: '0.6rem', alignItems: 'center', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>target</span>
        <input type="range" min={5} max={28} step={1} value={target} onChange={e => setTarget(Number(e.target.value))} style={{ flex: '0 0 110px' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', minWidth: 22 }}>{target}</span>
        <span style={{ flex: 1 }} />
        <Btn onClick={() => setI(x => Math.max(0, x - 1))} disabled={i === 0}>◀</Btn>
        <Btn onClick={() => setPlaying(p => !p)} disabled={i >= steps.length - 1}>{playing ? 'pause' : 'play'}</Btn>
        <Btn onClick={() => setI(x => Math.min(steps.length - 1, x + 1))} disabled={i >= steps.length - 1}>▶</Btn>
        <Btn onClick={() => { setI(0); setPlaying(false); }} ghost>reset</Btn>
      </div>

      <div style={{ padding: '1.1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
          {ARR.map((v, idx) => {
            const isLo = idx === step.lo, isHi = idx === step.hi;
            const active = isLo || isHi;
            const win = step.found && active;
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{
                  width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid ' + (win ? 'var(--green-text)' : active ? 'var(--accent)' : 'var(--border)'),
                  background: win ? 'var(--green-bg)' : active ? 'var(--accent-bg)' : 'var(--surface)',
                  color: win ? 'var(--green-text)' : active ? 'var(--accent)' : 'var(--text)',
                }}>{v}</div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: active ? 'var(--accent)' : 'var(--text-dim)', height: 12 }}>{isLo && isHi ? 'lo·hi' : isLo ? 'lo' : isHi ? 'hi' : ''}</span>
              </div>
            );
          })}
        </div>
        <p style={{ margin: 0, textAlign: 'center', fontSize: '0.88rem', color: step.found ? 'var(--green-text)' : step.done ? 'var(--red-text)' : 'var(--text-secondary)', lineHeight: 1.55, fontWeight: step.found || step.done ? 700 : 400 }}>{step.note}</p>
        <p style={{ margin: 0, textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-dim)' }}>Sorted order is the trick: one comparison tells you which pointer to move. O(n), not the O(n²) nested loop.</p>
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

export default TwoPointerModel;
