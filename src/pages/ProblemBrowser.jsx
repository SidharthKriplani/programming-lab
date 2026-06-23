// ProblemBrowser — filterable browse table for a test-based bank, modeled on PAL's
// SQL Lab browse: progress bar, search, difficulty + solved/unsolved filters, and a
// dense scannable table (level · problem · topics). Opens the two-pane ProblemRunner.
import { useState } from 'react';
import { ProblemRunner } from './ProblemRunner.jsx';
import { Icon } from '../components/shared/Icon.jsx';
import { getProgress } from '../utils/problemProgress.js';
import { isUnlocked } from '../utils/unlock.js';

const DIFF_META = {
  warmup:  { label: 'Warmup',  color: 'var(--green-text)' },
  core:    { label: 'Core',    color: 'var(--accent)' },
  stretch: { label: 'Stretch', color: 'var(--yellow-text)' },
};

function FilterPill({ active, onClick, children, color }) {
  return (
    <button onClick={onClick} style={{
      padding: '0.28rem 0.7rem', borderRadius: 999, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
      border: `1px solid ${active ? (color || 'var(--accent)') : 'var(--border)'}`,
      background: active ? 'var(--accent-bg)' : 'transparent',
      color: active ? (color || 'var(--accent)') : 'var(--text-muted)',
    }}>{children}</button>
  );
}

export function ProblemBrowser({ title, subtitle, iconName, iconColor, problems, patterns, patternOrder, progressKey, packages = [] }) {
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState('');
  const [diff, setDiff] = useState('all');
  const [status, setStatus] = useState('all');
  const progress = getProgress(progressKey);

  const ordered = problems.slice().sort((a, b) => patternOrder.indexOf(a.pattern) - patternOrder.indexOf(b.pattern));
  const solvedCount = ordered.filter(p => progress.solved[p.id]).length;

  if (activeId) {
    const idx = ordered.findIndex(p => p.id === activeId);
    const problem = ordered[idx];
    const next = ordered[(idx + 1) % ordered.length];
    return (
      <ProblemRunner
        key={problem.id}
        problem={problem} patterns={patterns} progressKey={progressKey} packages={packages}
        unlocked={isUnlocked()}
        onBack={() => setActiveId(null)}
        onNext={() => { setActiveId(next.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />
    );
  }

  const q = query.trim().toLowerCase();
  const rows = ordered.filter(p => {
    if (diff !== 'all' && p.difficulty !== diff) return false;
    if (status === 'solved' && !progress.solved[p.id]) return false;
    if (status === 'unsolved' && progress.solved[p.id]) return false;
    if (q && !(`${p.title} ${(patterns[p.pattern] || {}).label || ''}`.toLowerCase().includes(q))) return false;
    return true;
  });
  const pct = ordered.length ? Math.round((solvedCount / ordered.length) * 100) : 0;

  return (
    <div className="pal-page-enter">
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name={iconName} size={18} color={iconColor || 'var(--accent)'} />
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>{title}</h1>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{solvedCount} / {ordered.length} solved</span>
          </div>
          {subtitle && <p style={{ margin: '0.3rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '60ch' }}>{subtitle}</p>}
        </div>
        <div style={{ width: 140, height: 6, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--gradient-accent)' }} />
        </div>
      </div>

      {/* controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0 1.1rem' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <Icon name="search" size={14} color="var(--text-dim)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search problems…"
            style={{ width: '100%', padding: '0.45rem 0.7rem 0.45rem 1.9rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '0.85rem' }} />
        </div>
        <FilterPill active={diff === 'all'} onClick={() => setDiff('all')}>All</FilterPill>
        <FilterPill active={diff === 'warmup'} onClick={() => setDiff('warmup')} color={DIFF_META.warmup.color}>Warmup</FilterPill>
        <FilterPill active={diff === 'core'} onClick={() => setDiff('core')} color={DIFF_META.core.color}>Core</FilterPill>
        <FilterPill active={diff === 'stretch'} onClick={() => setDiff('stretch')} color={DIFF_META.stretch.color}>Stretch</FilterPill>
        <span style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 0.2rem' }} />
        <FilterPill active={status === 'all'} onClick={() => setStatus('all')}>All</FilterPill>
        <FilterPill active={status === 'unsolved'} onClick={() => setStatus('unsolved')}>Unsolved</FilterPill>
        <FilterPill active={status === 'solved'} onClick={() => setStatus('solved')} color="var(--green-text)">Solved</FilterPill>
      </div>

      {/* table */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '92px 1fr auto', gap: '0.5rem', padding: '0.5rem 0.95rem', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          <span>Level</span><span>Problem</span><span>Topic</span>
        </div>
        {rows.map(p => {
          const dm = DIFF_META[p.difficulty] || DIFF_META.core;
          const pm = patterns[p.pattern] || { label: p.pattern, accent: 'var(--accent)' };
          const solved = !!progress.solved[p.id];
          const seen = !!progress.seen[p.id];
          return (
            <button key={p.id} onClick={() => { setActiveId(p.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="pl-row"
              style={{ width: '100%', display: 'grid', gridTemplateColumns: '92px 1fr auto', gap: '0.5rem', alignItems: 'center', padding: '0.55rem 0.95rem', background: 'none', border: 'none', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: solved ? 'var(--green-text)' : (seen ? 'var(--text-dim)' : 'transparent'), border: solved || seen ? 'none' : '1px solid var(--border-strong)' }} />
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: dm.color }}>{dm.label}</span>
              </span>
              <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)' }}>{p.title}</span>
              <span className="pl-chip" style={{ color: pm.accent, borderColor: pm.accent, background: 'transparent', justifySelf: 'end' }}>{pm.label}</span>
            </button>
          );
        })}
        {rows.length === 0 && (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No problems match these filters.</div>
        )}
      </div>
    </div>
  );
}

export default ProblemBrowser;
