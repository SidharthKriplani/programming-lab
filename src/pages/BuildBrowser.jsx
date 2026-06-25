// BuildBrowser — the BUILD frame: scaffolded mini-projects. Browse a card grid of
// projects; open one into an inline BuildRunner stepper. Each project is a goal plus
// ordered steps, each step a small runnable function checked by hidden tests; steps
// unlock sequentially, and a later step can call functions defined by earlier steps.
//
// Named export (App lazy-imports it with the named-export pattern). packages=['pandas'].
import { useState, useEffect, useRef } from 'react';
import { buildProjects, BUILD_CLUSTERS, BUILD_CLUSTER_ORDER } from '../data/buildProjects.js';
import { PythonCell } from '../components/ide/PythonCell.jsx';
import { loadPython, loadPackages, runProblem } from '../components/ide/pyodideRuntime.js';
import { formatGlassBox } from '../components/ide/glassbox.js';
import { DebriefBlocks } from '../components/shared/DebriefBlocks.jsx';
import { ForwardPointerCard } from '../components/shared/ForwardPointerCard.jsx';
import { Icon } from '../components/shared/Icon.jsx';
import { markSeen, markSolved, getProgress, BUILD_KEY } from '../utils/problemProgress.js';
import { isUnlocked } from '../utils/unlock.js';

const GRID_COLS = 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))';
const PACKAGES = ['pandas'];

const DIFF_META = {
  core: { label: 'Core', color: 'var(--accent)' },
  stretch: { label: 'Stretch', color: 'var(--yellow-text)' },
};

