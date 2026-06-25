// TruthinessModel — Room 1 / the-data-model. Define __bool__ and/or __len__ on a
// toy object and watch `bool(obj)` decide: Python tries __bool__ first, then
// __len__ (0 = falsy), then defaults to True. Live in Pyodide — the verdict and
// which dunder decided are computed by real CPython.
import { useState, useEffect, useCallback } from 'react';
import { Icon } from '../shared/Icon.jsx';
import { loadPython, runPython } from '../ide/pyodideRuntime.js';

export function TruthinessModel() {
  const [ready, setReady] = useState(false);
  const [boolOn, setBoolOn] = useState(false);
  const [boolVal, setBoolVal] = useState(false);
  const [lenOn, setLenOn] = useState(true);
  const [lenVal, setLenVal] = useState(0);
  const [state, setState] = useState(null);

  useEffect(() => {
    let alive = true;
    loadPython().then(() => { if (alive) setReady(true); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const buildCode = useCallback(() => {
    const lines = ['import json', 'class C:'];
    if (boolOn) { lines.push('    def __bool__(self):'); lines.push('        return ' + (boolVal ? 'True' : 'False')); }
    if (lenOn) { lines.push('    def __len__(self):'); lines.push('        return ' + lenVal); }
    if (!boolOn && !lenOn) lines.push('    pass');
    lines.push('obj = C()');
    lines.push("decided = '__bool__' if '__bool__' in C.__dict__ else ('__len__' if '__len__' in C.__dict__ else 'default True')");
    lines.push('json.dumps({"result": bool(obj), "decided": decided})');
    return lines.join('\n');
  }, [boolOn, boolVal, lenOn, lenVal]);

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    runPython(buildCode()).then(res => {
      if (!alive) return;
      if (res.ok && res.result) { try { setState(JSON.parse(res.result)); } catch { /* ignore */ } }
    });
    return () => { alive = false; };
  }, [ready, buildCode]);

  const Stage = ({ label, active, dimmed }) => (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: 999,
      border: '1px solid ' + (active ? 'var(--accent)' : 'var(--border)'),
      background: active ? 'var(--accent-bg)' : 'transparent',
      color: active ? 'var(--accent)' : dimmed ? 'var(--text-dim)' : 'var(--text-muted)',
      fontWeight: active ? 700 : 400,
    }}>{label}</span>
  );

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', flexWrap: 'wrap', gap: '0.9rem', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <Toggle on={boolOn} onClick={() => setBoolOn(v => !v)} label="__bool__" />
        {boolOn && <Seg active={boolVal} onClick={() => setBoolVal(v => !v)}>returns {boolVal ? 'True' : 'False'}</Seg>}
        <span style={{ width: 1, height: 20, background: 'var(--border)' }} />
        <Toggle on={lenOn} onClick={() => setLenOn(v => !v)} label="__len__" />
        {lenOn && <Seg active={lenVal > 0} onClick={() => setLenVal(v => v > 0 ? 0 : 3)}>returns {lenVal}</Seg>}
        {!ready && <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>warming up…</span>}
      </div>

      <div style={{ padding: '1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>order:</span>
          <Stage label="__bool__" active={state?.decided === '__bool__'} dimmed={!boolOn} />
          <span style={{ color: 'var(--text-dim)' }}>→</span>
          <Stage label="__len__ (0 = falsy)" active={state?.decided === '__len__'} dimmed={!lenOn} />
          <span style={{ color: 'var(--text-dim)' }}>→</span>
          <Stage label="default True" active={state?.decided === 'default True'} />
        </div>
        {state && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>bool(obj) →</span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem',
              color: state.result ? 'var(--green-text)' : 'var(--red-text)',
              background: state.result ? 'var(--green-bg)' : 'var(--red-bg)',
              border: '1px solid ' + (state.result ? 'var(--green-border)' : 'var(--red-border)'),
              borderRadius: 999, padding: '1px 12px',
            }}>{state.result ? 'True' : 'False'}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>decided by {state.decided}</span>
          </div>
        )}
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          Turn both off: every object is True by default — that is why <code>if obj:</code> on a non-empty thing always passes. Add <code>__len__</code> and 0 becomes falsy; add <code>__bool__</code> and it wins outright.
        </p>
      </div>
    </div>
  );
}

function Toggle({ on, onClick, label }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 600, padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
      border: '1px solid ' + (on ? 'var(--accent)' : 'var(--border)'),
      background: on ? 'var(--accent-bg)' : 'var(--surface)',
      color: on ? 'var(--accent)' : 'var(--text-dim)',
    }}>{on ? <><Icon name="check" size={13} />{' '}</> : '+ '}{label}</button>
  );
}
function Seg({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '0.28rem 0.55rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
      border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)',
    }}>{children}</button>
  );
}

export default TruthinessModel;
