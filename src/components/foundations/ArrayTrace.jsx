// ArrayTrace — the config-driven template for "array + indices + step narration"
// DSA traces (the second template, after StateTrace). Two-pointer, sliding-window,
// binary-search all collapse to a config in arrayTraceModels.js: an array, an
// optional param control, and a build(arr, param) -> steps function. Each step
// declares per-cell roles + a note (+ optional labels/stats/tone). A new array
// pattern is a config, not a component.
import { useState, useEffect } from 'react';

const ROLE = {
  normal: { border: 'var(--border)', bg: 'var(--surface)', color: 'var(--text)', op: 1 },
  active: { border: 'var(--accent)', bg: 'var(--accent-bg)', color: 'var(--accent)', op: 1 },
  mid: { border: 'var(--accent)', bg: 'var(--accent-bg)', color: 'var(--accent)', op: 1 },
  dim: { border: 'var(--border)', bg: 'var(--surface)', color: 'var(--text-dim)', op: 0.4 },
  found: { border: 'var(--green-text)', bg: 'var(--green-bg)', color: 'var(--green-text)', op: 1 },
};

export function ArrayTrace({ config: cfg }) {
  const [p, setP] = useState(cfg.param ? cfg.param.default : null);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = cfg.build(cfg.array, p);
  const step = steps[Math.min(i, steps.length - 1)];

  useEffect(() => { setI(0); setPlaying(false); }, [p]);
  useEffect(() => {
    if (!playing) return;
    if (i >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setI(x => Math.min(x + 1, steps.length - 1)), 900);
    return () => clearTimeout(t);
  }, [playing, i, steps.length]);

  const tone = step.tone === 'found' ? 'var(--green-text)' : step.tone === 'done' ? 'var(--red-text)' : 'var(--text-secondary)';

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', gap: '0.6rem', alignItems: 'center', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {cfg.label && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>{cfg.label}</span>}
        {cfg.param && cfg.param.kind === 'slider' && <>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{cfg.param.label}</span>
          <input type="range" min={cfg.param.min} max={cfg.param.max} step={1} value={p} onChange={e => setP(Number(e.target.value))} style={{ flex: '0 0 110px' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', minWidth: 22 }}>{p}</span>
        </>}
        {cfg.param && cfg.param.kind === 'select' && <>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{cfg.param.label}</span>
          <select value={p} onChange={e => setP(Number(e.target.value))} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', padding: '0.2rem 0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
            {cfg.param.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </>}
        <span style={{ flex: 1 }} />
        <Btn onClick={() => setI(x => Math.max(0, x - 1))} disabled={i === 0}>◀</Btn>
        <Btn onClick={() => setPlaying(x => !x)} disabled={i >= steps.length - 1}>{playing ? 'pause' : 'play'}</Btn>
        <Btn onClick={() => setI(x => Math.min(steps.length - 1, x + 1))} disabled={i >= steps.length - 1}>▶</Btn>
        <Btn onClick={() => { setI(0); setPlaying(false); }} ghost>reset</Btn>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>{i + 1}/{steps.length}</span>
      </div>

      <div style={{ padding: '1.1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
          {cfg.array.map((v, idx) => {
            const r = ROLE[step.roles(idx)] || ROLE.normal;
            const label = step.labels && step.labels[idx];
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', borderRadius: 'var(--radius-sm)', border: '1px solid ' + r.border, background: r.bg, color: r.color, opacity: r.op }}>{v}</div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--accent)', height: 12 }}>{label || ''}</span>
              </div>
            );
          })}
        </div>

        {step.stats && (
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            {step.stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: s.hue }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        <p style={{ margin: 0, textAlign: 'center', fontSize: '0.88rem', color: tone, lineHeight: 1.55, fontWeight: step.tone ? 700 : 400 }}>{step.note}</p>
        {cfg.footer && <p style={{ margin: 0, textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-dim)' }}>{cfg.footer}</p>}
      </div>
    </div>
  );
}

function Btn({ onClick, children, ghost, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600,
      padding: '0.28rem 0.6rem', borderRadius: 'var(--radius-sm)', cursor: disabled ? 'default' : 'pointer',
      border: '1px solid var(--border)', opacity: disabled ? 0.45 : 1,
      background: ghost ? 'transparent' : 'var(--surface)', color: ghost ? 'var(--text-dim)' : 'var(--text)',
    }}>{children}</button>
  );
}

export default ArrayTrace;
