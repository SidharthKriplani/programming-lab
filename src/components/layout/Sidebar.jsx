// Sidebar — PL left nav, built to the HQ Sidebar Standard (DESIGN-STANDARD.md):
// four-frame accordion (KNOW/DO/BUILD/JUDGE), ONE OPEN PER LEVEL, measured-height
// animation, frame icons, active pill, SOON badges. Violet accent (PL). The
// Collapsible/Chevron/NavItem are hoisted to module scope (required — defining
// them inside Sidebar gives them new identities each render and breaks the animation).
import { useState, useEffect, useRef } from 'react';
import { Icon } from '../shared/Icon.jsx';
import { getCounts as gotchaCounts } from '../../utils/gotchaProgress.js';
import { gotchaProblems } from '../../data/gotchaProblems.js';
import { pythonProblems } from '../../data/pythonProblems.js';
import { pandasProblems } from '../../data/pandasProblems.js';
import { idiomsProblems } from '../../data/idiomsProblems.js';
import { oopProblems } from '../../data/oopProblems.js';
import { knowModules } from '../../data/knowModules.js';
import { FOUNDATION_TALLY } from '../../data/foundationsRooms.js';
import { judgeProblems } from '../../data/judgeProblems.js';
import { buildProjects } from '../../data/buildProjects.js';
import { pyLabProblems } from '../../data/pyLabProblems.js';
import { getCounts as problemCounts, PYTHON_KEY, PANDAS_KEY, BUILD_KEY, IDIOMS_KEY, OOP_KEY } from '../../utils/problemProgress.js';
import { getTheme, toggleTheme } from '../../utils/theme.js';
import { BrandMark } from '../shared/BrandMark.jsx';

// ── measured-height collapse (the bulletproof pattern; NOT grid-template-rows) ──
function Collapsible({ open, children }) {
  const ref = useRef(null);
  const [height, setHeight] = useState(open ? 'auto' : '0px');
  const mounted = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (!mounted.current) { mounted.current = true; return; }
    let r1, r2;
    const onEnd = e => { if (e.target === el && e.propertyName === 'height') { if (open) setHeight('auto'); el.removeEventListener('transitionend', onEnd); } };
    if (open) { setHeight(el.scrollHeight + 'px'); el.addEventListener('transitionend', onEnd); }
    else { setHeight(el.scrollHeight + 'px'); r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setHeight('0px')); }); }
    return () => { el.removeEventListener('transitionend', onEnd); if (r1) cancelAnimationFrame(r1); if (r2) cancelAnimationFrame(r2); };
  }, [open]);
  return <div ref={ref} style={{ height, overflow: 'hidden', transition: 'height 0.30s cubic-bezier(0.33,1,0.68,1)', willChange: 'height' }}>{children}</div>;
}

function Chevron({ open }) {
  return (
    <span style={{ display: 'inline-flex', transition: 'transform 0.30s cubic-bezier(0.33,1,0.68,1)', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
      <Icon name="chevron-down" size={13} color={open ? 'var(--accent)' : 'var(--text-dim)'} />
    </span>
  );
}

function NavItem({ label, icon, active, soon, count, total, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={soon}
      aria-current={active ? 'page' : undefined}
      className={active ? 'sidebar-nav-active' : ''}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: sub ? '0.4rem 0.6rem' : '0.46rem 0.6rem',
        marginBottom: '0.1rem', background: 'none', border: 'none', borderRadius: 'var(--radius-sm)',
        fontSize: sub ? '0.8rem' : '0.84rem', textAlign: 'left',
        color: soon ? 'var(--text-dim)' : 'var(--text)',
        cursor: soon ? 'default' : 'pointer', opacity: soon ? 0.7 : 1,
      }}
    >
      {icon && <Icon name={icon} size={14} color={active ? 'currentColor' : 'var(--text-muted)'} />}
      <span style={{ flex: 1 }}>{label}</span>
      {!soon && total > 0 && (
        <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: active ? 'currentColor' : 'var(--text-muted)' }}>{count}/{total}</span>
      )}
      {soon && (
        <span style={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-dim)', border: '1px solid var(--border)', borderRadius: 999, padding: '1px 6px', fontFamily: 'var(--font-mono)' }}>SOON</span>
      )}
    </button>
  );
}

// ── nav model ──
const TRACK = [
  { label: 'Home', view: 'home', icon: 'layout' },
  { label: 'Progress', view: 'progress', icon: 'bar-chart' },
];

const FRAMES = [
  { key: 'KNOW', icon: 'book-open', items: [
    { label: 'Foundations', view: 'foundations', icon: 'book-open', bank: 'foundations' },
    { label: 'Python & OOP Depth', view: 'know', icon: 'brain', bank: 'know' },
  ] },
  { key: 'DO', icon: 'terminal', items: [
    { label: 'PyLab', view: 'pylab', icon: 'layers', bank: 'pylab' },
    { label: 'Python Gotchas', view: 'gotchas', icon: 'alert-triangle', bank: 'gotchas' },
  ] },
  { key: 'BUILD', icon: 'hammer', items: [{ label: 'Mini-Projects', view: 'build', icon: 'hammer', bank: 'build' }] },
  { key: 'JUDGE', icon: 'scale', items: [{ label: 'Spot the Flaw', view: 'judge', icon: 'alert-triangle', bank: 'judge' }] },
];

