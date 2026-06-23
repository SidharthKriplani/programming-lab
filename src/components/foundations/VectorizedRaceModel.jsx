// VectorizedRaceModel — Room 2 / cost-felt. The glass-box thesis itself: the SAME
// sum-of-squares as a Python loop and as a numpy vectorized op, raced on real
// wall-clock in Pyodide. The numbers are measured, not staged — drag n up and the
// gap widens because the loop pays Python-interpreter overhead per element while
// numpy runs the whole thing in C.
import { useState, useEffect } from 'react';
import { loadPackages, runPythonGlassBox } from '../ide/pyodideRuntime.js';

function ms(x) { return (x < 10 ? x.toFixed(2) : x.toFixed(1)) + ' ms'; }

export function VectorizedRaceModel() {
  const [ready, setReady] = useState(false);
  const [n, setN] = useState(200000);
  const [res, setRes] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let alive = true;
    loadPackages(['numpy']).then(() => { if (alive) setReady(true); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const run = async () => {
    if (!ready || running) return;
    setRunning(true); setRes(null);
    const loop = 'total = 0\nfor i in range(' + n + '):\n    total += i * i\n';
    const vec = 'import numpy as np\na = np.arange(' + n + ', dtype="int64")\ntotal = int((a * a).sum())\n';
    const a = await runPythonGlassBox(loop);
    const b = await runPythonGlassBox(vec);
    setRes({ loopMs: a.timeMs, vecMs: b.timeMs });
    setRunning(false);
  };

  const maxMs = res ? Math.max(res.loopMs, res.vecMs, 0.001) : 1;
  const speedup = res && res.vecMs > 0 ? res.loopMs / res.vecMs : null;

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.7rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>n =</span>
        <input type="range" min={10000} max={1000000} step={10000} value={n} onChange={e => { setN(Number(e.target.value)); setRes(null); }} style={{ flex: 1, minWidth: 150 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', minWidth: 78, textAlign: 'right' }}>{n.toLocaleString()}</span>
        <button onClick={run} disabled={!ready || running} className="pal-btn-primary" style={{ fontSize: '0.82rem', opacity: (!ready || running) ? 0.6 : 1 }}>
          {!ready ? 'warming up numpy…' : running ? 'racing…' : 'Run the race'}
        </button>
      </div>

      <div style={{ padding: '1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        {!res && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>Sum of i² for i in 0…n, two ways. Hit <strong>Run the race</strong> and watch the real wall-clock.</p>}
        {res && (
          <>
            <Bar label="Python loop" timeMs={res.loopMs} frac={res.loopMs / maxMs} hue="var(--red-text)" />
            <Bar label="numpy vectorized" timeMs={res.vecMs} frac={res.vecMs / maxMs} hue="var(--green-text)" />
            {speedup && (
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                numpy was <strong style={{ color: 'var(--green-text)' }}>{speedup >= 10 ? Math.round(speedup) : speedup.toFixed(1)}× faster</strong> on the same answer. The loop pays Python-interpreter cost per element; numpy does it all in C. This is exactly what the glass box measures on every run.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Bar({ label, timeMs, frac, hue }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: 130 }}>{label}</span>
      <div style={{ flex: 1, height: 18, background: 'var(--surface)', borderRadius: 999, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ width: Math.max(3, frac * 100) + '%', height: '100%', background: hue, transition: 'width 0.25s' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text)', minWidth: 72, textAlign: 'right' }}>{ms(timeMs)}</span>
    </div>
  );
}

export default VectorizedRaceModel;
