// MockLoop — the Mock-loop format (PYLAB-VISION §3, Phase 3): a timed interview
// session over the PyLab bank. No reveal, no model solution, no judgment layer until
// the end — just the clock and the next problem. The closing scorecard feeds spaced
// repetition (passes graduate, misses get queued). Reuses runPyLab for grading.
import { useState, useEffect, useRef } from 'react';
import { pyLabProblems, PYLAB_TOPICS } from '../../data/pyLabProblems.js';
import { pyLabFixtures } from '../../data/pyLabFixtures.js';
import { PythonCell } from '../ide/PythonCell.jsx';
import { loadPython, loadPackages, runPyLab } from '../ide/pyodideRuntime.js';
import { reviewSR } from '../../utils/pyLabSR.js';
import { markSolved } from '../../utils/problemProgress.js';
import { LEVELS, LEVEL_ORDER, levelOf } from '../../data/pyLabMeta.js';
import { Icon } from './Icon.jsx';

const KEY = 'pl-pylab-progress-v1';

function shuffle(a) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; }
  return x;
}
const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

export function MockLoop({ onExit }) {
  const [phase, setPhase] = useState('setup'); // setup | running | done
  const [count, setCount] = useState(5);
  const [focus, setFocus] = useState('all');
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [code, setCode] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [last, setLast] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);
  const probStartRef = useRef(0);

  useEffect(() => {
    if (phase !== 'running') return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const levelsWithProblems = LEVEL_ORDER.filter(lv => pyLabProblems.some(p => levelOf(p) === lv));

  function start() {
    let pool = pyLabProblems;
    if (focus !== 'all') pool = pool.filter(p => levelOf(p) === focus);
    const q = shuffle(pool).slice(0, Math.min(count, pool.length));
    if (!q.length) return;
    setQueue(q); setIdx(0); setResults([]); setCode(q[0].starterCode); setLast(null);
    startRef.current = Date.now(); probStartRef.current = Date.now(); setElapsed(0);
    setPhase('running');
  }

  const problem = queue[idx];
  const fx = problem ? pyLabFixtures[problem.fixtureId] : null;

  async function submit() {
    setBusy(true); setLast(null);
    try { await loadPython(m => setProgress(m)); await loadPackages(['pandas', 'numpy'], m => setProgress(m)); }
    catch (e) { setBusy(false); setLast({ pass: false, error: 'runtime: ' + e.message }); return; }
    setProgress('');
    const res = await runPyLab(code, problem.solution, fx.setup, fx.args, problem.compare);
    setLast(res); setBusy(false);
  }

  function next() {
    const ms = Date.now() - probStartRef.current;
    const pass = !!(last && last.pass);
    reviewSR(problem.id, pass);
    if (pass) markSolved(KEY, problem.id);
    const recs = [...results, { id: problem.id, title: problem.title, pass, ms }];
    setResults(recs);
    if (idx + 1 >= queue.length) { setPhase('done'); return; }
    const ni = idx + 1;
    setIdx(ni); setCode(queue[ni].starterCode); setLast(null); probStartRef.current = Date.now();
  }

  // ── setup ──
  if (phase === 'setup') {
    return (
      <div className="pal-page-enter" style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Header onExit={onExit} title="Mock interview" />
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          A timed run with no safety net — no reveal, no model solution, no hints. Solve, submit, move on. You get a scorecard at the end, and anything you miss is queued for review.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>How many problems</label>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[3, 5, 8].map(n => (
              <button key={n} onClick={() => setCount(n)} style={pill(count === n)}>{n}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Focus</label>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button onClick={() => setFocus('all')} style={pill(focus === 'all')}>Mixed</button>
            {levelsWithProblems.map(lv => (
              <button key={lv} onClick={() => setFocus(lv)} style={pill(focus === lv)}>{LEVELS[lv].label}</button>
            ))}
          </div>
        </div>
        <button onClick={start} className="pal-btn-primary" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
          <Icon name="clock" size={15} color="currentColor" /> Start the clock
        </button>
      </div>
    );
  }

  // ── done ──
  if (phase === 'done') {
    const passed = results.filter(r => r.pass).length;
    return (
      <div className="pal-page-enter" style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Header onExit={onExit} title="Mock interview — scorecard" />
        <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
          <Stat label="Solved" value={passed + ' / ' + results.length} tone={passed === results.length ? 'good' : null} />
          <Stat label="Total time" value={fmt(elapsed)} />
          <Stat label="Avg / problem" value={fmt(results.length ? elapsed / results.length : 0)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {results.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.8rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}>
              <Icon name={r.pass ? 'check' : 'x'} size={15} color={r.pass ? 'var(--green-text)' : 'var(--red-text)'} />
              <span style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600 }}>{i + 1}. {r.title}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{fmt(r.ms / 1000)}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          {results.length - passed > 0
            ? (results.length - passed) + ' missed — queued for review (they\'ll resurface in PyLab).'
            : 'Clean sweep. Each is scheduled to come back later so it sticks.'}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setPhase('setup')} className="pal-btn-primary">New mock</button>
          <button onClick={onExit} style={pill(false)}>Back to PyLab</button>
        </div>
      </div>
    );
  }

  // ── running ──
  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={onExit} title="End session" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.5rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
          <Icon name="x" size={16} color="var(--text-muted)" />
        </button>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>Problem {idx + 1} of {queue.length}</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Icon name="clock" size={14} color="var(--accent)" /> {fmt(elapsed)}
        </span>
      </div>

      <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: ((idx) / queue.length * 100) + '%', background: 'var(--accent)' }} />
      </div>

      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.3rem' }}>{PYLAB_TOPICS[problem.topic] || problem.topic} · {LEVELS[levelOf(problem)].label}</div>
        <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)' }}>{problem.title}</h1>
      </div>
      <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.94rem', lineHeight: 1.6 }}>{problem.prompt}</p>
      {fx && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>input · {fx.preview}</div>}

      <PythonCell key={problem.id} initialCode={problem.starterCode} label={problem.signature || 'solution.py'} glassBox onCodeChange={setCode} height={Math.min(360, 120 + problem.starterCode.split('\n').length * 19)} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
        <button onClick={submit} disabled={busy} className="pal-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
          <Icon name="check" size={14} color="currentColor" /> {busy ? (progress || 'Checking…') : 'Submit'}
        </button>
        <button onClick={next} style={pill(false)}>{idx + 1 >= queue.length ? 'Finish →' : 'Next problem →'}</button>
        {last && !last.error && <span style={{ fontSize: '0.86rem', fontWeight: 700, color: last.pass ? 'var(--green-text)' : 'var(--red-text)' }}>{last.pass ? '✓ passes' : '✗ not right yet'}</span>}
        {last && last.error && <span style={{ fontSize: '0.84rem', color: 'var(--red-text)' }}>raised an error</span>}
      </div>
      <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>No reveal in a mock — submit as many times as you like, then move on. Misses come back later.</div>
    </div>
  );
}

function Header({ onExit, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <button onClick={onExit} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.5rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }} aria-label="Back to PyLab">
        <Icon name="arrow-left" size={16} color="var(--text-muted)" />
      </button>
      <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>{title}</h1>
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div style={{ flex: '1 1 120px', padding: '0.7rem 0.85rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: tone === 'good' ? 'var(--green-text)' : 'var(--text)' }}>{value}</div>
    </div>
  );
}

function pill(active) {
  return { padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid ' + (active ? 'var(--accent)' : 'var(--border)'), background: active ? 'var(--accent-bg)' : 'var(--surface)', color: active ? 'var(--accent)' : 'var(--text)', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 600 };
}

export default MockLoop;
