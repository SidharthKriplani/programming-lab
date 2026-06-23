// CopyVsViewModel — Room 1 / values-and-names, the sequel to aliasing.
// "A shallow copy copies the OUTER list but shares the inner ones; deepcopy goes
// all the way down." Driven, live in Pyodide — the x[0] is y[0] verdict is real.
import { useState, useEffect, useCallback } from 'react';
import { loadPython, runPython } from '../ide/pyodideRuntime.js';

export function CopyVsViewModel() {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState('shallow'); // 'shallow' (y = x.copy()) | 'deep'
  const [ops, setOps] = useState([]);          // ['inner' | 'outer']
  const [state, setState] = useState(null);
  const [running, setRunning] = useState(false);

  const innerCount = ops.filter(o => o === 'inner').length;

  const buildCode = useCallback(() => {
    const lines = ['import copy, json', 'x = [[1, 2], [3, 4]]'];
    lines.push(mode === 'deep' ? 'y = copy.deepcopy(x)' : 'y = x.copy()');
    let v = 9;
    ops.forEach(o => {
      if (o === 'inner') { lines.push('x[0].append(' + v + ')'); v += 1; }
      else lines.push('x.append([5, 6])');
    });
    lines.push('json.dumps({"x": x, "y": y, "inner_shared": (x[0] is y[0]), "same": (x is y)})');
    return lines.join('\n');
  }, [mode, ops]);

  useEffect(() => {
    let alive = true;
    loadPython().then(() => { if (alive) setReady(true); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    setRunning(true);
    runPython(buildCode()).then(res => {
      if (!alive) return;
      if (res.ok && res.result) { try { setState(JSON.parse(res.result)); } catch { /* ignore */ } }
      setRunning(false);
    });
    return () => { alive = false; };
  }, [ready, buildCode]);

  let takeaway = 'x.copy() and deepcopy() both make y a separate OUTER list. The question is the inner lists.';
  if (state) {
    if (state.inner_shared) takeaway = 'Shallow copy shares the inner lists. You mutated x[0] — and y[0] changed too, because they are the same inner object.';
    else if (mode === 'deep') takeaway = 'deepcopy() copied all the way down. x and y are fully independent — mutating x never touches y.';
    else takeaway = 'The inner lists are separate now.';
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginRight: '0.2rem' }}>Copy as</span>
        <Seg active={mode === 'shallow'} onClick={() => setMode('shallow')}>y = x.copy()</Seg>
        <Seg active={mode === 'deep'} onClick={() => setMode('deep')}>y = deepcopy(x)</Seg>
        <span style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 0.2rem' }} />
        <Btn onClick={() => setOps(o => [...o, 'inner'])}>x[0].append({9 + innerCount})</Btn>
        <Btn onClick={() => setOps(o => [...o, 'outer'])}>x.append([5,6])</Btn>
        <Btn onClick={() => setOps([])} ghost>reset</Btn>
        {!ready && <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>warming up Python…</span>}
      </div>

      <div style={{ padding: '1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.7rem', opacity: running ? 0.6 : 1, transition: 'opacity 0.15s' }}>
        {state && (
          <>
            <Row name="x" value={state.x} accent="var(--accent)" />
            <Row name="y" value={state.y} accent="var(--teal)" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>x[0] is y[0] →</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem',
                color: state.inner_shared ? 'var(--red-text)' : 'var(--green-text)',
                background: state.inner_shared ? 'var(--red-bg)' : 'var(--green-bg)',
                border: '1px solid ' + (state.inner_shared ? 'var(--red-border)' : 'var(--green-border)'),
                borderRadius: 999, padding: '1px 10px',
              }}>{state.inner_shared ? 'True · shared' : 'False · separate'}</span>
            </div>
            <p style={{ margin: '0.1rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{takeaway}</p>
          </>
        )}
      </div>

      <details style={{ borderTop: '1px solid var(--border)', padding: '0.55rem 0.9rem' }}>
        <summary style={{ cursor: 'pointer', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', listStyle: 'none' }}>show the Python this ran</summary>
        <pre style={{ margin: '0.5rem 0 0', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{buildCode().replace('import copy, json\n', '').replace(/\njson\.dumps[\s\S]*$/, '')}</pre>
      </details>
    </div>
  );
}

function Row({ name, value, accent }) {
  const render = (v) => Array.isArray(v) ? '[' + v.map(render).join(', ') + ']' : String(v);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: '#fff', background: accent, borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.55rem', minWidth: 22, textAlign: 'center' }}>{name}</span>
      <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>=</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', color: 'var(--text)' }}>{render(value)}</span>
    </div>
  );
}

function Seg({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600,
      padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
      border: '1px solid ' + (active ? 'var(--accent)' : 'var(--border)'),
      background: active ? 'var(--accent-bg)' : 'var(--surface)',
      color: active ? 'var(--accent)' : 'var(--text-muted)',
    }}>{children}</button>
  );
}
function Btn({ onClick, children, ghost }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600,
      padding: '0.3rem 0.65rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
      border: '1px solid var(--border)',
      background: ghost ? 'transparent' : 'var(--surface)',
      color: ghost ? 'var(--text-dim)' : 'var(--text)',
    }}>{children}</button>
  );
}

export default CopyVsViewModel;
