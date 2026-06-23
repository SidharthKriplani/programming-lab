// BinarySearchModel — Room 3 / patterns. On a SORTED array, check the middle and
// throw away half the search space each step — O(log n). Step lo/mid/hi and watch
// the live range shrink toward the target (or close to nothing if it's absent).
import { useState, useEffect } from 'react';

const ARR = [1, 4, 7, 9, 12, 15, 18, 21];

function buildSteps(arr, target) {
  const s = []; let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) { s.push({ lo, hi, mid, note: 'a[mid] = ' + arr[mid] + ' == target → found at index ' + mid, found: true }); return s; }
    if (arr[mid] < target) { s.push({ lo, hi, mid, note: 'a[mid] = ' + arr[mid] + ' < ' + target + ' → discard the left half, search right' }); lo = mid + 1; }
    else { s.push({ lo, hi, mid, note: 'a[mid] = ' + arr[mid] + ' > ' + target + ' → discard the right half, search left' }); hi = mid - 1; }
  }
  s.push({ lo, hi, mid: -1, note: 'lo passed hi — ' + target + ' is not in the array', done: true });
  return s;
}

export function BinarySearchModel() {
  const [target, setTarget] = useState(15);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const steps = buildSteps(ARR, target);
  const step = steps[Math.min(i, steps.length - 1)];

  useEffect(() => { setI(0); setPlaying(false); }, [target]);
  useEffect(() => {
    if (!playing) return;
    if (i >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setI(x => Math.min(x + 1, steps.length - 1)), 950);
    return () => clearTimeout(t);
  }, [playing, i, steps.length]);

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', gap: '0.6rem', alignItems: 'center', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>target</span>
        <select value={target} onChange={e => setTarget(Number(e.target.value))} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', padding: '0.2rem 0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
          {[1, 4, 7, 9, 12, 15, 18, 21, 10].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <span style={{ flex: 1 }} />
        <Btn onClick={() => setI(x => Math.max(0, x - 1))} disabled={i === 0}>◀</Btn>
        <Btn onClick={() => setPlaying(p => !p)} disabled={i >= steps.length - 1}>{playing ? 'pause' : 'play'}</Btn>
        <Btn onClick={() => setI(x => Math.min(steps.length - 1, x + 1))} disabled={i >= steps.length - 1}>▶</Btn>
        <Btn onClick={() => { setI(0); setPlaying(false); }} ghost>reset</Btn>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>{i + 1}/{steps.length}</span>
      </div>

      <div style={{ padding: '1.1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
          {ARR.map((v, idx) => {
            const inRange = idx >= step.lo && idx <= step.hi;
            const isMid = idx === step.mid;
            const win = step.found && isMid;
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{
                  width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', borderRadius: 'var(--radius-sm)',
                  border: '1px solid ' + (win ? 'var(--green-text)' : isMid ? 'var(--accent)' : inRange ? 'var(--border)' : 'var(--border)'),
                  background: win ? 'var(--green-bg)' : isMid ? 'var(--accent-bg)' : 'var(--surface)',
                  color: win ? 'var(--green-text)' : isMid ? 'var(--accent)' : inRange ? 'var(--text)' : 'var(--text-dim)',
                  opacity: inRange ? 1 : 0.35,
                }}>{v}</div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: isMid ? 'var(--accent)' : 'var(--text-dim)', height: 12 }}>{idx === step.lo && idx === step.hi ? 'lo·hi' : isMid ? 'mid' : idx === step.lo ? 'lo' : idx === step.hi ? 'hi' : ''}</span>
              </div>
            );
          })}
        </div>
        <p style={{ margin: 0, textAlign: 'center', fontSize: '0.88rem', color: step.found ? 'var(--green-text)' : step.done ? 'var(--red-text)' : 'var(--text-secondary)', lineHeight: 1.55, fontWeight: step.found || step.done ? 700 : 400 }}>{step.note}</p>
        <p style={{ margin: 0, textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-dim)' }}>Half the candidates gone every step — 8 → 4 → 2 → 1. That is O(log n). (Try 10 — it isn&apos;t there.)</p>
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

export default BinarySearchModel;
