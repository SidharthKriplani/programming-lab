// BigOModel — Room 2 / cost-felt. Drag n and watch the cost classes diverge.
// At small n they all look fine; the whole point is what happens as n grows —
// O(n^2) leaves the others behind. Bars are log-scaled so every class stays
// visible while the raw op counts (shown) tell the real story.
import { useState } from 'react';

const CLASSES = [
  { label: 'O(1)',        f: () => 1,                          hue: 'var(--green-text)' },
  { label: 'O(log n)',    f: n => Math.log2(Math.max(1, n)),   hue: 'var(--teal)' },
  { label: 'O(n)',        f: n => n,                           hue: 'var(--accent)' },
  { label: 'O(n log n)',  f: n => n * Math.log2(Math.max(1, n)), hue: 'var(--yellow)' },
  { label: 'O(n^2)',      f: n => n * n,                       hue: 'var(--red-text)' },
];

function fmt(x) {
  const v = Math.round(x);
  if (v >= 1e6) return (v / 1e6).toFixed(v >= 1e7 ? 0 : 1) + 'M';
  if (v >= 1e3) return v.toLocaleString();
  return String(v);
}

export function BigOModel() {
  const [n, setN] = useState(50);

  const rows = CLASSES.map(c => ({ ...c, ops: c.f(n) }));
  const maxOps = Math.max(...rows.map(r => r.ops));
  const logMax = Math.log10(maxOps + 1);
  const quad = rows[4].ops;
  const lin = rows[2].ops;

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.7rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>input size</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>n =</span>
        <input type="range" min={1} max={1000} step={1} value={n} onChange={e => setN(Number(e.target.value))} style={{ flex: 1, minWidth: 160 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', minWidth: 48, textAlign: 'right' }}>{n.toLocaleString()}</span>
      </div>

      <div style={{ padding: '1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {rows.map(r => {
          const frac = logMax > 0 ? Math.log10(r.ops + 1) / logMax : 0;
          return (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: 78 }}>{r.label}</span>
              <div style={{ flex: 1, height: 16, background: 'var(--surface)', borderRadius: 999, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ width: Math.max(2, frac * 100) + '%', height: '100%', background: r.hue, transition: 'width 0.12s' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text)', minWidth: 64, textAlign: 'right' }}>{fmt(r.ops)} ops</span>
            </div>
          );
        })}

        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          At n = {n.toLocaleString()}, the O(n^2) way does <strong style={{ color: 'var(--red-text)' }}>{fmt(quad)}</strong> ops to the linear way&apos;s <strong style={{ color: 'var(--accent)' }}>{fmt(lin)}</strong> — about <strong>{lin > 0 ? Math.round(quad / lin).toLocaleString() : '—'}×</strong> more. Bars are log-scaled; drag n up and watch the gap explode. (This is what the glass box measures on a real run.)
        </p>
      </div>
    </div>
  );
}

export default BigOModel;
