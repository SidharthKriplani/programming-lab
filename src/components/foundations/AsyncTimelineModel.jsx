// AsyncTimelineModel — Room 5 / concurrency. Three I/O tasks that each await.
// Run them serially (each waits for the last) vs concurrently (await hands control
// back to the loop, so the others run while one waits). Same single thread — the
// concurrent total is the LONGEST wait, not the sum. Toggle and watch the timeline.
import { useState } from 'react';

const TASKS = [
  { id: 'A', dur: 3, hue: 'var(--accent)' },
  { id: 'B', dur: 2, hue: 'var(--teal)' },
  { id: 'C', dur: 2, hue: 'var(--yellow)' },
];
const SUM = TASKS.reduce((a, t) => a + t.dur, 0);   // 7
const MAXDUR = Math.max(...TASKS.map(t => t.dur));  // 3
const SCALE = SUM;                                  // common axis = 7 ticks

export function AsyncTimelineModel() {
  const [mode, setMode] = useState('concurrent');

  let cursor = 0;
  const rows = TASKS.map(t => {
    const start = mode === 'serial' ? cursor : 0;
    if (mode === 'serial') cursor += t.dur;
    return { ...t, start, end: start + t.dur };
  });
  const total = mode === 'serial' ? SUM : MAXDUR;

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>run</span>
        <Seg active={mode === 'serial'} onClick={() => setMode('serial')}>serial (await each)</Seg>
        <Seg active={mode === 'concurrent'} onClick={() => setMode('concurrent')}>concurrent (gather)</Seg>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>total:</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: mode === 'concurrent' ? 'var(--green-text)' : 'var(--red-text)' }}>{total} ticks</span>
      </div>

      <div style={{ padding: '1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {rows.map(r => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', minWidth: 18 }}>{r.id}</span>
            <div style={{ flex: 1, position: 'relative', height: 22, background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{
                position: 'absolute', left: (r.start / SCALE * 100) + '%', width: (r.dur / SCALE * 100) + '%',
                top: 0, bottom: 0, background: r.hue, opacity: 0.85, borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#fff',
              }}>await {r.dur}</div>
            </div>
          </div>
        ))}
        {/* tick axis */}
        <div style={{ display: 'flex', marginLeft: 'calc(18px + 0.6rem)' }}>
          {Array.from({ length: SCALE + 1 }, (_, i) => (
            <span key={i} style={{ flex: i === SCALE ? '0' : '1', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)' }}>{i}</span>
          ))}
        </div>

        <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          {mode === 'concurrent'
            ? 'await hands control back to the event loop, so while A waits, B and C start and wait too — all three overlap. Total = the longest single wait (' + MAXDUR + '), not the sum. Same one thread; it just isn&apos;t sitting idle.'
            : 'Serial awaits block: B can&apos;t begin until A&apos;s wait is over. Three waits back-to-back = ' + SUM + ' ticks. The slow network call you didn&apos;t need to wait for cost you the others.'}
        </p>
      </div>
    </div>
  );
}

function Seg({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
      border: '1px solid ' + (active ? 'var(--accent)' : 'var(--border)'),
      background: active ? 'var(--accent-bg)' : 'var(--surface)', color: active ? 'var(--accent)' : 'var(--text-muted)',
    }}>{children}</button>
  );
}

export default AsyncTimelineModel;
