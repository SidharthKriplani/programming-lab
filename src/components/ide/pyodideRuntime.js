/**
 * Pyodide runtime — runs real Python in the browser. Zero backend, zero install.
 *
 * Adopted from ML Systems Lab (MSL) src/python.js VERBATIM in mechanism:
 *   - Same loader: inject Pyodide from CDN via a <script> tag, then loadPyodide().
 *   - Same Pyodide version + indexURL: v0.25.1 from jsdelivr.
 *   - Same stdout capture via setStdout({ batched }).
 * MSL loads Pyodide on the MAIN THREAD (no web worker). PL keeps that exactly —
 * there is no separate worker file to copy.
 *
 * GLASS-BOX EXTENSION (PL differentiator):
 *   runPythonGlassBox(code) wraps the user's code in an instrumented harness that
 *   captures, per run: stdout, wall time (perf_counter, ms), peak memory
 *   (tracemalloc, KB), and a traceback string on error.
 *   Returns: { stdout, timeMs, peakKb, error }.
 */

const PYODIDE_VERSION = '0.25.1';
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const PYODIDE_SCRIPT_URL = `${PYODIDE_INDEX_URL}pyodide.js`;

let pyodideInstance = null;
let loadingPromise = null;

export function isPyodideReady() {
  return pyodideInstance !== null;
}

export async function loadPython(onProgress) {
  if (pyodideInstance) return pyodideInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    onProgress?.('Loading Python runtime...');
    await loadScript(PYODIDE_SCRIPT_URL);

    onProgress?.('Initialising Python...');
    // eslint-disable-next-line no-undef
    pyodideInstance = await loadPyodide({ indexURL: PYODIDE_INDEX_URL });

    onProgress?.('Ready!');
    return pyodideInstance;
  })();

  return loadingPromise;
}

/**
 * Plain run — stdout + result only (used for the simple "show output" path).
 * Mirrors MSL runPython().
 */
export async function runPython(code) {
  if (!pyodideInstance) throw new Error('Python not loaded yet');

  let stdout = '';
  pyodideInstance.setStdout({ batched: s => { stdout += s + '\n'; } });

  try {
    const result = await pyodideInstance.runPythonAsync(code);
    return { ok: true, result, stdout: stdout.trim() };
  } catch (err) {
    return { ok: false, error: err.message, stdout: stdout.trim() };
  }
}

/**
 * Glass-box run — the PL differentiator.
 * Wraps user code so the Pyodide side captures stdout, wall time (ms), peak
 * memory (KB), and a full traceback on error. The user's code runs inside a
 * function body so locals stay scoped; stdout is captured via contextlib.
 *
 * Returns: { stdout: string, timeMs: number, peakKb: number, error: string|null }
 */
