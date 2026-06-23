// RefactorChallenge — the Refactor format (PYLAB-VISION §3): here is code that WORKS but is
// slow. Rewrite it. Graded twice — it must still be correct (runPyLab vs the canonical), and
// it must actually beat the baseline at scale (runPyLabBenchFull, user vs slow). Opt-in panel
// in the reveal, so the heavy editor only mounts when the learner wants the challenge.
import { useState } from 'react';
import { pyLabFixtures } from '../../data/pyLabFixtures.js';
import { PythonCell } from '../ide/PythonCell.jsx';
import { loadPython, loadPackages, runPyLab, runPyLabBenchFull } from '../ide/pyodideRuntime.js';
import { Icon } from './Icon.jsx';

const TARGET_ROWS = 5000;

export function RefactorChallenge({ problem, refactor }) {
  const fx = pyLabFixtures[problem.fixtureId];
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(refactor?.slowCode || '');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [res, setRes] = useState(null); // { correct, message, error, speedup, slowMs, userMs, n }

  if (!refactor || !refactor.slowCode || !fx) return null;
  const editorH = Math.min(380, 120 + refactor.slowCode.split('\n').length * 19);

  async function run() {
    setBusy(true); setRes(null);
    try {
      await loadPython(m => setProgress(m));
      await loadPackages(['pandas', 'numpy'], m => setProgress(m));
    } catch (e) { setBusy(false); setRes({ error: 'runtime failed: ' + e.message }); return; }
    setProgress('');
    const correctness = await runPyLab(code, problem.solution, fx.setup, fx.args, problem.compare);
    if (correctness.error || !correctness.pass) {
      setRes({ correct: false, message: correctness.error || correctness.message }); setBusy(false); return;
    }
    const base = await runPyLabBenchFull(refactor.slowCode, fx.setup, fx.args, 1);
    const factor = Math.max(50, Math.round(TARGET_ROWS / Math.max(1, base.n || 1)));
    const slow = await runPyLabBenchFull(refactor.slowCode, fx.setup, fx.args, factor);
    const user = await runPyLabBenchFull(code, fx.setup, fx.args, factor);
    const speedup = (slow.timeMs > 0 && user.timeMs > 0) ? slow.timeMs / user.timeMs : 1;
    setRes({ correct: true, speedup, slowMs: slow.timeMs, userMs: user.timeMs, n: user.n });
    setBusy(false);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--yellow-border, var(--border))', background: 'var(--yellow-bg, var(--surface-2))', color: 'var(--text)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
        <Icon name="zap" size={14} color="var(--yellow-text, var(--accent))" /> Refactor challenge — this version works but is slow. Beat it ↗
      </button>
    );
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', padding: '0.8rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <Icon name="zap" size={15} color="var(--yellow-text, var(--accent))" />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Refactor — keep it correct, make it fast</span>
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{refactor.note}</div>

      <PythonCell initialCode={refactor.slowCode} label="refactor.py" glassBox onCodeChange={setCode} height={editorH} />

      <button onClick={run} disabled={busy} className="pal-btn-primary" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
        <Icon name="check" size={14} color="currentColor" /> {busy ? (progress || 'Grading…') : 'Submit refactor'}
      </button>

      {res && res.error && <div style={{ fontSize: '0.84rem', color: 'var(--red-text)' }}>{res.error}</div>}
      {res && res.correct === false && (
        <div style={{ border: '1px solid var(--red-border)', background: 'var(--red-bg)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.8rem', fontSize: '0.85rem', color: 'var(--red-text)', fontWeight: 600 }}>
          Not correct yet — fix the output before optimizing.{res.message ? ' ' + String(res.message).split('\n').slice(-2).join(' ') : ''}
        </div>
      )}
      {res && res.correct && (
        <div style={{ border: '1px solid var(--green-border)', background: 'var(--green-bg)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: res.speedup >= 1.5 ? 'var(--green-text)' : 'var(--text)' }}>
            {res.speedup >= 1.5 ? `Correct — and ${res.speedup.toFixed(res.speedup >= 10 ? 0 : 1)}× faster at ${res.n.toLocaleString()} rows.` : 'Correct — but no faster than the baseline. The smell is still there.'}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            baseline {res.slowMs} ms · yours {res.userMs} ms
          </div>
        </div>
      )}
    </div>
  );
}

export default RefactorChallenge;