// which frame owns a given view (follows-navigation auto-expand)
const VIEW_FRAME = { pylab: 'DO', gotchas: 'DO', python: 'DO', idioms: 'DO', oop: 'DO', pandas: 'DO', foundations: 'KNOW', know: 'KNOW', judge: 'JUDGE', build: 'BUILD' };

const BANK_TOTAL = {
  pylab: pyLabProblems.length,
  gotchas: gotchaProblems.length, python: pythonProblems.length, pandas: pandasProblems.length,
  idioms: idiomsProblems.length, oop: oopProblems.length,
  foundations: FOUNDATION_TALLY.modules,
  know: knowModules.length, judge: judgeProblems.length, build: buildProjects.length,
};
function bankSolved(bank) {
  if (bank === 'pylab') return problemCounts('pl-pylab-progress-v1').solved;
  if (bank === 'python') return problemCounts(PYTHON_KEY).solved;
  if (bank === 'pandas') return problemCounts(PANDAS_KEY).solved;
  if (bank === 'gotchas') return gotchaCounts().solved;
  if (bank === 'idioms') return problemCounts(IDIOMS_KEY).solved;
  if (bank === 'oop') return problemCounts(OOP_KEY).solved;
  if (bank === 'know') return problemCounts('pl-know-progress-v1').solved;
  if (bank === 'judge') return problemCounts('pl-judge-progress-v1').solved;
  if (bank === 'build') return problemCounts(BUILD_KEY).solved;
  return 0;
}

export function Sidebar({ view, onNavigate, open = false, onClose, skin = 'platinum', onCycleSkin }) {
  const [theme, setThemeState] = useState(getTheme());
  const [openFrame, setOpenFrame] = useState(VIEW_FRAME[view] || 'DO');

  // follows-navigation: opening a tab auto-expands its frame (one-open-per-level)
  useEffect(() => {
    const f = VIEW_FRAME[view];
    if (f) setOpenFrame(f);
  }, [view]);

  const noIcons = skin === 'platinum'; // Platinum nav is text-only (Sidharth: drop the symbols)
  const go = (v) => { onNavigate(v); onClose?.(); };

  return (
    <aside className={`app-sidebar${open ? ' open' : ''}`}>
      {/* Logo lockup — stacked: break⌇labs / Programming / tagline */}
      <button
        onClick={() => go('home')}
        style={{ display: 'flex', padding: '1.1rem 1.15rem', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <BrandMark variant="wordmark" size={16} />
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: '0.82rem', color: 'var(--accent)', letterSpacing: '-0.01em' }}>Programming</span>
          <span style={{ fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>SWE for data people</span>
        </span>
      </button>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.7rem' }}>
        {/* TRACK cluster — flat, always visible */}
        <div style={{ marginBottom: '0.85rem' }}>
          {TRACK.map(t => (
            <NavItem key={t.label} label={t.label} icon={noIcons ? undefined : t.icon} active={view === t.view} onClick={() => go(t.view)} />
          ))}
        </div>

        {/* The four frames — accordion, one open per level */}
        {FRAMES.map(frame => {
          const isOpen = openFrame === frame.key;
          return (
            <div key={frame.key} style={{ marginBottom: '0.15rem' }}>
              <button
                onClick={() => setOpenFrame(prev => (prev === frame.key ? null : frame.key))}
                aria-expanded={isOpen}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.42rem 0.55rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
              >
                {!noIcons && <Icon name={frame.icon} size={13} color={isOpen ? 'var(--accent)' : 'var(--text-muted)'} style={{ opacity: isOpen ? 1 : 0.62 }} />}
                <span style={{ flex: 1, textAlign: 'left', fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.11em', textTransform: 'uppercase', color: isOpen ? 'var(--accent)' : 'var(--text-muted)' }}>{frame.key}</span>
                <Chevron open={isOpen} />
              </button>

              <Collapsible open={isOpen}>
                <div style={{ marginLeft: '0.7rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border)', margin: '0.15rem 0 0.5rem 0.7rem' }}>
                  {frame.items.map(item => {
                    const live = !!item.view;
                    return (
                      <NavItem
                        key={item.label}
                        sub
                        label={item.label}
                        icon={noIcons ? undefined : item.icon}
                        active={live && view === item.view}
                        soon={!live}
                        count={live ? bankSolved(item.bank) : 0}
                        total={live ? (BANK_TOTAL[item.bank] || 0) : 0}
                        onClick={() => live && go(item.view)}
                      />
                    );
                  })}
                </div>
              </Collapsible>
            </div>
          );
        })}
      </nav>

      {/* Footer — break⌇labs wordmark + theme toggle */}
      <div style={{ padding: '0.7rem 1.05rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BrandMark variant="wordmark" size={13} />
          {onCycleSkin && (
            <button
              onClick={onCycleSkin}
              title={skin === 'platinum' ? 'Switch to dark' : 'Switch to light'}
              aria-label="Toggle light or dark"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <Icon name={skin === 'platinum' ? 'moon' : 'sun'} size={15} color="var(--text-muted)" />
            </button>
          )}
        </div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>part of BreakLabs · Beta</div>
      </div>
    </aside>
  );
}

export default Sidebar;
