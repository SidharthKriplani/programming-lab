// PyLabReadiness — the role × seniority readiness dashboard (PYLAB-VISION §5).
// For the chosen role, shows progress per level (fluency→systems), names the weakest
// topic, and recommends where to work next. The "diagnostic" in its lightweight form:
// it reads your solved distribution and tells you where you stand + what to do.
import { ROLES, LEVELS, LEVEL_ORDER, rolesOf, levelOf } from '../../data/pyLabMeta.js';

const PCT = (s, t) => (t === 0 ? 0 : Math.round((s / t) * 100));

export function PyLabReadiness({ role, problems, solved, onPickLevel }) {
  const inRole = role === 'all' ? problems : problems.filter(p => rolesOf(p).includes(role));

  // per-level totals + solved
  const byLevel = LEVEL_ORDER.map(lvl => {
    const ps = inRole.filter(p => levelOf(p) === lvl);
    const done = ps.filter(p => solved[p.id]).length;
    return { lvl, total: ps.length, done, pct: PCT(done, ps.length) };
  });

  // weakest topic (lowest solved %, among topics with >=2 problems in this role)
  const topicAgg = {};
  inRole.forEach(p => {
    const t = (topicAgg[p.topic] ||= { total: 0, done: 0 });
    t.total += 1; if (solved[p.id]) t.done += 1;
  });
  const weakest = Object.entries(topicAgg)
    .filter(([, v]) => v.total >= 2)
    .map(([t, v]) => ({ t, pct: PCT(v.done, v.total) }))
    .sort((a, b) => a.pct - b.pct)[0];

  // recommended level = first level that isn't ~done (or has problems left)
  const rec = byLevel.find(l => l.total > 0 && l.pct < 80) || byLevel.find(l => l.total > 0);
  const overall = PCT(inRole.filter(p => solved[p.id]).length, inRole.length);

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', padding: '0.9rem 1.05rem', marginBottom: '1.1rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.7rem', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
          Readiness · {role === 'all' ? 'All roles' : ROLES[role]}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{overall}% overall</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(150px, 100%), 1fr))', gap: '0.6rem' }}>
        {byLevel.map(l => (
          <button
            key={l.lvl}
            onClick={() => onPickLevel && onPickLevel(l.lvl)}
            disabled={l.total === 0}
            style={{ textAlign: 'left', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.65rem', cursor: l.total ? 'pointer' : 'default', opacity: l.total ? 1 : 0.5 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)' }}>{LEVELS[l.lvl].label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>{l.done}/{l.total}</span>
            </div>
            <div style={{ height: 4, borderRadius: 3, background: 'var(--border)', marginTop: '0.4rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: l.pct + '%', background: 'var(--accent)' }} />
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>{LEVELS[l.lvl].sub}</div>
          </button>
        ))}
      </div>

      {(rec || weakest) && (
        <div style={{ marginTop: '0.7rem', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
          {rec && <span>Work next: <strong style={{ color: 'var(--text)' }}>{LEVELS[rec.lvl].label}</strong></span>}
          {weakest && weakest.pct < 100 && <span>Weakest: <strong style={{ color: 'var(--text)' }}>{weakest.t}</strong> ({weakest.pct}%)</span>}
        </div>
      )}
    </div>
  );
}

export default PyLabReadiness;
