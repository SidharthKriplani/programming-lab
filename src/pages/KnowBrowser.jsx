// KnowBrowser — the KNOW-rung room: short "how it actually works" Python/OOP
// depth explainers, each with a RUNNABLE demo that demonstrates the mechanism.
// Where Gotchas shows a trap + fix, KNOW shows the underlying machine.
//
// Named export (App lazy-imports it with the named-export pattern).
// Card grid grouped by cluster -> inline KnowRunner keyed by id.
// Pyodide packages preloaded: ['pandas'] (matches the lab's other Python rooms).
import { useState, useEffect } from 'react';
import { knowModules, KNOW_CLUSTERS, KNOW_CLUSTER_ORDER } from '../data/knowModules.js';
import { PythonCell } from '../components/ide/PythonCell.jsx';
import { ForwardPointerCard } from '../components/shared/ForwardPointerCard.jsx';
import { HowToStrip } from '../components/shared/HowToStrip.jsx';
import { Icon } from '../components/shared/Icon.jsx';
import { getProgress, markSeen, markSolved } from '../utils/problemProgress.js';

const KNOW_KEY = 'pl-know-progress-v1';
const GRID_COLS = 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))';

const DIFF_LABEL = { warmup: 'Warmup', core: 'Core', stretch: 'Stretch' };

function Chip({ label, color }) {
  return (
    <span className="pl-chip" style={{ color, borderColor: color, background: 'transparent' }}>{label}</span>
  );
}

// ── KnowRunner — single-column explainer flow ──────────────────────────────
// Header (cluster chip + title + subtitle + hook) -> optional predict MCQ ->
// runnable PythonCell(demoCode) -> Reveal -> explain[] collapsibles ->
// mentalModel callout -> ForwardPointerCard. markSeen on open, markSolved on reveal.
function KnowRunner({ module: m, onBack, onNext }) {
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const cluster = KNOW_CLUSTERS[m.cluster] || { label: m.cluster, accent: 'var(--accent)' };
  const hasPredict = !!m.predict;
  const answered = picked !== null;
  const correct = answered && picked === m.predict.answerIndex;

  useEffect(() => {
    markSeen(KNOW_KEY, m.id);
    setPicked(null);
    setRevealed(false);
  }, [m.id]);

  function reveal() {
    setRevealed(true);
    markSolved(KNOW_KEY, m.id);
  }

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <button
          onClick={onBack}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.5rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          aria-label="Back to all explainers"
        >
          <Icon name="arrow-left" size={16} color="var(--text-muted)" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <Chip label={cluster.label} color={cluster.accent} />
            <Chip label={DIFF_LABEL[m.difficulty] || m.difficulty} color="var(--text-muted)" />
            <Chip label={(m.estimatedMin || 4) + ' min'} color="var(--text-muted)" />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{m.title}</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{m.subtitle}</p>
        </div>
      </div>

      {/* Hook */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderLeft: '3px solid ' + cluster.accent, borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.9rem' }}>
        <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.95rem', lineHeight: 1.6 }}>{m.hook}</p>
      </div>

      {/* Predict (optional, predict-before-run gate) */}
      {hasPredict && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Predict first</div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 600 }}>{m.predict.question}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {m.predict.options.map((opt, i) => {
              const isAnswer = i === m.predict.answerIndex;
              const isPicked = picked === i;
              let bg = 'var(--surface)', border = 'var(--border)', cls = '';
              if (answered) {
                if (isAnswer) { bg = 'var(--green-bg)'; border = 'var(--green-border)'; if (isPicked) cls = 'pal-success-ring'; }
                else if (isPicked) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; cls = 'pal-shake'; }
              }
              return (
                <button
                  key={i}
                  className={cls}
                  onClick={() => { if (!answered) setPicked(i); }}
                  disabled={answered}
                  style={{
                    textAlign: 'left', padding: '0.55rem 0.8rem', borderRadius: 'var(--radius-sm)',
                    border: '1px solid ' + border, background: bg, cursor: answered ? 'default' : 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}
                >
                  {answered && isAnswer && <Icon name="check" size={14} color="var(--green-text)" />}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          {answered && (
            <div style={{ fontSize: '0.85rem', color: correct ? 'var(--green-text)' : 'var(--text-muted)' }}>
              {correct ? 'Right. Now run it and watch the mechanism.' : 'Not quite - run it and watch what really happens.'}
            </div>
          )}
        </div>
      )}

      {/* The demo (runnable, glass-box footer) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Run the demo</div>
        <PythonCell
          initialCode={m.demoCode}
          label="demo.py"
          height={Math.min(340, 70 + m.demoCode.split('\n').length * 19)}
        />
      </div>

      {/* Reveal control */}
      {!revealed && (
        <button
          onClick={reveal}
          className={hasPredict && answered ? 'pal-glow-pulse pal-btn-primary' : 'pal-btn-primary'}
          style={{ alignSelf: 'flex-start' }}
        >
          Reveal how it works
        </button>
      )}

      {/* Reveal panel — explain[] collapsibles + mental model + forward pointer */}
      {revealed && (
        <div className="pal-reveal-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', borderTop: '1px solid var(--border)', paddingTop: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Icon name="brain" size={15} color={cluster.accent} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>How it actually works</span>
          </div>

          {m.explain.map((sec, i) => (
            <details key={i} open={i === 0} className="pl-know-section" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem' }}>
              <summary style={{ cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', listStyle: 'none' }}>
                {sec.heading}
              </summary>
              <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{sec.body}</p>
            </details>
          ))}

          {/* Mental model callout — accent-bordered */}
          <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderLeft: '3px solid var(--accent)', borderRadius: 'var(--radius-sm)', padding: '0.7rem 0.9rem' }}>
            <div style={{ fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '0.25rem' }}>Mental model</div>
            <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.55, fontWeight: 600 }}>{m.mentalModel}</p>
          </div>

          <ForwardPointerCard room="gotchas" onNext={onNext} onNavigate={onBack} />
        </div>
      )}
    </div>
  );
}

