import { Icon } from './Icon.jsx';

// WorldGate — the full-page overlay shown when a locked world tab is clicked.
// Presents two unlock paths: self-declare ("I know this") and quiz-verify ("Prove it").
// Props:
//   world            — the world object from PYLAB_WORLDS
//   onSelfDeclare()  — user clicks "Jump in"
//   onStartQuiz()    — user clicks "Prove it"
//   onStartTutorial()— user clicks tutorial link (Python Core only)
//   onClose()        — back button
export function WorldGate({ world, onSelfDeclare, onStartQuiz, onStartTutorial, onClose }) {
  return (
    <div className="pal-page-enter" style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Back */}
      <button
        onClick={onClose}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '0.84rem', padding: '0 0 1.5rem 0',
        }}
      >
        <Icon name="arrow-left" size={14} color="var(--text-muted)" /> All worlds
      </button>

      {/* World header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <span style={{
          width: 44, height: 44, borderRadius: 'var(--radius-sm)',
          background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name={world.icon} size={22} color="var(--accent)" />
        </span>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.15 }}>
            {world.label}
          </h2>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600 }}>
            {world.tagline}
          </p>
        </div>
      </div>

      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary, var(--text-muted))', lineHeight: 1.6, marginBottom: '2rem' }}>
        {world.description}
      </p>

      {/* Gate card */}
      <div style={{
        border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
        background: 'var(--surface)', overflow: 'hidden',
      }}>
        {/* Self-declare path */}
        <div style={{ padding: '1.25rem 1.4rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.2rem' }}>
                Already know this world?
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Jump straight to Correctness-level problems. Takes 0 seconds.
              </div>
            </div>
            <button
              onClick={onSelfDeclare}
              style={{
                flexShrink: 0, padding: '0.5rem 1rem',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                color: 'var(--text)', fontSize: '0.84rem', fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              }}
            >
              Jump in <Icon name="arrow-right" size={14} color="currentColor" />
            </button>
          </div>
        </div>

        {/* Quiz-verify path */}
        <div style={{ padding: '1.25rem 1.4rem', background: 'var(--accent-bg, var(--surface))' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
                  Prove it in {world.quizCount} questions
                </span>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', padding: '0.1rem 0.4rem',
                  borderRadius: 999, background: 'var(--accent)', color: '#fff',
                }}>
                  Recommended
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Predict-output questions. Pass at 80%+ to unlock with a verified badge. Takes 2{'–'}3 minutes.
              </div>
            </div>
            <button
              onClick={onStartQuiz}
              className="pal-btn-primary"
              style={{
                flexShrink: 0, padding: '0.5rem 1rem',
                fontSize: '0.84rem', fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              }}
            >
              <Icon name="zap" size={14} color="currentColor" /> Prove it
            </button>
          </div>
        </div>
      </div>

      {/* Tutorial link — only Python Core world */}
      {world.tutorialEnabled && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={onStartTutorial}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '0.82rem',
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}
          >
            <Icon name="book-open" size={13} color="var(--text-muted)" /> Start from scratch — open tutorial
          </button>
        </div>
      )}
    </div>
  );
}
