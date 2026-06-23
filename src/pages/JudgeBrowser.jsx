// JudgeBrowser — the JUDGE frame: forensic "Spot the Flaw" room.
// Browse pandas snippets that RUN and lie; open one, run it, spot the bug,
// then reveal the fix. Named export (App lazy-imports it with the named-export
// pattern). Opens an inline JudgeRunner keyed by problem id.
import { useState, useEffect } from 'react';
import { judgeProblems, JUDGE_CLUSTERS, JUDGE_CLUSTER_ORDER } from '../data/judgeProblems.js';
import { PythonCell } from '../components/ide/PythonCell.jsx';
import { DebriefBlocks } from '../components/shared/DebriefBlocks.jsx';
import { GateOverlay } from '../components/shared/GateOverlay.jsx';
import { ForwardPointerCard } from '../components/shared/ForwardPointerCard.jsx';
import { Icon } from '../components/shared/Icon.jsx';
import { getProgress, markSeen, markSolved } from '../utils/problemProgress.js';
import { isUnlocked } from '../utils/unlock.js';

const JUDGE_KEY = 'pl-judge-progress-v1';
const GRID_COLS = 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))';

const DIFF_LABEL = { warmup: 'Warmup', core: 'Core', stretch: 'Stretch' };

function Chip({ label, color }) {
  return (
    <span className="pl-chip" style={{ color, borderColor: color, background: 'transparent' }}>{label}</span>
  );
}

function cellHeight(code) {
  return Math.min(320, 70 + code.split('\n').length * 19);
}

// ─────────────────────────── JudgeRunner (inline) ───────────────────────────
function JudgeRunner({ problem, onBack, onNext, unlocked }) {
  const [revealed, setRevealed] = useState(false);

  const cluster = JUDGE_CLUSTERS[problem.cluster] || { label: problem.cluster, accent: 'var(--accent)' };

  useEffect(() => {
    markSeen(JUDGE_KEY, problem.id);
    setRevealed(false);
  }, [problem.id]);

  function reveal() {
    setRevealed(true);
    markSolved(JUDGE_KEY, problem.id);
  }

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <button
          onClick={onBack}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.5rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          aria-label="Back to all forensic cases"
        >
          <Icon name="arrow-left" size={16} color="var(--text-muted)" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <Chip label={cluster.label} color={cluster.accent} />
            <Chip label={DIFF_LABEL[problem.difficulty] || problem.difficulty} color="var(--text-muted)" />
            {problem.company && <Chip label={problem.company} color="var(--text-dim)" />}
          </div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{problem.title}</h1>
        </div>
      </div>

      {/* Setup */}
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.55 }}>{problem.setup}</p>

      {/* The broken code — runnable; user watches it lie */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Run it — watch what it returns</div>
        <PythonCell initialCode={problem.brokenCode} label="suspect.py" height={cellHeight(problem.brokenCode)} />
      </div>

      {/* Wrong output + symptom panel */}
      <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderLeft: '3px solid var(--red)', borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--red-text)' }}>What it returned</div>
        <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{problem.brokenOutput}</pre>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginTop: '0.1rem' }}>
          <Icon name="alert-triangle" size={14} color="var(--red-text)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{problem.symptom}</span>
        </div>
      </div>

      {/* The forensic question */}
      <div style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 600, lineHeight: 1.5 }}>{problem.question}</div>

      {/* Reveal control */}
      {!revealed && (
        <button
          onClick={reveal}
          className="pal-btn-primary"
          style={{ alignSelf: 'flex-start' }}
        >
          Reveal the bug
        </button>
      )}

      {/* Reveal panel (gated when Stripe is live; passthrough in beta) */}
      {revealed && (
        <GateOverlay unlocked={unlocked} context="full-bank">
          <div className="pal-reveal-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.1rem' }}>
            {/* The flaw (red) */}
            <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderLeft: '3px solid var(--red)', borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.3rem' }}>
                <Icon name="alert-triangle" size={15} color="var(--red-text)" />
                <span style={{ fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--red-text)' }}>The flaw</span>
              </div>
              <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.6 }}>{problem.flaw}</p>
            </div>

            {/* Impact (yellow) */}
            <div style={{ background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderLeft: '3px solid var(--yellow)', borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.9rem' }}>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--yellow-text)', marginBottom: '0.25rem' }}>If you ship it</div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55 }}>{problem.impact}</p>
            </div>

            {/* The fix — runnable, read-only */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--green-text)' }}>The fix</div>
              <PythonCell initialCode={problem.fixedCode} label="fixed.py" readOnly height={cellHeight(problem.fixedCode)} />
            </div>

            {/* Correct output */}
            <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderLeft: '3px solid var(--green)', borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.9rem' }}>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--green-text)', marginBottom: '0.25rem' }}>What it should return</div>
              <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{problem.fixedOutput}</pre>
            </div>

            {/* Debrief (collapsible marker blocks) */}
            <DebriefBlocks text={problem.debrief} />

            {/* Key takeaways */}
            {problem.keyTakeaways?.length > 0 && (
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.9rem' }}>
                <div style={{ fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '0.45rem' }}>Keep the reflex</div>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {problem.keyTakeaways.map((t, i) => (
                    <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>{t}</li>
                  ))}
                </ul>
              </div>
            )}

            <ForwardPointerCard room="judge" onNext={onNext} onNavigate={onBack} />
          </div>
        </GateOverlay>
      )}
    </div>
  );
}

