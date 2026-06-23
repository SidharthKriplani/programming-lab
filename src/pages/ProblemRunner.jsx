// ProblemRunner — two-pane solve view, modeled on PAL's SQL Lab.
// Left: prompt + a DATA panel (the example input) + an EXPECTED OUTPUT panel
//       (computed LIVE from the canonical solution, the SQL-Lab trick).
// Right: editor + Run (scratch) + Submit (hidden tests, targeted feedback) + timer.
import { useState, useEffect, useRef } from 'react';
import { PythonCell } from '../components/ide/PythonCell.jsx';
import { loadPython, loadPackages, runProblem, previewExample } from '../components/ide/pyodideRuntime.js';
import { formatGlassBox } from '../components/ide/glassbox.js';
import { GateOverlay } from '../components/shared/GateOverlay.jsx';
import { ForwardPointerCard } from '../components/shared/ForwardPointerCard.jsx';
import { Icon } from '../components/shared/Icon.jsx';
import { markSeen, markSolved, getProgress } from '../utils/problemProgress.js';

function Chip({ label, color }) {
  return <span className="pl-chip" style={{ color, borderColor: color, background: 'transparent' }}>{label}</span>;
}

function DataTable({ columns, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
        <thead>
          <tr>{columns.map((c, i) => <th key={i} style={{ textAlign: 'left', padding: '4px 10px', color: 'var(--accent)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((v, j) => <td key={j} style={{ padding: '3px 10px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' }}>{v}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DataView({ data }) {
  if (!data) return null;
  if (data.kind === 'df') {
    return (
      <>
        <DataTable columns={data.columns} rows={data.rows} />
        {data.shape && data.shape[0] > data.rows.length && (
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{data.shape[0]} rows × {data.shape[1]} cols (showing {data.rows.length})</div>
        )}
      </>
    );
  }
  if (data.kind === 'series') {
    return <DataTable columns={['index', data.name]} rows={data.index.map((ix, i) => [ix, data.values[i]])} />;
  }
  return <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '12.5px', color: 'var(--text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{data.repr}</pre>;
}

function Panel({ label, accent, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent || 'var(--text-muted)', padding: '0.5rem 0.85rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>{label}</div>
      <div style={{ padding: '0.7rem 0.85rem' }}>{children}</div>
    </div>
  );
}

export function ProblemRunner({ problem, patterns, progressKey, packages = [], onBack, onNext, unlocked }) {
  const [code, setCode] = useState(problem.starterCode);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewState, setPreviewState] = useState('loading'); // loading | ready | none
  const [elapsed, setElapsed] = useState(0);

  const pat = patterns[problem.pattern] || { label: problem.pattern, accent: 'var(--accent)' };
  const allPass = result && result.total > 0 && result.passed === result.total && !result.error;
  const attempts = (getProgress(progressKey).seen[problem.id] ? 1 : 0);

  // elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // load runtime + compute the example input + expected output (live from solution)
  useEffect(() => {
    let cancelled = false;
    markSeen(progressKey, problem.id);
    setPreviewState('loading'); setPreview(null);
    (async () => {
      try {
        await loadPython(m => { if (!cancelled) setProgress(m); });
        if (packages.length) await loadPackages(packages, m => { if (!cancelled) setProgress(m); });
        if (!problem.example || !problem.example.call) { if (!cancelled) setPreviewState('none'); return; }
        const p = await previewExample(problem.solution, problem.example.setup, problem.example.call, problem.example.inputs);
        if (!cancelled) { setPreview(p); setPreviewState(p && !p.error ? 'ready' : 'none'); setProgress(''); }
      } catch {
        if (!cancelled) setPreviewState('none');
      }
    })();
    return () => { cancelled = true; };
  }, [problem.id, progressKey]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit() {
    setSubmitting(true); setResult(null);
    try {
      await loadPython(m => setProgress(m));
      if (packages.length) await loadPackages(packages, m => setProgress(m));
    } catch (e) {
      setSubmitting(false);
      setResult({ results: [], passed: 0, total: 0, error: 'Failed to load runtime: ' + e.message, stdout: '', timeMs: 0, peakKb: 0 });
      return;
    }
    setProgress('');
    const res = await runProblem(code, problem.testSource);
    setResult(res); setSubmitting(false);
    if (res.total > 0 && res.passed === res.total && !res.error) markSolved(progressKey, problem.id);
  }

  const mins = Math.floor(elapsed / 60), secs = String(elapsed % 60).padStart(2, '0');
  const editorH = Math.min(360, 120 + problem.starterCode.split('\n').length * 19);

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.7rem', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          <Icon name="arrow-left" size={15} color="var(--text-muted)" /> Browse
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          <Icon name="clock" size={13} color="var(--text-dim)" /> {mins}:{secs} elapsed · Ctrl+Enter to run
        </div>
      </div>

      {/* two-pane */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(420px, 100%), 1fr))', gap: '1.1rem', alignItems: 'start' }}>

        {/* LEFT — problem + data + expected */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${pat.accent}`, borderRadius: 'var(--radius)', padding: '0.9rem 1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.45rem' }}>
              <Chip label={pat.label} color={pat.accent} />
              <Chip label={problem.difficulty === 'warmup' ? 'Warmup' : problem.difficulty === 'stretch' ? 'Stretch' : 'Core'} color="var(--text-muted)" />
            </div>
            <h1 style={{ margin: '0 0 0.4rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{problem.title}</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>{problem.prompt}</p>
          </div>

          {previewState === 'loading' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span className="animate-spin" style={{ display: 'inline-block' }}>⟳</span> {progress || 'Loading runtime + computing example…'}
            </div>
          )}
          {previewState === 'ready' && preview && (
            <>
              {preview.inputs && preview.inputs.length > 0 && (
                <Panel label={preview.inputs.length > 1 ? 'Example inputs' : 'Example input'} accent="var(--teal)">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                    {preview.inputs.map(inp => (
                      <div key={inp.name}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--teal)', marginBottom: '3px' }}>{inp.name}</div>
                        <DataView data={inp} />
                      </div>
                    ))}
                  </div>
                </Panel>
              )}
              {problem.example && problem.example.call && (preview.inputs.length === 0) && (
                <Panel label="Example call" accent="var(--teal)">
                  <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '12.5px', color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{problem.example.call}</pre>
                </Panel>
              )}
              {preview.output && (
                <Panel label="Expected output" accent="var(--green-text)">
                  <DataView data={preview.output} />
                </Panel>
              )}
            </>
          )}

          {attempts > 0 && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Past attempts: {attempts}</div>
          )}
        </div>

        {/* RIGHT — editor + run/submit + results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <PythonCell initialCode={problem.starterCode} label="solution.py" glassBox onCodeChange={setCode} height={editorH} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap' }}>
            <button onClick={submit} disabled={submitting} className={allPass ? 'pal-btn-primary' : 'pal-btn-primary'} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              <Icon name="check" size={14} color="#fff" /> {submitting ? (progress || 'Submitting…') : 'Submit'}
            </button>
            {result && !result.error && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: allPass ? 'var(--green-text)' : 'var(--red-text)' }}>{result.passed}/{result.total} checks pass</span>
            )}
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>· the editor's ▶ Run executes your code for a scratch look</span>
          </div>

          {result && (
            <div className={`pal-reveal-in ${allPass ? 'pal-success-ring' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.8rem 0.95rem', background: 'var(--surface)' }}>
              {result.error ? (
                <>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--red-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your code raised</div>
                  <pre className="py-output py-error" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result.error}</pre>
                </>
              ) : (
                <>
                  {result.results.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: r.ok ? 'var(--green-text)' : 'var(--red-text)', fontFamily: 'var(--font-mono)' }}>
                      <Icon name={r.ok ? 'check' : 'x'} size={13} color={r.ok ? 'var(--green-text)' : 'var(--red-text)'} />
                      <span>{r.name}</span>
                    </div>
                  ))}
                  {!allPass && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {result.passed} of {result.total} pass. Check the failing case against the expected output on the left.
                    </div>
                  )}
                  {result.stdout && <pre className="py-output" style={{ margin: '0.2rem 0 0', whiteSpace: 'pre-wrap' }}>{result.stdout}</pre>}
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '5px', marginTop: '2px' }}>{formatGlassBox({ timeMs: result.timeMs, peakKb: result.peakKb })}</div>
                  {allPass && <div style={{ fontSize: '0.85rem', color: 'var(--green-text)', fontWeight: 600 }}>All checks pass. Compare with the model solution.</div>}
                </>
              )}
            </div>
          )}

          {!revealed ? (
            <button onClick={() => setRevealed(true)} className={allPass ? 'pal-glow-pulse pal-btn-primary' : 'pal-btn-primary'} style={{ alignSelf: 'flex-start', background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
              Reveal model solution
            </button>
          ) : (
            <GateOverlay unlocked={unlocked} context="gotcha-deep-dive">
              <div className="pal-reveal-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', borderTop: '1px solid var(--border)', paddingTop: '0.9rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--green-text)' }}>Model solution</div>
                <PythonCell initialCode={problem.solution} label="solution.py" readOnly glassBox={false} height={Math.min(320, 90 + problem.solution.split('\n').length * 19)} />
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--teal)', borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.9rem' }}>
                  <div style={{ fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: '0.25rem' }}>Why it works</div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55 }}>{problem.glassBox.lesson}</p>
                </div>
                <ForwardPointerCard room="problems" onNext={onNext} onNavigate={onBack} />
              </div>
            </GateOverlay>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProblemRunner;
