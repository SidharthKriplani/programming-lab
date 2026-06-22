/**
 * ForwardPointerCard — shows after a gotcha reveal/debrief completion.
 * Surfaces one suggested next action so users don't hit a dead end.
 * Adapted from PAL ForwardPointerCard (analytics track() stripped; PL has a
 * single live room so the targets are gotchas-specific).
 * Usage: <ForwardPointerCard room="gotchas" onNext={onNext} onNavigate={onNavigate} />
 */
export function ForwardPointerCard({ room = 'gotchas', onNavigate, onNext }) {
  return (
    <div
      className="pal-reveal-in"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1rem 1.25rem',
        marginTop: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
        What to do next
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {onNext && (
          <button
            onClick={onNext}
            style={{
              background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
              borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.85rem',
              fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent)', cursor: 'pointer',
            }}
          >
            Next gotcha →
          </button>
        )}
        {onNavigate && (
          <button
            onClick={() => onNavigate('gotchas')}
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.85rem',
              fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            Back to all gotchas
          </button>
        )}
      </div>
    </div>
  );
}

export default ForwardPointerCard;
