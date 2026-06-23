// IndexAlignModel — Room 4 / pandas. Add two Series with different indexes and
// watch pandas align by LABEL, not position — putting NaN wherever a label is in
// only one of them. The silent bug that wrecks beginner pandas, made draggable.
import { useState, useEffect, useCallback } from 'react';
import { loadPackages, runPython } from '../ide/pyodideRuntime.js';

const VAL = { a: 10, b: 20, c: 30, d: 40, e: 50 };
const ALL = ['a', 'b', 'c', 'd', 'e'];

export function IndexAlignModel() {
  const [ready, setReady] = useState(false);
  const [s2labels, setS2] = useState(['b', 'c', 'd']);
  const [state, setState] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let alive = true;
    loadPackages(['pandas']).then(() => { if (alive) setReady(true); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const buildCode = useCallback(() => {
    const s2py = '{' + s2labels.map(l => "'" + l + "': " + VAL[l]).join(', ') + '}';
    return [
      'import pandas as pd, json',
      "s1 = pd.Series({'a': 1, 'b': 2, 'c': 3})",
      's2 = pd.Series(' + s2py + ')',
      'r = s1 + s2',
      'labels = sorted(set(s1.index) | set(s2.index))',
      'def g(s, l): return None if l not in s.index or pd.isna(s[l]) else float(s[l])',
      'def gr(l): return None if l not in r.index or pd.isna(r[l]) else float(r[l])',
      'json.dumps({"labels": labels, "s1": {l: g(s1, l) for l in labels}, "s2": {l: g(s2, l) for l in labels}, "r": {l: gr(l) for l in labels}})',
    ].join('\n');
  }, [s2labels]);

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

  const toggle = (l) => setS2(s => s.includes(l) ? s.filter(x => x !== l) : [...s, l]);
  const cell = (v) => v === null ? <span style={{ color: 'var(--red-text)', fontWeight: 700 }}>NaN</span> : <span style={{ color: 'var(--text)' }}>{v}</span>;

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>s2 labels</span>
        {ALL.map(l => (
          <button key={l} onClick={() => toggle(l)} style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            border: '1px solid ' + (s2labels.includes(l) ? 'var(--teal)' : 'var(--border)'),
            background: s2labels.includes(l) ? 'var(--surface)' : 'transparent',
            color: s2labels.includes(l) ? 'var(--teal)' : 'var(--text-dim)',
          }}>{l}</button>
        ))}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>s1 = a,b,c (fixed)</span>
        {!ready && <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>warming up pandas…</span>}
      </div>

      <div style={{ padding: '1rem 0.9rem', opacity: running ? 0.6 : 1, transition: 'opacity 0.15s' }}>
        {state && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                <th style={{ textAlign: 'left', padding: '0.3rem 0.5rem' }}>label</th>
                <th style={{ textAlign: 'right', padding: '0.3rem 0.5rem' }}>s1</th>
                <th style={{ textAlign: 'right', padding: '0.3rem 0.5rem' }}>s2</th>
                <th style={{ textAlign: 'right', padding: '0.3rem 0.5rem', color: 'var(--accent)' }}>s1 + s2</th>
              </tr>
            </thead>
            <tbody>
              {state.labels.map(l => (
                <tr key={l} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.3rem 0.5rem', color: 'var(--text-secondary)' }}>{l}</td>
                  <td style={{ padding: '0.3rem 0.5rem', textAlign: 'right' }}>{cell(state.s1[l])}</td>
                  <td style={{ padding: '0.3rem 0.5rem', textAlign: 'right' }}>{cell(state.s2[l])}</td>
                  <td style={{ padding: '0.3rem 0.5rem', textAlign: 'right' }}>{cell(state.r[l])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p style={{ margin: '0.8rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          pandas adds by <strong>label</strong>, not by row position. Any label present in only one Series has no partner — so the sum is <strong style={{ color: 'var(--red-text)' }}>NaN</strong>. Toggle s2&apos;s labels and watch the NaNs move.
        </p>
      </div>
    </div>
  );
}

export default IndexAlignModel;
