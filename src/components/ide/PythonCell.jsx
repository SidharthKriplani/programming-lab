import { useState, useRef, useEffect } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { loadPython, runPython, runPythonGlassBox } from './pyodideRuntime.js';
import { formatGlassBox } from './glassbox.js';

/**
 * PythonCell — editable code cell with stdout + glass-box (time/memory) footer.
 *
 * Adopted from ML Systems Lab (MSL) PythonCell as the base: same prop API
 * (initialCode / withPlot / readOnly / onResult), same Pyodide loader, same
 * header/run/output structure. Extended for PL with:
 *   - A CodeMirror 6 Python editor (replaces MSL's bare <textarea>).
 *   - A glass-box run path that captures wall time + peak memory, rendered as a
 *     small footer ("⏱ 0.4 ms · 🧠 12 KB peak").
 *
 * Props:
 *   initialCode  string  — starter code
 *   height       number  — editor height in px (default 220)
 *   withPlot     bool    — reserved (matplotlib plot capture); off for gotchas
 *   readOnly     bool    — render the editor read-only (still runnable)
 *   label        string  — cell label
 *   glassBox     bool    — capture + show time/memory footer (default true)
 *   onResult     fn      — callback with { ok, stdout, timeMs, peakKb, error }
 */
export function PythonCell({
  initialCode = '',
  height = 220,
  withPlot = false,
  readOnly = false,
  label = 'Python',
  glassBox = true,
  onResult,
  onCodeChange,
}) {
  const [status, setStatus]   = useState('idle'); // idle | loading | running | done | error
  const [progress, setProgress] = useState('');
  const [stdout, setStdout]   = useState('');
  const [errMsg, setErrMsg]   = useState('');
  const [metrics, setMetrics] = useState(null);   // { timeMs, peakKb }

  const codeRef   = useRef(initialCode);
  const hostRef   = useRef(null);
  const viewRef   = useRef(null);
  const abortRef  = useRef(false);

  // ── CodeMirror editor mount ──────────────────────────────────────────────
  useEffect(() => {
    if (!hostRef.current) return;

    const state = EditorState.create({
      doc: initialCode,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        python(),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        EditorView.editable.of(!readOnly),
        EditorState.readOnly.of(readOnly),
        EditorView.theme({
          '&': {
            fontSize: '13px',
            background: 'var(--surface-2)',
            color: 'var(--text)',
            height: `${height}px`,
          },
          '.cm-scroller': {
            fontFamily: 'var(--font-mono)',
            lineHeight: '1.7',
            overflow: 'auto',
          },
          '.cm-gutters': {
            background: 'var(--surface-2)',
            color: 'var(--text-dim)',
            border: 'none',
          },
          '.cm-activeLine': { background: 'var(--accent-bg)' },
          '.cm-activeLineGutter': { background: 'var(--accent-bg)' },
          '.cm-content': { padding: '10px 4px' },
        }),
        EditorView.updateListener.of(v => {
          if (v.docChanged) { codeRef.current = v.state.doc.toString(); onCodeChange?.(codeRef.current); }
        }),
      ],
    });

    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;
    return () => { view.destroy(); viewRef.current = null; };
    // initialCode/readOnly/height fixed per cell instance — mount once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRun() {
    abortRef.current = false;
    setStatus('loading');
    setStdout('');
    setErrMsg('');
    setMetrics(null);

    try {
      await loadPython(msg => { if (!abortRef.current) setProgress(msg); });
    } catch (e) {
      setStatus('error');
      setErrMsg('Failed to load Python runtime: ' + e.message);
      return;
    }

    setStatus('running');
    setProgress('');

    const code = codeRef.current;

    if (glassBox && !withPlot) {
      const res = await runPythonGlassBox(code);
      if (abortRef.current) return;
      setStdout(res.stdout || '');
      setMetrics({ timeMs: res.timeMs, peakKb: res.peakKb });
      if (res.error) {
        setStatus('error');
        setErrMsg(res.error);
        onResult?.({ ok: false, stdout: res.stdout, timeMs: res.timeMs, peakKb: res.peakKb, error: res.error });
      } else {
        setStatus('done');
        onResult?.({ ok: true, stdout: res.stdout, timeMs: res.timeMs, peakKb: res.peakKb, error: null });
      }
      return;
    }

    // Fallback plain path (no glass box).
    const res = await runPython(code);
    if (abortRef.current) return;
    if (res.ok) {
      setStatus('done');
      setStdout(res.stdout || '');
      onResult?.({ ok: true, stdout: res.stdout, timeMs: 0, peakKb: 0, error: null });
    } else {
      setStatus('error');
      setErrMsg(res.error || 'Unknown error');
      setStdout(res.stdout || '');
      onResult?.({ ok: false, stdout: res.stdout, timeMs: 0, peakKb: 0, error: res.error });
    }
  }

  const isRunning = status === 'loading' || status === 'running';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--surface)' }}>

      {/* Cell header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>{'>'}_</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
          {status === 'done'  && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />}
          {status === 'error' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isRunning && progress && (
            <span style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{progress}</span>
          )}
          <button
            className="btn-run"
            onClick={handleRun}
            disabled={isRunning}
            style={{ fontSize: '12px', padding: '5px 14px' }}
          >
            {isRunning
              ? <><span className="animate-spin" style={{ display: 'inline-block' }}>⟳</span> Running…</>
              : '▶ Run'}
          </button>
        </div>
      </div>

      {/* Code editor (CodeMirror) */}
      <div ref={hostRef} style={{ borderBottom: '1px solid var(--border)' }} />

      {/* Loading panel — Pyodide cold start */}
      {status === 'loading' && (
        <div style={{ background: 'var(--surface-2)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--border)' }}>
          <span className="animate-spin" style={{ fontSize: '16px', display: 'inline-block' }}>⟳</span>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>
              {progress || 'Loading Python runtime…'}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
              First run downloads Pyodide (~3s). Cached after that.
            </div>
          </div>
        </div>
      )}

      {/* Output */}
      {(stdout || errMsg) && (
        <div style={{ background: 'var(--surface)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {stdout && (
            <pre className={`py-output ${status === 'error' ? 'py-error' : ''}`} style={{ margin: 0 }}>{stdout}</pre>
          )}
          {errMsg && (
            <pre className="py-output py-error" style={{ margin: 0 }}>{errMsg}</pre>
          )}
        </div>
      )}

      {/* Glass-box footer */}
      {metrics && (
        <div style={{
          padding: '7px 14px',
          background: 'var(--surface-2)',
          borderTop: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '0.01em',
        }}>
          {formatGlassBox(metrics)}
        </div>
      )}
    </div>
  );
}

export default PythonCell;
