// TrapMuseum — Phase 3 (PYLAB-VISION §3). A gallery of every runs-but-wrong trap in the
// bank: the catalogue of code that passes review and fails in production. Pure lens over
// gated data (pyLabTraps) — browse, filter, expand to see the tempting code + why it breaks,
// and copy any one as a post (the daily-LinkedIn keystone, D-PL distribution gate).
import { useState, useMemo } from 'react';
import { pyLabTraps, trapTopicOrder, trapCount } from '../data/pyLabTraps.js';
import { PYLAB_TOPICS } from '../data/pyLabProblems.js';
import { Icon } from '../components/shared/Icon.jsx';

function CopyPost({ trap }) {
  const [done, setDone] = useState(false);
  const post = 'Python interview trap: ' + trap.name + '\n\n'
    + '# the version that passes review:\n' + trap.code + '\n\n'
    + '# why it is wrong:\n' + (trap.breaksWhen || trap.tradeoff) + '\n\n'
    + 'Runs clean. Diverges silently. (' + trap.problemTitle + ')';
  function copy(e) {
    e.stopPropagation();
    try { navigator.clipboard.writeText(post); setDone(true); setTimeout(() => setDone(false), 1600); } catch { /* ignore */ }
  }
  return (
    <button onClick={copy} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
      <Icon name={done ? 'check' : 'copy'} size={12} color={done ? 'var(--green-text)' : 'var(--text-muted)'} /> {done ? 'copied' : 'copy as post'}
    </button>
  );
}

function TrapCard({ trap, i }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pal-card-enter pal-card-hover" style={{ animationDelay: (i % 12) * 0.025 + 's', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', padding: '0.85rem 0.95rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--red-text)', border: '1px solid var(--red-border)', background: 'var(--red-bg)', borderRadius: 999, padding: '1px 7px', fontFamily: 'var(--font-mono)' }}>RUNS · DIVERGES</span>
        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{trap.topicLabel}</span>
      </div>
      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{trap.name}</div>
      <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>from <span style={{ color: 'var(--text-muted)' }}>{trap.problemTitle}</span></div>

      {open && (
        <div className="pal-reveal-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginTop: '0.15rem' }} onClick={e => e.stopPropagation()}>
          <pre style={{ margin: 0, padding: '0.6rem 0.7rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.5, overflowX: 'auto' }}>{trap.code}</pre>
          {trap.tradeoff && <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}><strong style={{ color: 'var(--text)' }}>Looks right because: </strong>{trap.tradeoff}</div>}
          {trap.breaksWhen && <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}><strong style={{ color: 'var(--red-text)' }}>Breaks when: </strong>{trap.breaksWhen}</div>}
          {trap.detection && <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontStyle: 'italic', lineHeight: 1.5 }}>Tell: {trap.detection}</div>}
          <div><CopyPost trap={trap} /></div>
        </div>
      )}
      {!open && <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{(trap.breaksWhen || trap.tradeoff).slice(0, 90)}{(trap.breaksWhen || trap.tradeoff).length > 90 ? '…' : ''}</div>}
    </div>
  );
}

export function TrapMuseum() {
  const [topic, setTopic] = useState('all');
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return pyLabTraps.filter(t =>
      (topic === 'all' || t.topic === topic) &&
      (!needle || t.name.toLowerCase().includes(needle) || t.problemTitle.toLowerCase().includes(needle))
    );
  }, [topic, q]);

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <Icon name="alert-triangle" size={20} color="var(--red-text)" />
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>Trap Museum</h1>
        </div>
        <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
          {trapCount} ways code passes review and fails in production. Every one runs clean. Every one is wrong. Pulled live from PyLab — each was executed and proven to diverge from the correct answer.
        </p>
      </div>

      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search traps…" style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.9rem', maxWidth: 360 }} />

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <Pill label={'All (' + pyLabTraps.length + ')'} active={topic === 'all'} onClick={() => setTopic('all')} />
        {trapTopicOrder.map(t => (
          <Pill key={t} label={(PYLAB_TOPICS[t] || t) + ' (' + pyLabTraps.filter(x => x.topic === t).length + ')'} active={topic === t} onClick={() => setTopic(t)} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: '0.75rem' }}>
        {shown.map((t, i) => <TrapCard key={t.problemId + ':' + t.name} trap={t} i={i} />)}
      </div>
      {shown.length === 0 && <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No traps match.</div>}
    </div>
  );
}

function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '0.3rem 0.65rem', borderRadius: 999, border: '1px solid ' + (active ? 'var(--red-border)' : 'var(--border)'), background: active ? 'var(--red-bg)' : 'var(--surface)', color: active ? 'var(--red-text)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.76rem', fontFamily: 'var(--font-mono)' }}>{label}</button>
  );
}

export default TrapMuseum;
