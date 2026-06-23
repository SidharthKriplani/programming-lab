// ProblemRunner — test-based drill: read the prompt, write the function, run the
// hidden tests in Pyodide, then reveal the solution + glass-box note. Serves both
// the Python drills and pandas banks (pandas passes packages=['pandas']).
import { useState, useEffect } from 'react';
import { PythonCell } from '../components/ide/PythonCell.jsx';
import { loadPython, loadPackages, runProblem } from '../components/ide/pyodideRuntime.js';
import { formatGlassBox } from '../components/ide/glassbox.js';
import { GateOverlay } from '../components/shared/GateOverlay.jsx';
import { ForwardPointerCard } from '../components/shared/ForwardPointerCard.jsx';
import { Icon } from '../components/shared/Icon.jsx';
import { markSeen, markSolved } from '../utils/problemProgress.js';

function Chip({ label, color }) {
  return <span className="pl-chip" style={{ color, borderColor: color, background: 'transparent' }}>{label}</span>;
}

export function ProblemRunner({ problem, patterns, progressKey, packages = [], onBack, onNext, unlocked }) {
  const [code, setCode] = useState(problem.starterCode);
  const [status, setStatus] = useState('idle'); // idle | loading | running | done
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const pat = patterns[problem.pattern] || { label: problem.pattern, accent: 'var(--accent)' };
  const allPass = result && result.total > 0 && result.passed === result.total && !result.error;
  const busy = status === 'loading' || status === 'running';

  useEffect(() => {
    markSeen(progressKey, problem.id);
    setCode(problem.starterCode); setStatus('idle'); setResult(null); setRevealed(false); setProgress('');
  }, [problem.id, progressKey, problem.starterCode]);

  async function runTests() {
    setStatus('loading'); setResult(null);
    try {
      await loadPython(m => setProgress(m));
      if (packages.length) await loadPackages(packages, m => setProgress(m));
    } catch (e) {
      setStatus('idle');
      setResult({ results: [], passed: 0, total: 0, error: 'Failed to load runtime: ' + e.message, stdout: '', timeMs: 0, peakKb: 0 });
      return;
    }
    setStatus('running'); setProgress('');
    const res = await runProblem(code, problem.testSource);
    setResult(res); setStatus('done');
    if (res.total > 0 && res.passed === res.total && !res.error) markSolved(progressKey, problem.id);
  }

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <button onClick={onBack} aria-label="Back" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.5rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Icon name="arrow-left" size={16} color="var(--text-muted)" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <Chip label={pat.label} color={pat.accent} />
            <Chip label={problem.difficulty === 'warmup' ? 'Warmup' : 'Core'} color="var(--text-muted)" />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{problem.title}</h1>
        </div>
      </div>

      {/* Prompt */}
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{problem.prompt}</p>

      {/* Editor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Your solution</div>
        <PythonCell initialCode={problem.starterCode} label="solution.py" glassBox={false} onCodeChange={setCode} height={Math.min(320, 90 + problem.starterCode.split('\n').length * 19)} />
      </div>

      {/* Run tests */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <button onClick={runTests} disabled={busy} className="pal-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
          <Icon name="play" size={14} color="#fff" />
          {busy ? (progress || 'Running…') : 'Run tests'}
        </button>
        {result && !result.error && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: allPass ? 'var(--green-text)' : 'var(--text-muted)' }}>
            {result.passed}/{result.total} passed
          </span>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className={`pal-reveal-in ${allPass ? 'pal-success-ring' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.85rem 1rem', background: 'var(--surface)' }}>
          {result.error ? (
            <pre className="py-output py-error" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result.error}</pre>
          ) : (
            <>
              {result.results.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: r.ok ? 'var(--green-text)' : 'var(--red-text)', fontFamily: 'var(--font-mono)' }}>
                  <Icon name={r.ok ? 'check' : 'x'} size={13} color={r.ok ? 'var(--green-text)' : 'var(--red-text)'} />
                  <span>{r.name}</span>
                </div>
              ))}
              {result.stdout && <pre className="py-output" style={{ margin: '0.3rem 0 0', whiteSpace: 'pre-wrap' }}>{result.stdout}</pre>}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '6px', marginTop: '2px' }}>
                {formatGlassBox({ timeMs: result.timeMs, peakKb: result.peakKb })}
              </div>
              {allPass && <div style={{ fontSize: '0.85rem', color: 'var(--green-text)', fontWeight: 600 }}>All tests pass. Compare with the model solution below.</div>}
            </>
          )}
        </div>
      )}

      {/* Reveal */}
      {!revealed && (
        <button onClick={() => setRevealed(true)} className={allPass ? 'pal-glow-pulse pal-btn-primary' : 'pal-btn-primary'} style={{ alignSelf: 'flex-start' }}>
          Reveal model solution
        </button>
      )}

      {revealed && (
        <GateOverlay unlocked={unlocked} context="gotcha-deep-dive">
          <div className="pal-reveal-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--green-text)' }}>Model solution</div>
              <PythonCell initialCode={problem.solution} label="solution.py" readOnly glassBox={false} height={Math.min(320, 90 + problem.solution.split('\n').length * 19)} />
            </div>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--teal)', borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.9rem' }}>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: '0.25rem' }}>Why it works</div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55 }}>{problem.glassBox.lesson}</p>
            </div>
            <ForwardPointerCard room="problems" onNext={onNext} onNavigate={onBack} />
          </div>
        </GateOverlay>
      )}
    </div>
  );
}

export default ProblemRunner;
