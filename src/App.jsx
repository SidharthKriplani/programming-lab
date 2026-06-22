// App — Programming Lab (PL) shell + state routing.
// Sibling-consistent with PAL: state-based `view` routing, lazy-loaded room
// pages with the named-export pattern, <Suspense> over <main>.
import { lazy, Suspense, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { Icon } from './components/shared/Icon.jsx';
import { BrandMark } from './components/shared/BrandMark.jsx';
import { gotchaProblems } from './data/gotchaProblems.js';

const GotchaBrowser = lazy(() =>
  import('./pages/GotchaBrowser.jsx').then(m => ({ default: m.GotchaBrowser }))
);

function Home({ onNavigate }) {
  return (
    <div className="pal-page-enter" style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '1.4rem' }}>
        <BrandMark variant="wordmark" size={30} />
      </div>
      <span className="pal-badge-accent" style={{ marginBottom: '1rem' }}>DO · Fluency</span>
      <h1 style={{ margin: '0 0 0.6rem', fontSize: '2rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.15 }}>
        Feel the machine.
      </h1>
      <p style={{ margin: '0 0 1.4rem', fontSize: '1.02rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Programming Lab is the SWE layer for data people — the Python, DSA, and pandas fluency the
        analytics and ML work assumes you already have. Start with the traps that pass code review and
        fail in production: predict the output, watch it break, and keep the reflex.
      </p>
      <button onClick={() => onNavigate('gotchas')} className="pal-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon name="terminal" size={16} color="#fff" />
        Start: Python Gotchas ({gotchaProblems.length})
      </button>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
        <span>· no install</span>
        <span>· real CPython (Pyodide)</span>
        <span>· every gotcha is a post you can ship</span>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('home');
  const [navOpen, setNavOpen] = useState(false);

  const navigate = (v) => { setView(v); setNavOpen(false); };

  return (
    <div className="app-layout">
      <Sidebar view={view} onNavigate={navigate} open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="app-main-wrapper">
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <button className="mobile-menu-btn" onClick={() => setNavOpen(o => !o)} aria-label="Menu">☰</button>
          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text)' }}>Programming Lab</span>
        </div>

        <main className="app-main">
          <Suspense fallback={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 260, gap: '0.75rem' }}>
              <BrandMark variant="monogram" size={40} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>loading…</span>
            </div>
          }>
            {view === 'gotchas' ? <GotchaBrowser /> : <Home onNavigate={navigate} />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
