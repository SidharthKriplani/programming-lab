// HashBucketsModel — Room 2 / hashing-and-lookup. Drop keys into hash buckets,
// see a collision, and see why lookup is O(1): the key hashes straight to its
// bucket instead of scanning all N. (Teaching hash = sum of char codes mod 8;
// CPython's real hash is randomized per process, so we use a stable stand-in.)
import { useState } from 'react';

const NB = 8;
const PRESETS = ['cat', 'dog', 'bird', 'fish', 'ant', 'bee', 'owl', 'fox', 'elk', 'cod'];
const hash = (key) => [...key].reduce((a, c) => a + c.charCodeAt(0), 0) % NB;

export function HashBucketsModel() {
  const [keys, setKeys] = useState(['cat', 'dog', 'bird']);
  const [lookup, setLookup] = useState(null);

  const buckets = Array.from({ length: NB }, () => []);
  keys.forEach(k => buckets[hash(k)].push(k));
  const collisions = buckets.filter(b => b.length > 1).length;
  const targetBucket = lookup ? hash(lookup) : null;

  const add = (k) => { if (!keys.includes(k)) setKeys(ks => [...ks, k]); };
  const remaining = PRESETS.filter(p => !keys.includes(p));

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginRight: '0.1rem' }}>add key</span>
        {remaining.slice(0, 6).map(p => (
          <button key={p} onClick={() => add(p)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '0.25rem 0.55rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>+{p}</button>
        ))}
        <button onClick={() => { setKeys([]); setLookup(null); }} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '0.25rem 0.55rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-dim)' }}>reset</button>
      </div>

      {/* lookup row */}
      <div style={{ padding: '0.6rem 0.9rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>look up</span>
        {keys.length === 0 && <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>add a few keys first</span>}
        {keys.map(k => (
          <button key={k} onClick={() => setLookup(k === lookup ? null : k)} style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '0.25rem 0.55rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            border: '1px solid ' + (lookup === k ? 'var(--accent)' : 'var(--border)'),
            background: lookup === k ? 'var(--accent-bg)' : 'var(--surface)',
            color: lookup === k ? 'var(--accent)' : 'var(--text-muted)',
          }}>{k}</button>
        ))}
      </div>

      <div style={{ padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {buckets.map((b, i) => {
          const isTarget = targetBucket === i;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-sm)',
              background: isTarget ? 'var(--accent-bg)' : 'transparent',
              border: '1px solid ' + (isTarget ? 'var(--accent-border)' : 'transparent'),
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-dim)', minWidth: 26 }}>[{i}]</span>
              <div style={{ flex: 1, display: 'flex', gap: '0.3rem', flexWrap: 'wrap', minHeight: 22 }}>
                {b.map(k => (
                  <span key={k} style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '0.1rem 0.5rem', borderRadius: 999,
                    border: '1px solid ' + (b.length > 1 ? 'var(--yellow)' : 'var(--border)'),
                    background: lookup === k ? 'var(--accent)' : 'var(--surface)',
                    color: lookup === k ? '#fff' : 'var(--text)',
                  }}>{k}</span>
                ))}
                {b.length > 1 && <span style={{ fontSize: '0.62rem', color: 'var(--yellow)', alignSelf: 'center', fontFamily: 'var(--font-mono)' }}>collision · chained</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '0.7rem 0.9rem', borderTop: '1px solid var(--border)' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          {lookup
            ? <>hash(&quot;{lookup}&quot;) = {hash(lookup)} → go <strong style={{ color: 'var(--accent)' }}>straight to bucket [{hash(lookup)}]</strong>. No scan of the other {Math.max(0, keys.length - 1)} keys — that is the O(1) lookup. A list would check up to all {keys.length}.</>
            : <>{keys.length} keys · {collisions} collision{collisions === 1 ? '' : 's'}. Each key hashes to a bucket; lookup jumps to that bucket directly (O(1)). Collisions chain in one bucket — rare while the table stays sparse. Click a key above to trace its lookup.</>}
        </p>
      </div>
    </div>
  );
}

export default HashBucketsModel;
