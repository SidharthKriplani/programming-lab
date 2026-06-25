// BroadcastModel — Room 4 / numpy. Drag two array shapes together and watch the
// rule play out: a size-1 axis STRETCHES to match (ghost cells — no copy is ever
// made), and a non-1 mismatch is an error. The "stretch, never copy" mental model
// the numpy docs themselves teach with, made draggable.
import { useState } from 'react';
import { Icon } from '../shared/Icon.jsx';

function clamp(v) { return Math.max(1, Math.min(4, v)); }

export function BroadcastModel() {
  const [a, setA] = useState({ r: 3, c: 1 });
  const [b, setB] = useState({ r: 1, c: 4 });

  const rowsOk = a.r === b.r || a.r === 1 || b.r === 1;
  const colsOk = a.c === b.c || a.c === 1 || b.c === 1;
  const ok = rowsOk && colsOk;
  const R = Math.max(a.r, b.r);
  const C = Math.max(a.c, b.c);

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      <div style={{ padding: '0.8rem 0.9rem', display: 'flex', gap: '1.4rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
        <ShapePicker label="A" shape={a} set={setA} />
        <ShapePicker label="B" shape={b} set={setB} />
      </div>

      <div style={{ padding: '1.1rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Labeled title={'A (' + a.r + '×' + a.c + ')'}>
          <Grid R={ok ? R : a.r} C={ok ? C : a.c} or={a.r} oc={a.c} accent="var(--accent)" />
        </Labeled>
        <Op>+</Op>
        <Labeled title={'B (' + b.r + '×' + b.c + ')'}>
          <Grid R={ok ? R : b.r} C={ok ? C : b.c} or={b.r} oc={b.c} accent="var(--teal)" />
        </Labeled>
        <Op>=</Op>
        <Labeled title={ok ? 'result (' + R + '×' + C + ')' : 'no result'}>
          {ok
            ? <Grid R={R} C={C} or={R} oc={C} accent="var(--green-text)" />
            : <Icon name="x" size={18} color="var(--red-text)" />}
        </Labeled>
      </div>

      <div style={{ padding: '0.7rem 0.9rem', borderTop: '1px solid var(--border)' }}>
        {ok ? (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--green-text)' }}>Broadcasts → ({R}×{C}).</strong> A size-1 axis stretches to match the other (the ghost cells) — and numpy never actually allocates those copies; it just reuses the one row/column. Solid = real data, dashed = stretched.
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--red-text)' }}>Shape mismatch{!rowsOk ? ' on rows' : ''}{!rowsOk && !colsOk ? ' and' : ''}{!colsOk ? ' on cols' : ''}.</strong> Two axes can combine only when they are equal or one of them is 1. {a.r}{!rowsOk ? ' vs ' + b.r + ' rows' : ''}{a.c && !colsOk ? (', ' + a.c + ' vs ' + b.c + ' cols') : ''} — neither is 1, neither matches, so numpy raises a ValueError.
          </p>
        )}
      </div>
    </div>
  );
}

function ShapePicker({ label, shape, set }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' }}>{label}</span>
      <Step value={shape.r} onChange={v => set(s => ({ ...s, r: clamp(v) }))} name="rows" />
      <span style={{ color: 'var(--text-dim)' }}>×</span>
      <Step value={shape.c} onChange={v => set(s => ({ ...s, c: clamp(v) }))} name="cols" />
    </div>
  );
}
function Step({ value, onChange, name }) {
  const btn = { fontFamily: 'var(--font-mono)', fontSize: '0.85rem', width: 22, height: 22, borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }} title={name}>
      <button onClick={() => onChange(value - 1)} style={btn} aria-label={'fewer ' + name}>−</button>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', minWidth: 12, textAlign: 'center', color: value === 1 ? 'var(--yellow)' : 'var(--text)' }}>{value}</span>
      <button onClick={() => onChange(value + 1)} style={btn} aria-label={'more ' + name}>+</button>
    </span>
  );
}
function Labeled({ title, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
      <div style={{ minHeight: 44, display: 'flex', alignItems: 'center' }}>{children}</div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--text-dim)' }}>{title}</span>
    </div>
  );
}
function Op({ children }) {
  return <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--text-dim)' }}>{children}</span>;
}
function Grid({ R, C, or, oc, accent }) {
  const cells = [];
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      const real = i < or && j < oc;
      cells.push(
        <div key={i + '-' + j} style={{
          width: 16, height: 16, borderRadius: 3,
          border: '1px ' + (real ? 'solid ' + accent : 'dashed var(--border)'),
          background: real ? accent : 'transparent',
          opacity: real ? 0.85 : 0.5,
        }} />
      );
    }
  }
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + C + ', 16px)', gap: 3 }}>{cells}</div>;
}

export default BroadcastModel;
