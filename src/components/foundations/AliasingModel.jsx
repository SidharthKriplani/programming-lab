// AliasingModel — the first DRIVEN Foundations model (F1, Room 1 / values-and-names).
// The learner drives real bindings; every frame is computed by REAL CPython in
// Pyodide — the id()/is/values are measured, not drawn. This is PL's edge over a
// hand-built SVG: the model is executable. "Two names, one list — mutate through
// one, watch the other move; switch to .copy() and watch them decouple."
import { useState, useEffect, useCallback } from 'react';
import { loadPython, runPython } from '../ide/pyodideRuntime.js';

const ACCENT = 'var(--accent)';

export function AliasingModel() {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState('alias');   // 'alias' (b = a) | 'copy' (b = a.copy())
  const [ops, setOps] = useState([]);          // [{type:'append', val} | {type:'rebind'}]
  const [state, setState] = useState(null);    // { a, b, ida, idb, same }
  const [running, setRunning] = useState(false);

  const appendCount = ops.filter(o => o.type === 'append').length;
  const nextVal = 3 + appendCount;

  const buildCode = useCallback(() => {
    const lines = ['import json', 'a = [1, 2]'];
    lines.push(mode === 'copy' ? 'b = a.copy()' : 'b = a');
    ops.forEach(o => {
      if (o.type === 'append') lines.push('a.append(' + o.val + ')');
      else if (o.type === 'rebind') lines.push('a = [99]');
    });
    lines.push('json.dumps({"a": a, "b": b, "ida": id(a), "idb": id(b), "same": (a is b)})');
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

  const append = () => setOps(o => [...o, { type: 'append', val: 3 + o.filter(x => x.type === 'append').length }]);
  const rebind = () => setOps(o => [...o, { type: 'rebind' }]);
  const reset = () => setOps([]);

  // group the two names by the object they point at (one node = aliased, two = separate)
  const objects = [];
  if (state) {
    const add = (id, contents, name) => {
      let o = objects.find(x => x.id === id);
      if (!o) { o = { id, contents, names: [] }; objects.push(o); }
      o.names.push(name);
    };
    add(state.ida, state.a, 'a');
    add(state.idb, state.b, 'b');
  }

  const hasRebind = ops.some(o => o.type === 'rebind');
  let takeaway = 'b = a binds the SAME list to a second name. Append through a and watch b.';
  if (state) {
    if (state.same && appendCount > 0) takeaway = 'One list, two names. You appended through a — b changed too, because they are the same object.';
    else if (!state.same && mode === 'copy') takeaway = 'b = a.copy() built a SEPARATE list. a\'s appends never reach b.';
    else if (!state.same && hasRebind) takeaway = 'a = [99] rebinds a to a NEW list. b still holds the original — rebinding never touches b.';
    else if (!state.same) takeaway = 'a and b point at different objects now.';
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      {/* Controls */}
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginRight: '0.2rem' }}>Bind b as</span>
        <Seg active={mode === 'alias'} onClick={() => setMode('alias')}>b = a</Seg>
        <Seg active={mode === 'copy'} onClick={() => setMode('copy')}>b = a.copy()</Seg>
        <span style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 0.2rem' }} />
        <Btn onClick={append}>a.append({nextVal})</Btn>
        <Btn onClick={rebind}>a = [99]</Btn>
        <Btn onClick={reset} ghost>reset</Btn>
        {!ready && <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>warming up Python…</span>}
      </div>

      {/* Diagram */}
      <div style={{ padding: '1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.7rem', opacity: running ? 0.6 : 1, transition: 'opacity 0.15s' }}>
        {objects.map((o, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ display: 'flex', gap: '0.3rem', minWidth: 64 }}>
              {o.names.map(n => (
                <span key={n} style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: '#fff', background: ACCENT, borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.55rem' }}>{n}</span>
              ))}
            </div>
            <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>──▶</span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--text)' }}>[{(o.contents || []).join(', ')}]</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)' }}>list · id …{String(o.id).slice(-4)}</span>
            </div>
          </div>
        ))}

        {/* The verdict */}
        {state && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>a is b →</span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem',
              color: state.same ? 'var(--green-text)' : 'var(--red-text)',
              background: state.same ? 'var(--green-bg)' : 'var(--red-bg)',
              border: '1px solid ' + (state.same ? 'var(--green-border)' : 'var(--red-border)'),
              borderRadius: 999, padding: '1px 10px',
            }}>{state.same ? 'True' : 'False'}</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{objects.length === 1 ? 'one object' : 'two objects'}</span>
          </div>
        )}

        {/* Takeaway */}
        <p style={{ margin: '0.1rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{takeaway}</p>
      </div>

      {/* Honesty: the real Python that produced this frame */}
      <details style={{ borderTop: '1px solid var(--border)', padding: '0.55rem 0.9rem' }}>
        <summary style={{ cursor: 'pointer', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', listStyle: 'none' }}>show the Python this ran</summary>
        <pre style={{ margin: '0.5rem 0 0', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{buildCode().replace('\nimport json', '').replace(/\njson\.dumps[\s\S]*$/, '')}</pre>
      </details>
    </div>
  );
}

function Seg({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600,
      padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
      border: '1px solid ' + (active ? ACCENT : 'var(--border)'),
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

export default AliasingModel;
