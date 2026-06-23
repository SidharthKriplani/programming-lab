// PyLabBrowser — the PyLab room: one filterable bank for pandas/numpy AND Python, built to
// the SQL-Lab bar (PYLAB-BUILD-SPEC). Browse (filter by topic/difficulty/search) -> solve
// (prompt + beforeWriting + editor + Submit graded via runPyLab) -> Reveal (solution +
// debrief) -> JudgmentLayer. Named export (App lazy-imports it).
import { useState, useEffect } from 'react';
import { pyLabProblems, PYLAB_TOPICS, PYLAB_TOPIC_ORDER } from '../data/pyLabProblems.js';
import { pyLabFixtures } from '../data/pyLabFixtures.js';
import { PythonCell } from '../components/ide/PythonCell.jsx';
import { JudgmentLayer } from '../components/shared/JudgmentLayer.jsx';
import { ForwardPointerCard } from '../components/shared/ForwardPointerCard.jsx';
import { Icon } from '../components/shared/Icon.jsx';
import { loadPython, loadPackages, runPyLab } from '../components/ide/pyodideRuntime.js';
import { getProgress, markSeen, markSolved } from '../utils/problemProgress.js';
import { ROLES, ROLE_ORDER, LEVELS, LEVEL_ORDER, levelOf, matchesRoleLevel } from '../data/pyLabMeta.js';
import { PyLabReadiness } from '../components/shared/PyLabReadiness.jsx';

const KEY = 'pl-pylab-progress-v1';
const DIFFS = ['all', 'warmup', 'core', 'stretch'];
const DIFF_LABEL = { warmup: 'Warmup', core: 'Core', stretch: 'Stretch' };
const chipStyle = (active) => ({ padding: '0.3rem 0.7rem', borderRadius: 999, border: '1px solid ' + (active ? 'var(--accent)' : 'var(--border)'), background: active ? 'var(--accent-bg)' : 'var(--surface)', color: active ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 });

function Chip({ label, color }) {
  return <span className="pl-chip" style={{ color, borderColor: color, background: 'transparent' }}>{label}</span>;
}

// ── Solve view ──────────────────────────────────────────────────────────────
function PyLabRunner({ problem, onBack, onSolved }) {
  const [code, setCode] = useState(problem.starterCode);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const fx = pyLabFixtures[problem.fixtureId];

  useEffect(() => {
    markSeen(KEY, problem.id);
    setCode(problem.starterCode); setResult(null); setRevealed(false);
  }, [problem.id]);

  async function submit() {
    setSubmitting(true); setResult(null);
    try {
      await loadPython(m => setProgress(m));
      await loadPackages(['pandas', 'numpy'], m => setProgress(m));
    } catch (e) {
      setSubmitting(false);
      setResult({ pass: false, error: 'Failed to load runtime: ' + e.message }); return;
    }
    setProgress('');
    const res = await runPyLab(code, problem.solution, fx.setup, fx.args, problem.compare);
    setResult(res); setSubmitting(false);
    if (res.pass) { markSolved(KEY, problem.id); onSolved && onSolved(problem.id); }
  }

  const editorH = Math.min(360, 120 + problem.starterCode.split('\n').length * 19);

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <button onClick={onBack} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.5rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }} aria-label="Back to PyLab">
          <Icon name="arrow-left" size={16} color="var(--text-muted)" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <Chip label={PYLAB_TOPICS[problem.topic] || problem.topic} color="var(--accent)" />
            <Chip label={DIFF_LABEL[problem.difficulty] || problem.difficulty} color="var(--text-muted)" />
            <Chip label={(problem.estimatedMin || 5) + ' min'} color="var(--text-muted)" />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{problem.title}</h1>
        </div>
      </div>

      <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.96rem', lineHeight: 1.6 }}>{problem.prompt}</p>
      {problem.beforeWriting && (
        <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          <strong style={{ color: 'var(--text)' }}>Before you write: </strong>{problem.beforeWriting}
        </div>
      )}
      {fx && (
        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          input · {fx.preview}
        </div>
      )}

      <PythonCell initialCode={problem.starterCode} label={problem.signature || 'solution.py'} glassBox onCodeChange={setCode} height={editorH} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
        <button onClick={submit} disabled={submitting} className="pal-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
          <Icon name="check" size={14} color="currentColor" /> {submitting ? (progress || 'Checking…') : 'Submit'}
        </button>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>the editor's ▶ Run executes your code for a scratch look</span>
      </div>

      {result && (
        <div className={`pal-reveal-in ${result.pass ? 'pal-success-ring' : ''}`} style={{ border: '1px solid ' + (result.pass ? 'var(--green-border)' : 'var(--red-border)'), background: result.pass ? 'var(--green-bg)' : 'var(--red-bg)', borderRadius: 'var(--radius)', padding: '0.7rem 0.9rem' }}>
          {result.error ? (
            <>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--red-text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Your code raised</div>
              <pre className="py-output py-error" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result.error}</pre>
            </>
          ) : (
            <div style={{ fontSize: '0.9rem', color: result.pass ? 'var(--green-text)' : 'var(--red-text)', fontWeight: 600 }}>
              {result.pass ? 'Correct — output matches.' : 'Runs, but the output is not right: ' + result.message}
            </div>
          )}
        </div>
      )}

      {!revealed && (
        <button onClick={() => { setRevealed(true); markSolved(KEY, problem.id); }} className="pal-btn-primary" style={{ alignSelf: 'flex-start' }}>Reveal solution</button>
      )}

      {revealed && (
        <div className="pal-reveal-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', borderTop: '1px solid var(--border)', paddingTop: '1.1rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Model solution</div>
          <pre style={{ margin: 0, padding: '0.7rem 0.85rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{problem.solution}</pre>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.9rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{problem.debrief}</div>
          <JudgmentLayer problem={problem} />
          <ForwardPointerCard onNext={onBack} onNavigate={onBack} />
        </div>
      )}
    </div>
  );
}

