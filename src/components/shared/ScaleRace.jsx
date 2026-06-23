// ScaleRace — the Scale-it format (PYLAB-VISION §3): take a problem's VALID (non-trap)
// methods, predict which one survives at scale, then run them on a small and a large copy
// of the fixture and watch the cost curve diverge. The glass box, made a game.
import { useState } from 'react';
import { pyLabFixtures } from '../../data/pyLabFixtures.js';
import { loadPython, loadPackages, runPyLabBench } from '../ide/pyodideRuntime.js';
import { Icon } from './Icon.jsx';

const SMALL = 300;   // ~hundreds of rows
const LARGE = 5000;  // ~tens of thousands of rows

export function ScaleRace({ problem }) {
  const valid = (problem.methods || []).filter(m => !m.isTrap);
  const fx = pyLabFixtures[problem.fixtureId];
  const [picked, setPicked] = useState(null);
  const [phase, setPhase] = useState('predict'); // predict | racing | done
  const [progress, setProgress] = useState('');
  const [rows, setRows] = useState([]);

  if (valid.length < 2 || !fx) return null;

  async function race() {
    setPhase('racing'); setRows([]);
    try {
      await loadPython(m => setProgress(m));
      await loadPackages(['pandas', 'numpy'], m => setProgress(m));
    } catch (e) {
      setProgress('runtime failed: ' + e.message); return;
    }
    setProgress('');
    const out = [];
    for (const m of valid) {
      const small = await runPyLabBench(m.code, fx.setup, fx.args, SMALL);
      const large = await runPyLabBench(m.code, fx.setup, fx.args, LARGE);
      out.push({ id: m.id, name: m.name, small, large });
      setRows([...out]);
    }
    setPhase('done');
  }

  const ok = rows.filter(r => !r.large.error);
  const winner = ok.length ? ok.reduce((a, b) => (a.large.timeMs <= b.large.timeMs ? a : b)) : null;
  const maxMs = Math.max(1, ...ok.map(r => r.large.timeMs));
  const bigN = ok.length ? ok[0].large.n : 0;
  // a cost lesson: the dial rule whose top-ranked method is the winner, else the winner's tradeoff
  const rule = winner && (problem.dial?.rules || []).find(r => (r.rank || [])[0] === winner.id);
  const lesson = rule ? rule.why : (winner ? (valid.find(m => m.id === winner.id) || {}).tradeoff : '');

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', padding: '0.8rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <Icon name="trending-up" size={15} color="var(--accent)" />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Scale-it race — both are correct; which survives the data?</span>
      </div>

      {phase === 'predict' && (
        <>
          <div style={{ fontSize: '0.88rem', color: 'var(--text)' }}>Predict: which stays fastest as the data grows to tens of thousands of rows?</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {valid.map(m => (
              <button key={m.id} onClick={() => setPicked(m.id)} style={{ textAlign: 'left', padding: '0.45rem 0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid ' + (picked === m.id ? 'var(--accent)' : 'var(--border)'), background: picked === m.id ? 'var(--accent-bg)' : 'var(--surface-2)', color: 'var(--text)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>{m.name}</button>
            ))}
          </div>
          <button onClick={race} disabled={!picked} className="pal-btn-primary" style={{ alignSelf: 'flex-start' }}>Run the race ↗</button>
        </>
      )}

      {phase === 'racing' && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--accent)' }}>{progress || 'racing…'}</div>}

      {rows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>at {bigN.toLocaleString()} rows</div>
          {rows.map(r => {
            const isWin = winner && r.id === winner.id;
            const w = r.large.error ? 0 : Math.round((r.large.timeMs / maxMs) * 100);
            return (
              <div key={r.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)' }}>{r.name}{isWin && <span className="pl-chip" style={{ marginLeft: '0.4rem', color: 'var(--green-text)', borderColor: 'var(--green-border)', background: 'var(--green-bg)' }}>scales best</span>}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{r.large.error ? 'error' : `${r.large.timeMs} ms · ${r.large.peakKb >= 1024 ? (r.large.peakKb / 1024).toFixed(1) + ' MB' : r.large.peakKb + ' KB'}`}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: w + '%', background: isWin ? 'var(--green-text)' : 'var(--accent)' }} />
                </div>
                {!r.large.error && <div style={{ fontSize: '0.66rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>small ({r.small.n.toLocaleString()}): {r.small.timeMs} ms</div>}
              </div>
            );
          })}
        </div>
      )}

      {phase === 'done' && winner && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.55rem', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          <strong style={{ color: picked === winner.id ? 'var(--green-text)' : 'var(--text)' }}>{picked === winner.id ? 'Called it. ' : 'The winner: ' + winner.name + '. '}</strong>
          {lesson}
        </div>
      )}
    </div>
  );
}

export default ScaleRace;