// ── Stepper runner ────────────────────────────────────────────────────────────
// One step's view: instruction + hint + editor + Submit + per-check results.
// On submit it assembles dataSetup + prior step solutions + the user's code, then
// runs runProblem(assembled, step.testSource) so fixtures AND prior-step functions
// are in scope for this step's tests.
function StepCard({ project, step, index, status, locked, solved, onSolved }) {
  const [code, setCode] = useState(step.starterCode);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const allPass = result && result.total > 0 && result.passed === result.total && !result.error;
  const editorH = Math.min(340, 110 + step.starterCode.split('\n').length * 19);

  async function submit() {
    setSubmitting(true); setResult(null);
    try {
      await loadPython(m => setProgress(m));
      await loadPackages(PACKAGES, m => setProgress(m));
    } catch (e) {
      setSubmitting(false);
      setResult({ results: [], passed: 0, total: 0, error: 'Failed to load runtime: ' + e.message, stdout: '', timeMs: 0, peakKb: 0 });
      return;
    }
    setProgress('');
    // Assemble: fixtures + every prior step's canonical solution + this step's user code.
    const priorSolutions = project.steps.slice(0, index).map(s => s.solution).join('\n');
    const assembled = project.dataSetup + '\n' + priorSolutions + '\n' + code;
    const res = await runProblem(assembled, step.testSource);
    setResult(res); setSubmitting(false);
    if (res.total > 0 && res.passed === res.total && !res.error) onSolved(index);
  }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '0.95rem 1.05rem', opacity: locked ? 0.55 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.4rem' }}>
        <span style={{
          width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.72rem', fontWeight: 800, fontFamily: 'var(--font-mono)',
          background: solved ? 'var(--green-bg, var(--surface-2))' : 'var(--surface-2)',
          color: solved ? 'var(--green-text)' : 'var(--text-muted)', border: '1px solid var(--border)',
        }}>{solved ? <Icon name="check" size={12} color="var(--green-text)" /> : index + 1}</span>
        <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: 'var(--text)' }}>{step.title}</h3>
        {locked && <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>locked</span>}
      </div>

      {locked ? (
        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.85rem' }}>Pass the previous step to unlock this one.</p>
      ) : (
        <>
          <p style={{ margin: '0 0 0.6rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55 }}>{step.instruction}</p>

          {step.hint && (
            <div style={{ marginBottom: '0.6rem' }}>
              <button onClick={() => setShowHint(h => !h)} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'var(--surface-2)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.6rem',
                cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 600,
              }}>
                <Icon name="zap" size={12} color="var(--yellow)" /> {showHint ? 'Hide hint' : 'Hint'}
              </button>
              {showHint && (
                <p className="pal-reveal-in" style={{ margin: '0.4rem 0 0', padding: '0.5rem 0.7rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.5 }}>{step.hint}</p>
              )}
            </div>
          )}

          <PythonCell initialCode={step.starterCode} label={`step_${index + 1}.py`} glassBox onCodeChange={setCode} height={editorH} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
            <button onClick={submit} disabled={submitting} className="pal-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              <Icon name="check" size={14} color="currentColor" /> {submitting ? (progress || 'Submitting…') : 'Submit step'}
            </button>
            {result && !result.error && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: allPass ? 'var(--green-text)' : 'var(--red-text)' }}>{result.passed}/{result.total} checks pass</span>
            )}
          </div>

          {result && (
            <div className={`pal-reveal-in ${allPass ? 'pal-success-ring' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem 0.9rem', background: 'var(--surface)', marginTop: '0.6rem' }}>
              {result.error ? (
                <>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--red-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your code raised</div>
                  <pre className="py-output py-error" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result.error}</pre>
                </>
              ) : (
                <>
                  {result.results.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: r.ok ? 'var(--green-text)' : 'var(--red-text)', fontFamily: 'var(--font-mono)' }}>
                      <Icon name={r.ok ? 'check' : 'x'} size={13} color={r.ok ? 'var(--green-text)' : 'var(--red-text)'} />
                      <span>{r.name}</span>
                    </div>
                  ))}
                  {!allPass && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{result.passed} of {result.total} pass. Fix the failing check and submit again.</div>
                  )}
                  {result.stdout && <pre className="py-output" style={{ margin: '0.2rem 0 0', whiteSpace: 'pre-wrap' }}>{result.stdout}</pre>}
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '5px', marginTop: '2px' }}>{formatGlassBox({ timeMs: result.timeMs, peakKb: result.peakKb })}</div>
                  {allPass && <div style={{ fontSize: '0.85rem', color: 'var(--green-text)', fontWeight: 600 }}>Step complete — next step unlocked.</div>}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BuildRunner({ project, unlocked, onBack, onNext }) {
  // doneCount = number of LEADING steps passed (gates the next step).
  const [doneCount, setDoneCount] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [bootMsg, setBootMsg] = useState('');
  const bootedRef = useRef(false);

  const allDone = doneCount >= project.steps.length;

  useEffect(() => {
    markSeen(BUILD_KEY, project.id);
  }, [project.id]);

  // Warm the runtime + pandas as soon as a project opens so first Submit is fast.
  useEffect(() => {
    let cancelled = false;
    if (bootedRef.current) return;
    bootedRef.current = true;
    (async () => {
      try {
        await loadPython(m => { if (!cancelled) setBootMsg(m); });
        await loadPackages(PACKAGES, m => { if (!cancelled) setBootMsg(m); });
        if (!cancelled) setBootMsg('');
      } catch { if (!cancelled) setBootMsg(''); }
    })();
    return () => { cancelled = true; };
  }, []);

  function handleSolved(stepIndex) {
    // Only advance the gate when the CURRENT frontier step is the one solved.
    setDoneCount(prev => {
      const next = stepIndex === prev ? prev + 1 : prev;
      if (next >= project.steps.length) markSolved(BUILD_KEY, project.id);
      return next;
    });
  }

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.7rem', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          <Icon name="arrow-left" size={15} color="var(--text-muted)" /> Browse
        </button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>{Math.min(doneCount, project.steps.length)}/{project.steps.length} steps · ~{project.estimatedMin} min</span>
      </div>

      {/* brief */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <span className="pl-chip" style={{ color: 'var(--accent)', borderColor: 'var(--accent)', background: 'transparent' }}>{(BUILD_CLUSTERS[project.cluster] || {}).label || project.cluster}</span>
          <span className="pl-chip" style={{ color: (DIFF_META[project.difficulty] || DIFF_META.core).color, borderColor: 'var(--border)', background: 'transparent' }}>{(DIFF_META[project.difficulty] || DIFF_META.core).label}</span>
        </div>
        <h1 style={{ margin: '0 0 0.3rem', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{project.title}</h1>
        {project.brief.split('\n\n').map((para, i) => (
          <p key={i} style={{ margin: i === 0 ? '0.5rem 0 0' : '0.6rem 0 0', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>{para}</p>
        ))}
      </div>

      {/* given data */}
      <div>
        <div style={{ fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: '0.4rem' }}>The data you start with</div>
        <PythonCell initialCode={project.dataSetup} label="data_setup.py" readOnly glassBox={false} height={Math.min(280, 80 + project.dataSetup.split('\n').length * 19)} />
        {bootMsg && <div style={{ marginTop: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}><span className="animate-spin" style={{ display: 'inline-block' }}>⟳</span> {bootMsg}</div>}
      </div>

      {/* steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {project.steps.map((step, i) => (
          <StepCard
            key={step.id}
            project={project}
            step={step}
            index={i}
            status={i < doneCount ? 'done' : i === doneCount ? 'active' : 'locked'}
            locked={i > doneCount}
            solved={i < doneCount}
            onSolved={handleSolved}
          />
        ))}
      </div>

      {/* debrief — after all steps pass, or via Reveal */}
      {(allDone || revealed) ? (
        <div className="pal-reveal-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.3rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--green-text)' }}>
            {allDone ? 'Project complete — debrief' : 'Debrief (revealed early)'}
          </div>
          <DebriefBlocks text={project.debrief} />
          {project.keyTakeaways && project.keyTakeaways.length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.8rem 1rem' }}>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: '0.45rem' }}>Key takeaways</div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {project.keyTakeaways.map((t, i) => (
                  <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          <ForwardPointerCard room="build" onNext={onNext} onNavigate={onBack} />
        </div>
      ) : (
        <button onClick={() => setRevealed(true)} className="pal-btn-primary" style={{ alignSelf: 'flex-start', background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
          Reveal debrief without finishing
        </button>
      )}
    </div>
  );
}

// ── Browser (card grid -> inline runner) ──────────────────────────────────────
export function BuildBrowser() {
  const [activeId, setActiveId] = useState(null);
  const progress = getProgress(BUILD_KEY);

  const ordered = buildProjects
    .slice()
    .sort((a, b) => BUILD_CLUSTER_ORDER.indexOf(a.cluster) - BUILD_CLUSTER_ORDER.indexOf(b.cluster));

  if (activeId) {
    const idx = ordered.findIndex(p => p.id === activeId);
    const project = ordered[idx];
    const next = ordered[(idx + 1) % ordered.length];
    return (
      <BuildRunner
        key={project.id}
        project={project}
        unlocked={isUnlocked()}
        onBack={() => setActiveId(null)}
        onNext={() => { setActiveId(next.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />
    );
  }

  const groups = BUILD_CLUSTER_ORDER
    .map(key => ({ key, meta: BUILD_CLUSTERS[key], items: ordered.filter(p => p.cluster === key) }))
    .filter(g => g.items.length > 0);

  let cardIndex = 0;

  return (
    <div className="pal-page-enter">
      {/* Title */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <Icon name="hammer" size={18} color="var(--accent)" />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>Build It</h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '58ch' }}>
          Scaffolded mini-projects. A real goal, broken into ordered steps — each step a small function checked by tests, each one building on the last. Ship the whole pipeline, not a snippet.
        </p>
      </div>

      {/* Cluster groups */}
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
              const dm = DIFF_META[p.difficulty] || DIFF_META.core;
              return (
                <button
                  key={p.id}
                  onClick={() => { setActiveId(p.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="pal-card-enter pal-card-hover"
                  style={{
                    animationDelay: delay,
                    textAlign: 'left', cursor: 'pointer',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '0.95rem 1.05rem',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', lineHeight: 1.25 }}>{p.title}</span>
                    {solved
                      ? <Icon name="clipboard-check" size={15} color="var(--green-text)" />
                      : seen ? <Icon name="clock" size={14} color="var(--text-dim)" /> : null}
                  </div>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{p.subtitle}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: dm.color }}>{dm.label}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>· {p.steps.length} steps · ~{p.estimatedMin} min</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export default BuildBrowser;
