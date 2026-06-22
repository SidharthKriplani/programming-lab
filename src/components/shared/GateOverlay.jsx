// GateOverlay — wraps gated content. Passthrough during beta.
//
// Synthesized from GSL GateOverlay base structure (lock icon + outcome-framed
// copy + CTA) but rebuilt as a *wrapper* that mounts its lock screen via a
// React portal (createPortal). Visibility is driven by isUnlocked() from
// utils/unlock.js — which returns true in beta, so the overlay NEVER shows
// right now. It is wired so flipping the Stripe TODO turns it on with no other
// change.
//
// Usage:
//   <GateOverlay unlocked={unlocked} context="gotcha-deep-dive">
//     ...gated content...
//   </GateOverlay>
import { createPortal } from 'react-dom';
import { isUnlocked } from '../../utils/unlock.js';

// ─── Contextual, outcome-framed copy per locked surface ──────────────────────
const GATE_COPY = {
  'gotcha-deep-dive': {
    title: 'See what the machine actually does',
    body: 'You can guess the output. The value is in the glass box underneath — wall time, peak memory, and the exact reason the interpreter behaves this way. That layer is what turns a surprise into an instinct.',
  },
  'full-bank': {
    title: 'The full gotcha bank',
    body: 'Mutable defaults, late binding, integer caching, floating-point drift — the traps that survive code review and fail in production. The complete bank, each one runnable and instrumented, starts here.',
  },
  default: {
    title: 'Unlock Programming Lab',
    body: 'Run real Python in the browser, see the timing and memory the interpreter actually spends, and keep a daily post ready to ship. Full access starts here.',
  },
};

// ─── Lock icon (GSL base) ────────────────────────────────────────────────────
function LockIcon({ color = 'var(--accent)' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="4" y="9" width="12" height="9" rx="2" stroke={color} strokeWidth="1.5" />
      <path d="M7 9V6a3 3 0 016 0v3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LockScreen({ context }) {
  const copy = GATE_COPY[context] || GATE_COPY.default;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        background: 'var(--overlay)',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        className="pal-slide-up"
        style={{
          maxWidth: '28rem', width: '100%',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          padding: '1.75rem',
          textAlign: 'center',
          display: 'flex', flexDirection: 'column', gap: '1rem',
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 14, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
        }}>
          <LockIcon />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>
            {copy.title}
          </h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {copy.body}
          </p>
        </div>
        <button className="pal-btn-primary" style={{ width: '100%' }}>
          Get full access →
        </button>
      </div>
    </div>
  );
}

/**
 * GateOverlay
 * @param {boolean} unlocked  — caller's unlock flag. Defaults to isUnlocked().
 * @param {string}  context   — key into GATE_COPY for the lock screen.
 * @param {ReactNode} children — the gated content, always rendered.
 */
export function GateOverlay({ unlocked, context = 'default', children }) {
  const open = unlocked !== undefined ? unlocked : isUnlocked();

  return (
    <>
      {children}
      {!open && createPortal(<LockScreen context={context} />, document.body)}
    </>
  );
}

export default GateOverlay;