// ── Browse ──────────────────────────────────────────────────────────────────
export function PyLabBrowser() {
  const [activeId, setActiveId] = useState(null);
  const [role, setRole] = useState('all');
  const [level, setLevel] = useState('all');
  const [topic, setTopic] = useState('all');
  const [q, setQ] = useState('');
  const progress = getProgress(KEY);

  if (activeId) {
    const problem = pyLabProblems.find(p => p.id === activeId);
    return <PyLabRunner problem={problem} onBack={() => setActiveId(null)} />;
  }

  const topics = PYLAB_TOPIC_ORDER.filter(t => pyLabProblems.some(p => p.topic === t));
  const shown = pyLabProblems.filter(p =>
    matchesRoleLevel(p, role, level) &&
    (topic === 'all' || p.topic === topic) &&
    (q === '' || (p.title + ' ' + p.prompt).toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="pal-page-enter">
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <Icon name="layers" size={18} color="var(--accent)" />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>PyLab</h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '64ch' }}>
          pandas, numpy and Python — the difference between code that runs and code that&apos;s right. Predict, submit, then read which approaches are equivalent, which one is a trap that runs and lies, and when to reach for each.
        </p>
      </div>

      <PyLabReadiness role={role} problems={pyLabProblems} solved={progress.solved} onPickLevel={setLevel} />

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
        <select value={role} onChange={e => setRole(e.target.value)} style={{ padding: '0.35rem 0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '0.82rem' }}>
          <option value="all">All roles</option>
          {ROLE_ORDER.map(r => <option key={r} value={r}>{ROLES[r]}</option>)}
        </select>
        <select value={topic} onChange={e => setTopic(e.target.value)} style={{ padding: '0.35rem 0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '0.82rem' }}>
          <option value="all">All topics</option>
          {topics.map(t => <option key={t} value={t}>{PYLAB_TOPICS[t]}</option>)}
        </select>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          <button onClick={() => setLevel('all')} style={chipStyle(level === 'all')}>All levels</button>
          {LEVEL_ORDER.map(lv => (
            <button key={lv} onClick={() => setLevel(lv)} style={chipStyle(level === lv)}>{LEVELS[lv].label}</button>
          ))}
        </div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" style={{ flex: 1, minWidth: 140, padding: '0.35rem 0.6rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '0.82rem' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {shown.map(p => {
          const solved = !!progress.solved[p.id];
          return (
            <button key={p.id} onClick={() => { setActiveId(p.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="pal-card-hover" style={{ textAlign: 'left', cursor: 'pointer', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              {solved ? <Icon name="clipboard-check" size={15} color="var(--green-text)" /> : <span style={{ width: 15, display: 'inline-block' }} />}
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)' }}>{p.title}</span>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{PYLAB_TOPICS[p.topic]} · {LEVELS[levelOf(p)].label}{(p.methods || []).some(m => m.isTrap) ? ' · trap' : ''}</span>
              </span>
              <Chip label={DIFF_LABEL[p.difficulty] || p.difficulty} color="var(--text-muted)" />
            </button>
          );
        })}
        {shown.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '1rem' }}>No problems match.</div>}
      </div>
    </div>
  );
}

export default PyLabBrowser;
