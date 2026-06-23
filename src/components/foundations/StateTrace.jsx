// StateTrace — the config-driven driven-model TEMPLATE (the scalable core).
// Most "binding & identity" Foundations models are the same shape: drive a
// sequence of ops → build Python → run it live in Pyodide → render the resulting
// values (with identity grouping) + a verdict. Instead of a bespoke React
// component per module, those become a DATA config (see foundationsModels.js).
// A new such module is a config entry, not new code. (PL's edge: a real runtime
// to be the engine — PAL can only hand-draw SVG.)
//
// Config shape:
//   { setup:[pyLines], modes:[{id,label,code:[lines]}]?, ops:[{id,label,code,counts?}],
//     watch:[ 'expr' | {expr,label,accent} ], identity:[[exprA,exprB]],
//     render:'objects'|'values', takeaway:(state,ctx)=>string }
//   ops .label/.code may be a string or a fn(count) (count = times THIS op pressed).
import { useState, useEffect, useCallback } from 'react';
import { loadPython, runPython } from '../ide/pyodideRuntime.js';

const ACCENTS = ['var(--accent)', 'var(--teal)', 'var(--yellow)', 'var(--purple)'];

export function StateTrace({ config }) {
  const cfg = config;
  const [ready, setReady] = useState(false);
  const [modeId, setModeId] = useState(cfg.modes ? cfg.modes[0].id : null);
  const [ops, setOps] = useState([]); // [opId,...] in press order
  const [state, setState] = useState(null);
  const [running, setRunning] = useState(false);

  const watch = cfg.watch.map((w, i) => (typeof w === 'string' ? { expr: w, label: w, accent: ACCENTS[i % ACCENTS.length] } : { accent: ACCENTS[i % ACCENTS.length], label: w.expr, ...w }));
  const identity = cfg.identity || [];

  const opCount = (id, upto) => ops.slice(0, upto).filter(o => o === id).length;
  const resolve = (v, count) => (typeof v === 'function' ? v(count) : v);

  const buildCode = useCallback(() => {
    const lines = ['import json', ...cfg.setup];
    if (cfg.modes && modeId) { const m = cfg.modes.find(x => x.id === modeId); if (m) lines.push(...m.code); }
    ops.forEach((id, idx) => {
      const def = cfg.ops.find(o => o.id === id);
      if (def) lines.push(resolve(def.code, opCount(id, idx)));
    });
    lines.push('__w = {}');
    watch.forEach((w, i) => lines.push('__w["w' + i + '"] = {"repr": repr(' + w.expr + '), "id": id(' + w.expr + ')}'));
    lines.push('__id = {}');
    identity.forEach((p, i) => lines.push('__id["i' + i + '"] = (' + p[0] + ' is ' + p[1] + ')'));
    lines.push('json.dumps({"watch": __w, "ident": __id})');
    return lines.join('\n');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeId, ops]);

  useEffect(() => { let a = true; loadPython().then(() => { if (a) setReady(true); }).catch(() => {}); return () => { a = false; }; }, []);
  useEffect(() => {
    if (!ready) return;
    let alive = true; setRunning(true);
    runPython(buildCode()).then(res => { if (!alive) return; if (res.ok && res.result) { try { setState(JSON.parse(res.result)); } catch { /* ignore */ } } setRunning(false); });
    return () => { alive = false; };
  }, [ready, buildCode]);

  // group watched exprs by object id (for the 'objects' render)
  const objects = [];
  if (state) watch.forEach((w, i) => {
    const d = state.watch['w' + i]; if (!d) return;
    let o = objects.find(x => x.id === d.id);
    if (!o) { o = { id: d.id, repr: d.repr, names: [] }; objects.push(o); }
    o.names.push({ label: w.label, accent: w.accent });
  });

  const takeaway = cfg.takeaway ? cfg.takeaway(state, { modeId, ops }) : null;

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        {cfg.modes && <>
          {cfg.modeLabel && <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{cfg.modeLabel}</span>}
          {cfg.modes.map(m => (
            <button key={m.id} onClick={() => setModeId(m.id)} style={segStyle(modeId === m.id)}>{m.label}</button>
          ))}
          <span style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 0.1rem' }} />
        </>}
        {cfg.ops.map(o => (
          <button key={o.id} onClick={() => setOps(s => [...s, o.id])} style={btnStyle(false)}>{resolve(o.label, opCount(o.id))}</button>
        ))}
        <button onClick={() => setOps([])} style={btnStyle(true)}>reset</button>
        {!ready && <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>warming up…</span>}
      </div>

      <div style={{ padding: '1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.7rem', opacity: running ? 0.6 : 1, transition: 'opacity 0.15s' }}>
        {state && cfg.render === 'objects' && objects.map((o, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ display: 'flex', gap: '0.3rem', minWidth: 64 }}>
              {o.names.map(n => <span key={n.label} style={pillStyle(n.accent)}>{n.label}</span>)}
            </div>
            <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>──▶</span>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', color: 'var(--text)' }}>{o.repr}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)' }}>id …{String(o.id).slice(-4)}</span>
            </div>
          </div>
        ))}
        {state && cfg.render === 'values' && watch.map((w, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={pillStyle(w.accent)}>{w.label}</span>
            <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>=</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem', color: 'var(--text)' }}>{state.watch['w' + i]?.repr}</span>
          </div>
        ))}

        {state && identity.map((p, i) => {
          const val = state.ident['i' + i];
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p[0]} is {p[1]} →</span>
              <span style={verdictStyle(val)}>{val ? 'True' : 'False'}</span>
            </div>
          );
        })}

        {takeaway && <p style={{ margin: '0.1rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{takeaway}</p>}
      </div>

      <details style={{ borderTop: '1px solid var(--border)', padding: '0.55rem 0.9rem' }}>
        <summary style={{ cursor: 'pointer', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', listStyle: 'none' }}>show the Python this ran</summary>
        <pre style={{ margin: '0.5rem 0 0', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{buildCode().replace(/^import json\n/, '').replace(/\n__w = \{\}[\s\S]*$/, '')}</pre>
      </details>
    </div>
  );
}

function pillStyle(accent) {
  return { fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.92rem', color: '#fff', background: accent, borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.55rem' };
}
function verdictStyle(val) {
  return {
    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem',
    color: val ? 'var(--green-text)' : 'var(--red-text)', background: val ? 'var(--green-bg)' : 'var(--red-bg)',
    border: '1px solid ' + (val ? 'var(--green-border)' : 'var(--red-border)'), borderRadius: 999, padding: '1px 10px',
  };
}
function segStyle(active) {
  return { fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: '1px solid ' + (active ? 'var(--accent)' : 'var(--border)'), background: active ? 'var(--accent-bg)' : 'var(--surface)', color: active ? 'var(--accent)' : 'var(--text-muted)' };
}
function btnStyle(ghost) {
  return { fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, padding: '0.3rem 0.65rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: '1px solid var(--border)', background: ghost ? 'transparent' : 'var(--surface)', color: ghost ? 'var(--text-dim)' : 'var(--text)' };
}

export default StateTrace;
