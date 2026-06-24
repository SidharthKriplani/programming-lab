// PyLabBrowser — the PyLab room: one filterable bank for pandas/numpy AND Python, built to
// the SQL-Lab bar (PYLAB-BUILD-SPEC). Browse (filter by topic/difficulty/search) -> solve
// (prompt + beforeWriting + editor + Submit graded via runPyLab) -> Reveal (solution +
// debrief) -> JudgmentLayer. Named export (App lazy-imports it).
import { useState, useEffect, useMemo } from 'react';
import { pyLabProblems, PYLAB_TOPICS, PYLAB_TOPIC_ORDER } from '../data/pyLabProblems.js';
import { pyLabFixtures } from '../data/pyLabFixtures.js';
import { companyFor } from '../data/pyLabCompanies.js';
import { pyLabSchemas } from '../data/pyLabSchemas.js';
import { pyLabPlanned } from '../data/pyLabPlanned.js';
import { PyLabSchema } from '../components/shared/PyLabSchema.jsx';
import { PythonCell } from '../components/ide/PythonCell.jsx';
import { JudgmentLayer } from '../components/shared/JudgmentLayer.jsx';
import { ScaleRace } from '../components/shared/ScaleRace.jsx';
import { AmbiguityDrill } from '../components/shared/AmbiguityDrill.jsx';
import { RefactorChallenge } from '../components/shared/RefactorChallenge.jsx';
import { FollowUpChain } from '../components/shared/FollowUpChain.jsx';
import { pyLabFormats } from '../data/pyLabFormats.js';
import { pyLabFollowups } from '../data/pyLabFollowups.js';
import { ForwardPointerCard } from '../components/shared/ForwardPointerCard.jsx';
import { Icon } from '../components/shared/Icon.jsx';
import { loadPython, loadPackages, runPyLab } from '../components/ide/pyodideRuntime.js';
import { getProgress, markSeen, markSolved } from '../utils/problemProgress.js';
import { dueIds, reviewSR } from '../utils/pyLabSR.js';
import { ROLES, ROLE_ORDER, LEVELS, LEVEL_ORDER, levelOf, matchesRoleLevel } from '../data/pyLabMeta.js';
import { PyLabReadiness } from '../components/shared/PyLabReadiness.jsx';
import { MockLoop } from '../components/shared/MockLoop.jsx';
import { PyTutorial } from './PyTutorial.jsx';
import { pyTutMeta } from '../data/pyTutorial.js';

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
  const fmt = pyLabFormats[problem.id] || {};
  const schema = pyLabSchemas[problem.id];
  const completions = useMemo(() => {
    if (!schema) return [];
    const list = []; const seen = new Set();
    (schema.inputs || []).forEach(inp => {
      if (!seen.has(inp.name)) { seen.add(inp.name); list.push({ label: inp.name, type: 'variable', detail: inp.kind }); }
      (inp.cols || []).forEach(c => {
        const k = 'c:' + c.name;
        if (!seen.has(k)) { seen.add(k); list.push({ label: c.name, type: 'property', detail: 'column' }); list.push({ label: "'" + c.name + "'", type: 'property', detail: 'column' }); }
      });
    });
    return list;
  }, [problem.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (res.pass) { markSolved(KEY, problem.id); reviewSR(problem.id, true); onSolved && onSolved(problem.id); }
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
            <Chip label={LEVELS[levelOf(problem)].label} color="var(--text-muted)" />
            <Chip label={(problem.estimatedMin || 5) + ' min'} color="var(--text-muted)" />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{problem.title}</h1>
        </div>
      </div>

      <div className="pylab-solve-grid">
        {/* LEFT — problem + schema */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.96rem', lineHeight: 1.6 }}>{problem.prompt}</p>
          {problem.beforeWriting && (
            <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--text)' }}>Before you write: </strong>{problem.beforeWriting}
            </div>
          )}
          {fmt.ambiguity && <AmbiguityDrill ambiguity={fmt.ambiguity} />}
          {schema ? <PyLabSchema schema={schema} /> : (fx && (
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>input · {fx.preview}</div>
          ))}
        </div>

        {/* RIGHT — editor + submit + result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <PythonCell initialCode={problem.starterCode} label={problem.signature || 'solution.py'} glassBox onCodeChange={setCode} height={editorH} completions={completions} onSubmit={submit} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button onClick={submit} disabled={submitting} className="pal-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              <Icon name="check" size={14} color="currentColor" /> {submitting ? (progress || 'Checking…') : 'Submit'}
            </button>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>⌘/Ctrl+Enter to submit · ▶ Run for a scratch look</span>
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
        </div>
      </div>

      {!revealed && (
        <button onClick={() => { setRevealed(true); markSolved(KEY, problem.id); if (result && !result.pass) reviewSR(problem.id, false); }} className="pal-btn-primary" style={{ alignSelf: 'flex-start' }}>Reveal solution</button>
      )}

      {revealed && (
        <div className="pal-reveal-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', borderTop: '1px solid var(--border)', paddingTop: '1.1rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Model solution</div>
          <pre style={{ margin: 0, padding: '0.7rem 0.85rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{problem.solution}</pre>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.9rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{problem.debrief}</div>
          <JudgmentLayer problem={problem} />
          <ScaleRace problem={problem} />
          {fmt.refactor && <RefactorChallenge problem={problem} refactor={fmt.refactor} />}
          {pyLabFollowups[problem.id] && <FollowUpChain followups={pyLabFollowups[problem.id]} />}
          <ForwardPointerCard onNext={onBack} onNavigate={onBack} />
        </div>
      )}
    </div>
  );
}

// ── Browse ──────────────────────────────────────────────────────────────────
// a one-line gist of a problem, derived from its prompt's first sentence
function oneLine(p) {
  const s = (p.prompt || '').replace(/\s+/g, ' ').trim();
  const dot = s.indexOf('. ');
  const first = (dot > 24 && dot < 130) ? s.slice(0, dot + 1) : s;
  return first.length > 130 ? first.slice(0, 128).trim() + '…' : first;
}

export function PyLabBrowser({ onExitRoom }) {
  const [activeId, setActiveId] = useState(null);
  const [role, setRole] = useState('all');
  const [level, setLevel] = useState('all');
  const [topic, setTopic] = useState('all');
  const [q, setQ] = useState('');
  const [reviewMode, setReviewMode] = useState(false);
  const [mock, setMock] = useState(false);
  const [tutorial, setTutorial] = useState(false);
  const progress = getProgress(KEY);
  const total = pyLabProblems.length;
  const solvedCount = Object.keys(progress.solved || {}).length;

  if (mock) return <MockLoop onExit={() => setMock(false)} />;
  if (tutorial) return <PyTutorial onExit={() => setTutorial(false)} />;

  if (activeId) {
    const problem = pyLabProblems.find(p => p.id === activeId);
    return <PyLabRunner problem={problem} onBack={() => setActiveId(null)} />;
  }

  const due = dueIds();
  const dueSet = new Set(due);
  const topics = PYLAB_TOPIC_ORDER.filter(t => pyLabProblems.some(p => p.topic === t));
  const shown = reviewMode
    ? pyLabProblems.filter(p => dueSet.has(p.id))
    : pyLabProblems.filter(p =>
        matchesRoleLevel(p, role, level) &&
        (topic === 'all' || p.topic === topic) &&
        (q === '' || (p.title + ' ' + p.prompt).toLowerCase().includes(q.toLowerCase()))
      );
  const plannedShown = reviewMode ? [] : pyLabPlanned.filter(s =>
    (topic === 'all' || s.topic === topic) &&
    (level === 'all' || s.level === level) &&
    (q === '' || (s.title + ' ' + (s.seed || '')).toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="pal-page-enter">
      {onExitRoom && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: '0.7rem' }}>
          <button onClick={onExitRoom} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.6rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.84rem' }}>
            <Icon name="arrow-left" size={15} color="var(--text-muted)" /> Back
          </button>
          <Icon name="layers" size={18} color="var(--accent)" />
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)' }}>PyLab</span>
          <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{solvedCount}<span style={{ color: 'var(--text-muted)' }}> / {total} solved</span></span>
          <button onClick={() => setMock(true)} className="pal-btn-primary" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', padding: '0.4rem 0.8rem' }}>
            <Icon name="clock" size={14} color="currentColor" /> Mock interview
          </button>
        </div>
      )}
      <div style={{ marginBottom: '1rem' }}>
        {!onExitRoom && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <Icon name="layers" size={18} color="var(--accent)" />
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>PyLab</h1>
            <button onClick={() => setMock(true)} className="pal-btn-primary" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', padding: '0.4rem 0.8rem' }}>
              <Icon name="clock" size={14} color="currentColor" /> Mock interview
            </button>
          </div>
        )}
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '64ch' }}>
          pandas, numpy and Python — the difference between code that runs and code that&apos;s right. Predict, submit, then read which approaches are equivalent, which one is a trap that runs and lies, and when to reach for each.
        </p>
      </div>

      {!reviewMode && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', padding: '0.85rem 1.1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-border)', background: 'var(--accent-bg)' }}>
          <Icon name="book-open" size={20} color="var(--accent)" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)' }}>New to Python or pandas? Start from zero.</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {pyTutMeta.totalLessons} short lessons that build up to a passing solve() — one idea at a time. Skip ahead anytime.
            </div>
          </div>
          <button onClick={() => setTutorial(true)} className="pal-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem', padding: '0.45rem 0.9rem', flexShrink: 0 }}>
            Start tutorial →
          </button>
        </div>
      )}

      <PyLabReadiness role={role} problems={pyLabProblems} solved={progress.solved} onPickLevel={setLevel} />

      {(due.length > 0 || reviewMode) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.9rem', padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-border)', background: 'var(--accent-bg)' }}>
          <Icon name="clipboard-check" size={15} color="var(--accent)" />
          <span style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 700 }}>
            {reviewMode ? 'Reviewing ' + shown.length + ' due' : due.length + ' due for review'}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>spaced repetition — solve it again to push it further out</span>
          <button onClick={() => setReviewMode(m => !m)} style={{ marginLeft: 'auto', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-border)', background: 'var(--surface)', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
            {reviewMode ? 'Show all' : 'Review now'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem', opacity: reviewMode ? 0.45 : 1, pointerEvents: reviewMode ? 'none' : 'auto' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(290px, 100%), 1fr))', gap: '0.7rem' }}>
        {shown.map(p => {
          const solved = !!progress.solved[p.id];
          const co = companyFor(p);
          const isTrap = (p.methods || []).some(m => m.isTrap);
          return (
            <button key={p.id} onClick={() => { setActiveId(p.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="pal-card-hover" style={{ textAlign: 'left', cursor: 'pointer', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: 152 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ width: 18, height: 18, borderRadius: 4, background: co.hue, color: '#fff', fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{co.initial}</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>{co.name}</span>
                {solved && <span style={{ marginLeft: 'auto', display: 'inline-flex' }}><Icon name="clipboard-check" size={13} color="var(--green-text)" /></span>}
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.25 }}>{p.title}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{oneLine(p)}</span>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                <Chip label={PYLAB_TOPICS[p.topic] || p.topic} color="var(--accent)" />
                <Chip label={LEVELS[levelOf(p)].label} color="var(--text-muted)" />
                {isTrap && <Chip label="trap" color="var(--red-text)" />}
              </div>
            </button>
          );
        })}
        {shown.length === 0 && <div style={{ gridColumn: '1 / -1', color: 'var(--text-muted)', fontSize: '0.88rem', padding: '1rem' }}>{reviewMode ? 'Nothing due for review right now.' : 'No problems match.'}</div>}
      </div>

      {plannedShown.length > 0 && (
        <div style={{ marginTop: '1.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Planned · coming soon</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{plannedShown.length}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(290px, 100%), 1fr))', gap: '0.7rem' }}>
            {plannedShown.map(s => (
              <div key={s.id} style={{ background: 'var(--surface-2)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: 130, opacity: 0.78, cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--yellow-text)', border: '1px solid var(--yellow-border)', background: 'var(--yellow-bg)', borderRadius: 999, padding: '1px 7px', fontFamily: 'var(--font-mono)' }}>PLANNED</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{s.curriculum}</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.25 }}>{s.title}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.seed}</span>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                  <Chip label={PYLAB_TOPICS[s.topic] || s.topic} color="var(--text-muted)" />
                  <Chip label={LEVELS[s.level] ? LEVELS[s.level].label : s.level} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PyLabBrowser;
