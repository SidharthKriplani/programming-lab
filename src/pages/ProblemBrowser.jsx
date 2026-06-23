// ProblemBrowser — generic DO-room browser for a test-based bank (Python drills,
// pandas). Cluster-grouped grid; opens a ProblemRunner. Named export (App lazy-loads it).
import { useState } from 'react';
import { ProblemRunner } from './ProblemRunner.jsx';
import { HowToStrip } from '../components/shared/HowToStrip.jsx';
import { Icon } from '../components/shared/Icon.jsx';
import { getProgress } from '../utils/problemProgress.js';
import { isUnlocked } from '../utils/unlock.js';

const GRID_COLS = 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))';

export function ProblemBrowser({ title, subtitle, iconName, iconColor, problems, patterns, patternOrder, progressKey, packages = [], howSteps }) {
  const [activeId, setActiveId] = useState(null);
  const progress = getProgress(progressKey);

  const ordered = problems.slice().sort((a, b) => patternOrder.indexOf(a.pattern) - patternOrder.indexOf(b.pattern));

  if (activeId) {
    const idx = ordered.findIndex(p => p.id === activeId);
    const problem = ordered[idx];
    const next = ordered[(idx + 1) % ordered.length];
    return (
      <ProblemRunner
        key={problem.id}
        problem={problem}
        patterns={patterns}
        progressKey={progressKey}
        packages={packages}
        unlocked={isUnlocked()}
        onBack={() => setActiveId(null)}
        onNext={() => { setActiveId(next.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />
    );
  }

  const groups = patternOrder
    .map(key => ({ key, meta: patterns[key], items: ordered.filter(p => p.pattern === key) }))
    .filter(g => g.items.length > 0);

  let cardIndex = 0;

  return (
    <div className="pal-page-enter">
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <Icon name={iconName} size={18} color={iconColor || 'var(--accent)'} />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>{title}</h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '56ch' }}>{subtitle}</p>
      </div>

      <HowToStrip skill={title} steps={howSteps || ['Read the prompt', 'Write the function', 'Run the tests']} />

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
                    animationDelay: delay, textAlign: 'left', cursor: 'pointer',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '0.9rem 1rem',
                    display: 'flex', flexDirection: 'column', gap: '0.4rem',
                    borderTop: `2px solid ${group.meta.accent}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.25 }}>{p.title}</span>
                    {solved
                      ? <Icon name="check" size={15} color="var(--green-text)" />
                      : seen ? <Icon name="clock" size={14} color="var(--text-dim)" /> : null}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{p.prompt.split('. ')[0]}.</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export default ProblemBrowser;
