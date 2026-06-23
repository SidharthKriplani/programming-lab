// App — Programming Lab (PL) shell + state routing.
// Sibling-consistent with PAL: state-based `view` routing, lazy-loaded room
// pages with the named-export pattern, <Suspense> over <main>.
import { lazy, Suspense, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { PlatinumMenuBar } from './components/layout/PlatinumMenuBar.jsx';
import { getSkin, cycleSkin } from './utils/skin.js';
import { Icon } from './components/shared/Icon.jsx';
import { BrandMark } from './components/shared/BrandMark.jsx';
import { gotchaProblems } from './data/gotchaProblems.js';
import { pythonProblems, PY_PATTERNS, PY_PATTERN_ORDER } from './data/pythonProblems.js';
import { pandasProblems, PD_PATTERNS, PD_PATTERN_ORDER } from './data/pandasProblems.js';
import { idiomsProblems, IDIOM_PATTERNS, IDIOM_PATTERN_ORDER } from './data/idiomsProblems.js';
import { oopProblems, OOP_PATTERNS, OOP_PATTERN_ORDER } from './data/oopProblems.js';
import { PYTHON_KEY, PANDAS_KEY, IDIOMS_KEY, OOP_KEY } from './utils/problemProgress.js';

const GotchaBrowser = lazy(() =>
  import('./pages/GotchaBrowser.jsx').then(m => ({ default: m.GotchaBrowser }))
);
const ProblemBrowser = lazy(() =>
  import('./pages/ProblemBrowser.jsx').then(m => ({ default: m.ProblemBrowser }))
);
const KnowBrowser = lazy(() => import('./pages/KnowBrowser.jsx').then(m => ({ default: m.KnowBrowser })));
const JudgeBrowser = lazy(() => import('./pages/JudgeBrowser.jsx').then(m => ({ default: m.JudgeBrowser })));
const BuildBrowser = lazy(() => import('./pages/BuildBrowser.jsx').then(m => ({ default: m.BuildBrowser })));
const ProgressPage = lazy(() => import('./pages/ProgressPage.jsx').then(m => ({ default: m.ProgressPage })));

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
        <Icon name="terminal" size={16} color="currentColor" />
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
  const [skin, setSkinState] = useState(getSkin());

  const navigate = (v) => { setView(v); setNavOpen(false); };
  const onCycleSkin = () => setSkinState(cycleSkin());

  return (
    <div className="app-layout">
      {skin === 'platinum' && <PlatinumMenuBar />}
      <Sidebar view={view} onNavigate={navigate} open={navOpen} onClose={() => setNavOpen(false)} skin={skin} onCycleSkin={onCycleSkin} />

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
            {view === 'gotchas' ? <GotchaBrowser />
              : view === 'python' ? (
                <ProblemBrowser
                  title="Python Drills" iconName="code-2" iconColor="var(--accent)"
                  subtitle="Famous Python problems by pattern — hashing, sliding window, stack, prefix sum. Write the function, run the hidden tests."
                  problems={pythonProblems} patterns={PY_PATTERNS} patternOrder={PY_PATTERN_ORDER}
                  progressKey={PYTHON_KEY} packages={['numpy']} />
              )
              : view === 'pandas' ? (
                <ProblemBrowser
                  title="pandas / numpy" iconName="layers" iconColor="var(--teal)"
                  subtitle="The analyst-native operations — groupby, merge, pivot, vectorize. Real pandas, running in your browser."
                  problems={pandasProblems} patterns={PD_PATTERNS} patternOrder={PD_PATTERN_ORDER}
                  progressKey={PANDAS_KEY} packages={['pandas']} />
              )
              : view === 'idioms' ? (
                <ProblemBrowser
                  title="Python Idioms" iconName="pen-line" iconColor="var(--accent)"
                  subtitle="The fluent way to write Python — comprehensions, Counter/defaultdict, itertools/functools, context managers, decorators, dunder."
                  problems={idiomsProblems} patterns={IDIOM_PATTERNS} patternOrder={IDIOM_PATTERN_ORDER}
                  progressKey={IDIOMS_KEY} packages={[]} />
              )
              : view === 'oop' ? (
                <ProblemBrowser
                  title="Python OOP" iconName="layers" iconColor="var(--purple)"
                  subtitle="Classes, dataclasses, properties, inheritance vs composition, and the dunder methods that make objects behave Pythonically."
                  problems={oopProblems} patterns={OOP_PATTERNS} patternOrder={OOP_PATTERN_ORDER}
                  progressKey={OOP_KEY} packages={[]} />
              )
              : view === 'progress' ? <ProgressPage onNavigate={navigate} />
              : view === 'know' ? <KnowBrowser />
              : view === 'judge' ? <JudgeBrowser />
              : view === 'build' ? <BuildBrowser />
              : <Home onNavigate={navigate} />}
          </Suspense>
        </main>
      </div>

      {/* CRT green-screen scanline + vignette overlay (dark identity only; CSS-gated) */}
      <div className="pl-crt-overlay" aria-hidden="true" />
    </div>
  );
}
