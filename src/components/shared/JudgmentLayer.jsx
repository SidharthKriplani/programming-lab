// JudgmentLayer — the JUDGE panel that makes PyLab a judgment gym, not a grader
// (PYLAB-BUILD-SPEC §5). Renders after reveal: method cards (Reference / Trap badges),
// the "which method when" dial, and interactive MCQs. Returns null when < 2 methods
// (the honesty-rule empty-dial / single-method case), so it's safe to drop on every problem.
import { useState } from 'react';
import { Icon } from './Icon.jsx';

function MethodCard({ m, canonical }) {
  const [open, setOpen] = useState(m.isTrap || m.id === canonical);
  const accent = m.isTrap ? 'var(--red)' : (m.id === canonical ? 'var(--green-text)' : 'var(--text-muted)');
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.8rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <Icon name="chevron-down" size={13} color="var(--text-muted)" style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{m.name}</span>
        {m.id === canonical && !m.isTrap && (
          <span className="pl-chip" style={{ color: 'var(--green-text)', borderColor: 'var(--green-border)', background: 'var(--green-bg)' }}>Reference</span>
        )}
        {m.isTrap && (
          <span className="pl-chip" style={{ color: 'var(--red-text)', borderColor: 'var(--red-border)', background: 'var(--red-bg)' }}>Trap · runs, wrong</span>
        )}
      </button>
      {open && (
        <div style={{ padding: '0 0.8rem 0.7rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <pre style={{ margin: 0, padding: '0.6rem 0.75rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{m.code}</pre>
          {m.tradeoff && <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}><strong style={{ color: 'var(--text)' }}>Tradeoff: </strong>{m.tradeoff}</div>}
          {m.breaksWhen && <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}><strong style={{ color: 'var(--text)' }}>Breaks when: </strong>{m.breaksWhen}</div>}
        </div>
      )}
    </div>
  );
}

function Dial({ dial, methods }) {
  if (!dial || !dial.rules || dial.rules.length === 0) return null;
  const nameOf = id => (methods.find(m => m.id === id) || {}).name || id;
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', padding: '0.7rem 0.85rem' }}>
      <div style={{ fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Which method when</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {dial.rules.map((r, i) => (
          <div key={i} style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text)' }}>
              {Object.entries(r.when || {}).map(([k, v]) => k + '=' + v).join(', ') || 'default'}
            </span>
            {' → prefer '}
            <strong style={{ color: 'var(--text)' }}>{(r.rank || []).map(nameOf).join(' › ')}</strong>
            <div style={{ color: 'var(--text-muted)', marginTop: '0.1rem' }}>{r.why}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Mcq({ q, methods }) {
  const [picked, setPicked] = useState(null);
  const nameOf = id => (methods.find(m => m.id === id) || {}).name || id;
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', padding: '0.7rem 0.85rem' }}>
      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>{q.stem}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {q.options.map(opt => {
          const answered = picked !== null;
          const isAns = opt === q.answerId;
          const isPicked = picked === opt;
          let bg = 'var(--surface-2)', border = 'var(--border)';
          if (answered && isAns) { bg = 'var(--green-bg)'; border = 'var(--green-border)'; }
          else if (answered && isPicked) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; }
          return (
            <button key={opt} disabled={answered} onClick={() => setPicked(opt)} style={{ textAlign: 'left', padding: '0.4rem 0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid ' + border, background: bg, cursor: answered ? 'default' : 'pointer', fontSize: '0.84rem', color: 'var(--text)' }}>
              {nameOf(opt)}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.55, borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>{q.explanation}</div>
      )}
    </div>
  );
}

export function JudgmentLayer({ problem }) {
  const methods = problem.methods || [];
  if (methods.length < 2) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', borderTop: '1px solid var(--border)', paddingTop: '1.1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <Icon name="scale" size={15} color="var(--accent)" />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>The judgment — more than one runs; which is right, and when</span>
      </div>
      {methods.map(m => <MethodCard key={m.id} m={m} canonical={problem.canonicalMethodId} />)}
      <Dial dial={problem.dial} methods={methods} />
      {(problem.mcqs || []).map(q => <Mcq key={q.id} q={q} methods={methods} />)}
    </div>
  );
}

export default JudgmentLayer;
