// Sidebar — primary nav for Programming Lab (PL).
// Adapted from PAL Sidebar.jsx: same shell, same active-pill pattern
// (.sidebar-nav-active), same getIsActive mapping. Nav groups are the four
// Competence-Model frames (D-15): KNOW / DO / BUILD / JUDGE. PL's first live
// surface is the DO rung -> "Python Gotchas". The other zones are stubbed "Soon".
import { useState } from 'react';
import { Icon } from '../shared/Icon.jsx';
import { getCounts } from '../../utils/gotchaProgress.js';
import { gotchaProblems } from '../../data/gotchaProblems.js';
import { getTheme, toggleTheme } from '../../utils/theme.js';
import { BrandMark } from '../shared/BrandMark.jsx';

const ZONES = [
  {
    key: 'KNOW', icon: 'book-open', blurb: 'Understand the why',
    items: [{ label: 'Python & OOP Depth', soon: true }],
  },
  {
    key: 'DO', icon: 'terminal', blurb: 'Code it, fast and correct',
    items: [{ label: 'Python Gotchas', view: 'gotchas', icon: 'alert-triangle' }],
  },
  {
    key: 'BUILD', icon: 'hammer', blurb: 'Own something real',
    items: [{ label: 'Mini-Projects', soon: true }],
  },
  {
    key: 'JUDGE', icon: 'scale', blurb: 'Choose & defend',
    items: [{ label: 'Spot the Flaw', soon: true }],
  },
];

export function Sidebar({ view, onNavigate, open = false, onClose }) {
  const counts = getCounts();
  const [theme, setThemeState] = useState(getTheme());

  return (
    <aside className={`app-sidebar${open ? ' open' : ''}`}>
      {/* Brand */}
      <button
        onClick={() => { onNavigate('home'); onClose?.(); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          padding: '1.1rem 1.15rem', background: 'none', border: 'none',
          borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <BrandMark variant="full" descriptor="Programming" accent="#8B5CF6" size={14} />
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', paddingLeft: '2px' }}>SWE for data people</span>
        </span>
      </button>

      {/* Zones */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.85rem 0.7rem' }}>
        {ZONES.map(zone => (
          <div key={zone.key} style={{ marginBottom: '1.15rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              padding: '0 0.45rem', marginBottom: '0.4rem',
            }}>
              <Icon name={zone.icon} size={13} color="var(--text-muted)" />
              <span style={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)' }}>{zone.key}</span>
            </div>

            {zone.items.map(item => {
              const active = item.view && view === item.view;
              const isLive = !!item.view;
              const solvedHere = item.view === 'gotchas' ? counts.solved : 0;
              const totalHere = item.view === 'gotchas' ? gotchaProblems.length : 0;
              return (
                <button
                  key={item.label}
                  onClick={() => { if (isLive) { onNavigate(item.view); onClose?.(); } }}
                  disabled={!isLive}
                  className={active ? 'sidebar-nav-active' : ''}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.46rem 0.6rem', marginBottom: '0.15rem',
                    background: 'none', border: 'none', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.84rem', textAlign: 'left',
                    color: isLive ? 'var(--text)' : 'var(--text-dim)',
                    cursor: isLive ? 'pointer' : 'default',
                    opacity: isLive ? 1 : 0.65,
                  }}
                >
                  {item.icon && <Icon name={item.icon} size={14} color={active ? 'var(--accent)' : 'var(--text-muted)'} />}
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {isLive && totalHere > 0 && (
                    <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {solvedHere}/{totalHere}
                    </span>
                  )}
                  {!isLive && (
                    <span style={{ fontSize: '0.56rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-dim)', border: '1px solid var(--border)', borderRadius: 99, padding: '0.05rem 0.35rem' }}>SOON</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer — break⌇labs wordmark + theme toggle */}
      <div style={{ padding: '0.7rem 1.05rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BrandMark variant="wordmark" size={13} />
          <button
            onClick={() => setThemeState(toggleTheme())}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} color="var(--text-muted)" />
          </button>
        </div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>part of BreakLabs · Beta</div>
      </div>
    </aside>
  );
}

export default Sidebar;