export async function runPythonGlassBox(code) {
  if (!pyodideInstance) throw new Error('Python not loaded yet');

  // Hand the raw user code to Python as a string global so we never have to
  // escape it into the harness source. The harness compiles + execs it.
  pyodideInstance.globals.set('__pl_user_code', code);

  const harness = [
    'import io, time, tracemalloc, traceback, contextlib, json',
    '',
    '__pl_src = __pl_user_code',
    '__pl_out = io.StringIO()',
    '__pl_err = None',
    '__pl_peak = 0',
    '__pl_ms = 0.0',
    '__pl_ns = {}',
    'tracemalloc.start()',
    '__pl_t0 = time.perf_counter()',
    'try:',
    '    with contextlib.redirect_stdout(__pl_out):',
    '        exec(compile(__pl_src, "<gotcha>", "exec"), __pl_ns)',
    'except Exception:',
    '    __pl_err = traceback.format_exc()',
    'finally:',
    '    __pl_ms = (time.perf_counter() - __pl_t0) * 1000.0',
    '    __pl_cur, __pl_peak = tracemalloc.get_traced_memory()',
    '    tracemalloc.stop()',
    '',
    'json.dumps({',
    '    "stdout": __pl_out.getvalue(),',
    '    "timeMs": round(__pl_ms, 4),',
    '    "peakKb": round(__pl_peak / 1024.0, 1),',
    '    "error": __pl_err,',
    '})',
  ].join('\n');

  try {
    const raw = await pyodideInstance.runPythonAsync(harness);
    const parsed = JSON.parse(raw);
    return {
      stdout: (parsed.stdout || '').replace(/\n$/, ''),
      timeMs: parsed.timeMs ?? 0,
      peakKb: parsed.peakKb ?? 0,
      error: parsed.error || null,
    };
  } catch (err) {
    // Harness itself failed (e.g. syntax error in user code that breaks compile()).
    return { stdout: '', timeMs: 0, peakKb: 0, error: String(err.message || err) };
  } finally {
    try { pyodideInstance.globals.delete('__pl_user_code'); } catch { /* ignore */ }
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── Package loading (pandas / numpy, on demand) ────────────────────────────
const loadedPackages = new Set();

export async function loadPackages(pkgs, onProgress) {
  await loadPython(onProgress);
  const missing = (pkgs || []).filter(p => !loadedPackages.has(p));
  if (missing.length) {
    onProgress?.('Loading ' + missing.join(', ') + '...');
    await pyodideInstance.loadPackage(missing);
    missing.forEach(p => loadedPackages.add(p));
  }
  return pyodideInstance;
}

/**
 * runProblem — execute the user's solution, then its test harness.
 * The test source defines `__pl_checks = [(name, fn), ...]`; each fn returns a bool.
 * Returns: { results:[{name,ok}], passed, total, stdout, error, timeMs, peakKb }.
 */
export async function runProblem(userCode, testSource) {
  if (!pyodideInstance) throw new Error('Python not loaded yet');
  pyodideInstance.globals.set('__pl_user_code', userCode);
  pyodideInstance.globals.set('__pl_test_code', testSource);

  const harness = [
    'import io, json, time, tracemalloc, traceback, contextlib',
    '__pl_out = io.StringIO()',
    '__pl_err = None',
    '__pl_results = []',
    '__pl_ms = 0.0',
    '__pl_peak = 0',
    '__pl_ns = {}',
    'tracemalloc.start()',
    '__pl_t0 = time.perf_counter()',
    'try:',
    '    with contextlib.redirect_stdout(__pl_out):',
    '        exec(compile(__pl_user_code, "<solution>", "exec"), __pl_ns)',
    '        exec(compile(__pl_test_code, "<tests>", "exec"), __pl_ns)',
    '        for __pl_nm, __pl_fn in __pl_ns.get("__pl_checks", []):',
    '            try:',
    '                __pl_ok = bool(__pl_fn())',
    '            except Exception:',
    '                __pl_ok = False',
    '            __pl_results.append({"name": __pl_nm, "ok": __pl_ok})',
    'except Exception:',
    '    __pl_err = traceback.format_exc()',
    'finally:',
    '    __pl_ms = (time.perf_counter() - __pl_t0) * 1000.0',
    '    __pl_cur, __pl_peak = tracemalloc.get_traced_memory()',
    '    tracemalloc.stop()',
    'json.dumps({',
    '    "results": __pl_results,',
    '    "stdout": __pl_out.getvalue(),',
    '    "error": __pl_err,',
    '    "timeMs": round(__pl_ms, 3),',
    '    "peakKb": round(__pl_peak / 1024.0, 1),',
    '})',
  ].join('\n');

  try {
    const raw = await pyodideInstance.runPythonAsync(harness);
    const parsed = JSON.parse(raw);
    const results = parsed.results || [];
    return {
      results,
      passed: results.filter(r => r.ok).length,
      total: results.length,
      stdout: (parsed.stdout || '').replace(/\n$/, ''),
      error: parsed.error || null,
      timeMs: parsed.timeMs ?? 0,
      peakKb: parsed.peakKb ?? 0,
    };
  } catch (err) {
    return { results: [], passed: 0, total: 0, stdout: '', error: String(err.message || err), timeMs: 0, peakKb: 0 };
  } finally {
    try { pyodideInstance.globals.delete('__pl_user_code'); pyodideInstance.globals.delete('__pl_test_code'); } catch { /* ignore */ }
  }
}

/**
 * previewExample — runs the example setup + the canonical solution to produce the
 * INPUT data preview + the EXPECTED OUTPUT, computed live from the solution (the
 * SQL-Lab pattern: never hand-maintain the expected answer). Seeds pd/np into the
 * namespace so example setups can use pandas/numpy without importing.
 * Returns: { inputs:[{name, kind, ...}], output:{kind, ...}|null, error }.
 */
export async function previewExample(solution, setup, call, inputs) {
  if (!pyodideInstance) throw new Error('Python not loaded yet');
  pyodideInstance.globals.set('__pl_solution', solution || '');
  pyodideInstance.globals.set('__pl_setup', setup || '');
  pyodideInstance.globals.set('__pl_call', call || '');
  pyodideInstance.globals.set('__pl_inputs_json', JSON.stringify(inputs || []));

  const harness = [
    'import json',
    'try:',
    '    import pandas as pd',
    'except Exception:',
    '    pd = None',
    'try:',
    '    import numpy as np',
    'except Exception:',
    '    np = None',
    'def __pl_cell(v):',
    '    try:',
    '        if pd is not None and pd.isna(v):',
    '            return ""',
    '    except Exception:',
    '        pass',
    '    if isinstance(v, float):',
    '        if v != v:',
    '            return "NaN"',
    '        return ("%.4f" % v).rstrip("0").rstrip(".")',
    '    return str(v)',
    'def __pl_repr(o):',
    '    r = repr(o)',
    '    return r if len(r) <= 500 else r[:500] + " ..."',
    'def __pl_serialize(o):',
    '    if pd is not None and isinstance(o, pd.DataFrame):',
    '        cols = [str(c) for c in o.columns]',
    '        rows = []',
    '        for i in range(min(len(o), 14)):',
    '            rows.append([__pl_cell(o.iloc[i][c]) for c in o.columns])',
    '        return {"kind": "df", "columns": cols, "rows": rows, "shape": [int(o.shape[0]), int(o.shape[1])]}',
    '    if pd is not None and isinstance(o, pd.Series):',
    '        s = o.head(14)',
    '        return {"kind": "series", "name": (str(o.name) if o.name is not None else "value"), "index": [str(i) for i in s.index], "values": [__pl_cell(v) for v in s.values], "length": int(len(o))}',
    '    return {"kind": "value", "repr": __pl_repr(o)}',
    '__pl_ns = {"pd": pd, "np": np}',
    '__pl_err = None',
    '__pl_inputs = []',
    '__pl_output = None',
    'try:',
    '    exec(__pl_solution, __pl_ns)',
    '    if __pl_setup.strip():',
    '        exec(__pl_setup, __pl_ns)',
    '    for __n in json.loads(__pl_inputs_json):',
    '        if __n in __pl_ns:',
    '            __pl_inputs.append(dict({"name": __n}, **__pl_serialize(__pl_ns[__n])))',
    '    if __pl_call.strip():',
    '        __pl_output = __pl_serialize(eval(__pl_call, __pl_ns))',
    'except Exception:',
    '    import traceback',
    '    __pl_err = traceback.format_exc().strip().splitlines()[-1]',
    'json.dumps({"inputs": __pl_inputs, "output": __pl_output, "error": __pl_err})',
  ].join('\n');

  try {
    const raw = await pyodideInstance.runPythonAsync(harness);
    return JSON.parse(raw);
  } catch (err) {
    return { inputs: [], output: null, error: String(err.message || err) };
  } finally {
    try {
      pyodideInstance.globals.delete('__pl_solution');
      pyodideInstance.globals.delete('__pl_setup');
      pyodideInstance.globals.delete('__pl_call');
      pyodideInstance.globals.delete('__pl_inputs_json');
    } catch { /* ignore */ }
  }
}

export { PYODIDE_VERSION, PYODIDE_INDEX_URL };
