// GotchaBrowser — the DO-rung room: browse Python gotchas, open one to practice.
// Named export (App lazy-imports it with the named-export pattern).
import { useState } from 'react';
import { gotchaProblems, CLUSTERS, CLUSTER_ORDER } from '../data/gotchaProblems.js';
import { GotchaRunner } from './GotchaRunner.jsx';
import { HowToStrip } from '../components/shared/HowToStrip.jsx';
import { Icon } from '../components/shared/Icon.jsx';
import { getProgress } from '../utils/gotchaProgress.js';
import { isUnlocked } from '../utils/unlock.js';

const GRID_COLS = 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))';

export function GotchaBrowser() {
  const [activeId, setActiveId] = useState(null);
  const progress = getProgress();

  const ordered = gotchaProblems
    .slice()
    .sort((a, b) => CLUSTER_ORDER.indexOf(a.cluster) - CLUSTER_ORDER.indexOf(b.cluster));

  if (activeId) {
    const idx = ordered.findIndex(p => p.id === activeId);
    const problem = ordered[idx];
    const next = ordered[(idx + 1) % ordered.length];
    return (
      <GotchaRunner
        key={problem.id}
        problem={problem}
        unlocked={isUnlocked()}
        onBack={() => setActiveId(null)}
        onNext={() => { setActiveId(next.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />
    );
  }

  // Group by cluster for display
  const groups = CLUSTER_ORDER
    .map(key => ({ key, meta: CLUSTERS[key], items: ordered.filter(p => p.cluster === key) }))
    .filter(g => g.items.length > 0);

  let cardIndex = 0;

  return (
    <div className="pal-page-enter">
      {/* Title */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <Icon name="alert-triangle" size={18} color="var(--yellow)" />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>Python Gotchas</h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '54ch' }}>
          The traps that survive code review and fail in production. Predict the output, run it for real, then see exactly what the interpreter did.
        </p>
      </div>

      <HowToStrip
        skill="Python intuition — the data-person to engineer mental model"
        steps={['Predict the output', 'Run it and watch', 'Read the glass box']}
      />

      {/* Cluster groups */}
      {groups.map(group => (
        <section key={group.key} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem' }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: group.meta.accent, display: 'inline-block' }} />
            <h2 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{group.meta.label}</h2>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{group.items.length}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: '0.85rem' }}>
            {group.items.map(p => {
              const seen = !!progress.seen[p.id];
              const solved = !!progress.solved[p.id];
              const delay = `${Math.min(cardIndex++ * 0.03, 0.5)}s`;
              return (
                <button
                  key={p.id}
                  onClick={() => { setActiveId(p.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="pal-card-enter pal-card-hover"
                  style={{
                    animationDelay: delay,
                    textAlign: 'left', cursor: 'pointer',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '0.9rem 1rem',
                    display: 'flex', flexDirection: 'column', gap: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.25 }}>{p.title}</span>
                    {solved
                      ? <Icon name="clipboard-check" size={15} color="var(--green-text)" />
                      : seen ? <Icon name="clock" size={14} color="var(--text-dim)" /> : null}
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{p.hook}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export default GotchaBrowser;
