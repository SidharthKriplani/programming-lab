// App — Programming Lab (PL) shell + state routing.
// Sibling-consistent with PAL: state-based `view` routing, lazy-loaded room
// pages with the named-export pattern, <Suspense> over <main>.
import { lazy, Suspense, useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { PlatinumMenuBar } from './components/layout/PlatinumMenuBar.jsx';
import { getSkin, cycleSkin } from './utils/skin.js';
import { Icon } from './components/shared/Icon.jsx';
import { BrandMark } from './components/shared/BrandMark.jsx';
import { gotchaProblems } from './data/gotchaProblems.js';
import { parseHash, setHash } from './utils/hashRoute.js';
import { onAuthStateChange, getUser, signInWithGoogle, signOut } from './utils/auth.js';
import { upsertLeaderboardRow } from './utils/leaderboard.js';
import { DailyRep } from './components/shared/DailyRep.jsx';

const GotchaBrowser = lazy(() =>
  import('./pages/GotchaBrowser.jsx').then(m => ({ default: m.GotchaBrowser }))
);
const KnowBrowser = lazy(() => import('./pages/KnowBrowser.jsx').then(m => ({ default: m.KnowBrowser })));
const JudgeBrowser = lazy(() => import('./pages/JudgeBrowser.jsx').then(m => ({ default: m.JudgeBrowser })));
const BuildBrowser = lazy(() => import('./pages/BuildBrowser.jsx').then(m => ({ default: m.BuildBrowser })));
const ProgressPage = lazy(() => import('./pages/ProgressPage.jsx').then(m => ({ default: m.ProgressPage })));
const PyLabBrowser = lazy(() => import('./pages/PyLabBrowser.jsx').then(m => ({ default: m.PyLabBrowser })));
const FoundationsBrowser = lazy(() => import('./pages/FoundationsBrowser.jsx').then(m => ({ default: m.FoundationsBrowser })));
const TrapMuseum = lazy(() => import('./pages/TrapMuseum.jsx').then(m => ({ default: m.TrapMuseum })));
const Leaderboard = lazy(() => import('./pages/Leaderboard.jsx').then(m => ({ default: m.Leaderboard })));
const MyTracksPage = lazy(() => import('./pages/MyTracksPage.jsx').then(m => ({ default: m.MyTracksPage })));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage.jsx').then(m => ({ default: m.RoadmapPage })));

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
      {/* Daily Rep — one runnable problem a day (family Daily Drill, PL edition) */}
      <DailyRep />

      {/* What's coming — the visible skeleton (Systems floor, Async, Notebook→Service) */}
      <button
        onClick={() => onNavigate('roadmap')}
        className="pal-card-enter pal-card-hover"
        style={{
          display: 'block', width: '100%', maxWidth: 560, textAlign: 'left', cursor: 'pointer',
          marginTop: '1rem', padding: '1rem 1.2rem', borderRadius: 14,
          background: 'var(--surface)', border: '1px solid var(--accent-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--accent)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            ◌ Roadmap · the skeleton is up
          </span>
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
          Systems Floor · Async & Concurrency · Notebook → Service
        </div>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
          16 new modules announced + Interview QnA rolling out across every Know module. See everything that's coming →
        </div>
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
  const [view, setView] = useState(() => parseHash().view);
  const [navOpen, setNavOpen] = useState(false);
  const [skin, setSkinState] = useState(getSkin());
  const [user, setUser] = useState(null);

  const navigate = (v) => { setView(v); setHash(v); setNavOpen(false); };
  const onCycleSkin = () => setSkinState(cycleSkin());
  const onSignIn = () => signInWithGoogle();
  const onSignOut = () => { signOut(); setUser(null); };

  // Auth session — shared with PAL (same Supabase project). On sign-in, push the
  // user's current PL total to the leaderboard so their row exists immediately.
  useEffect(() => {
    getUser().then(u => { if (u) { setUser(u); upsertLeaderboardRow(u); } });
    const { data } = onAuthStateChange((event, session) => {
      if (session && session.user) {
        setUser(session.user);
        if (event === 'SIGNED_IN') upsertLeaderboardRow(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    return () => { data?.subscription?.unsubscribe?.(); };
  }, []);

  // Deep linking: reflect back/forward + external links into the view. PyLab/Gotchas read
  // the sub-path (problem id) themselves; here we only track the top-level view.
  useEffect(() => {
    const onHash = () => setView(parseHash().view);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // global shortcut: "p" jumps to PyLab — guarded so it never fires while typing,
  // including in the CodeMirror contenteditable (the exact class of bug PAL hit).
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (e.key === 'p' || e.key === 'P') { e.preventDefault(); setView('pylab'); setHash('pylab'); setNavOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // PyLab opens as its OWN full-screen room (no app sidebar) — like SQL Lab in PAL.
  if (view === 'pylab') {
    return (
      <div className="app-layout">
        {skin === 'platinum' && <PlatinumMenuBar />}
        <div className="app-main-wrapper">
          <main className="app-main">
            <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 260 }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>loading…</span></div>}>
              <PyLabBrowser onExitRoom={() => navigate('home')} initialTarget={parseHash().sub} />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {skin === 'platinum' && <PlatinumMenuBar />}
      <Sidebar view={view} onNavigate={navigate} open={navOpen} onClose={() => setNavOpen(false)} skin={skin} onCycleSkin={onCycleSkin} user={user} onSignIn={onSignIn} onSignOut={onSignOut} />

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
            {view === 'gotchas' ? <GotchaBrowser initialTarget={parseHash().sub} />
              : view === 'progress' ? <ProgressPage onNavigate={navigate} />
              : view === 'foundations' ? <FoundationsBrowser />
              : view === 'know' ? <KnowBrowser />
              : view === 'judge' ? <JudgeBrowser />
              : view === 'trapmuseum' ? <TrapMuseum />
              : view === 'build' ? <BuildBrowser />
              : view === 'roadmap' ? <RoadmapPage onNavigate={navigate} />
              : view === 'tracks' ? <MyTracksPage />
              : view === 'leaderboard' ? <Leaderboard user={user} onSignIn={onSignIn} />
              : <Home onNavigate={navigate} />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