export function KnowBrowser() {
  const [activeId, setActiveId] = useState(null);
  const progress = getProgress(KNOW_KEY);

  const ordered = knowModules
    .slice()
    .sort((a, b) => KNOW_CLUSTER_ORDER.indexOf(a.cluster) - KNOW_CLUSTER_ORDER.indexOf(b.cluster));

  if (activeId) {
    const idx = ordered.findIndex(m => m.id === activeId);
    const module = ordered[idx];
    const next = ordered[(idx + 1) % ordered.length];
    return (
      <KnowRunner
        key={module.id}
        module={module}
        onBack={() => setActiveId(null)}
        onNext={() => { setActiveId(next.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />
    );
  }

  // Group by cluster for display.
  const groups = KNOW_CLUSTER_ORDER
    .map(key => ({ key, meta: KNOW_CLUSTERS[key], items: ordered.filter(m => m.cluster === key) }))
    .filter(g => g.items.length > 0);

  let cardIndex = 0;

  return (
    <div className="pal-page-enter">
      {/* Title */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <Icon name="brain" size={18} color="var(--teal)" />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>How It Works</h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '56ch' }}>
          Short depth explainers for the Python mechanics that trip people up. Each one comes with a runnable demo - predict the output, run it for real, then read how the machine actually behaves.
        </p>
      </div>

      <HowToStrip
        skill="Mechanism over memorisation - the model behind the gotcha"
        steps={['Predict the output', 'Run the demo', 'Read how it works']}
      />

      {/* Cluster groups */}
      {groups.map(group => (
        <section key={group.key} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem' }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: group.meta.accent, display: 'inline-block' }} />
            <h2 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{group.meta.label}</h2>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{group.items.length}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: GRID_COLS, gap: '0.85rem' }}>
            {group.items.map(m => {
              const seen = !!progress.seen[m.id];
              const solved = !!progress.solved[m.id];
              const delay = (Math.min(cardIndex++ * 0.03, 0.5)) + 's';
              return (
                <button
                  key={m.id}
                  onClick={() => { setActiveId(m.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="pal-card-enter pal-card-hover"
                  style={{
                    animationDelay: delay,
                    textAlign: 'left', cursor: 'pointer',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '0.9rem 1rem',
                    display: 'flex', flexDirection: 'column', gap: '0.4rem',
                    borderTop: '2px solid ' + group.meta.accent,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.25 }}>{m.title}</span>
                    {solved
                      ? <Icon name="clipboard-check" size={15} color="var(--green-text)" />
                      : seen ? <Icon name="clock" size={14} color="var(--text-dim)" /> : null}
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{m.subtitle}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export default KnowBrowser;