// ─────────────────────────── JudgeBrowser (export) ──────────────────────────
export function JudgeBrowser() {
  const [activeId, setActiveId] = useState(null);
  const progress = getProgress(JUDGE_KEY);

  const ordered = judgeProblems
    .slice()
    .sort((a, b) => JUDGE_CLUSTER_ORDER.indexOf(a.cluster) - JUDGE_CLUSTER_ORDER.indexOf(b.cluster));

  if (activeId) {
    const idx = ordered.findIndex(p => p.id === activeId);
    const problem = ordered[idx];
    const next = ordered[(idx + 1) % ordered.length];
    return (
      <JudgeRunner
        key={problem.id}
        problem={problem}
        unlocked={isUnlocked()}
        onBack={() => setActiveId(null)}
        onNext={() => { setActiveId(next.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />
    );
  }

  const groups = JUDGE_CLUSTER_ORDER
    .map(key => ({ key, meta: JUDGE_CLUSTERS[key], items: ordered.filter(p => p.cluster === key) }))
    .filter(g => g.items.length > 0);

  let cardIndex = 0;

  return (
    <div className="pal-page-enter">
      {/* Title */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <Icon name="search" size={18} color="var(--red)" />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>Spot the Flaw</h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '56ch' }}>
          Each snippet runs clean and returns a plausibly-wrong answer - no error, no crash. Run it, read the symptom, find the bug, then reveal the fix. This is code review under interview pressure.
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
              return (
                <button
                  key={p.id}
                  onClick={() => { setActiveId(p.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="pal-card-enter pal-card-hover"
                  style={{
                    animationDelay: delay,
                    textAlign: 'left', cursor: 'pointer',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '0.9rem 1rem',
                    display: 'flex', flexDirection: 'column', gap: '0.4rem',
                    borderTop: `2px solid ${group.meta.accent}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.25 }}>{p.title}</span>
                    {solved
                      ? <Icon name="clipboard-check" size={15} color="var(--green-text)" />
                      : seen ? <Icon name="clock" size={14} color="var(--text-dim)" /> : null}
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{p.symptom}</span>
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.1rem' }}>
                    <Chip label={DIFF_LABEL[p.difficulty] || p.difficulty} color="var(--text-dim)" />
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

export default JudgeBrowser;
