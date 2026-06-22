// BrandMark — the canonical BreakLabs lockup (HQ D-19, BRANDMARK-ROLLOUT.md).
// Constant everywhere: red fault-glyph seam + the `break⌇labs` wordmark.
// Per lab (PL): descriptor 'Programming', accent violet #8B5CF6.
// House rule: single quotes, no template literals.
const SEAM = '#FB5247'; // brand red — the fault-glyph (constant across all labs)

function Seam({ h = 28 }) {
  const w = Math.round(h * 0.32);
  return (
    <svg width={w} height={h} viewBox='0 0 11 34' aria-hidden='true' style={{ margin: '0 1px', flex: '0 0 auto' }}>
      <path d='M6 2 L3 11 L9 17 L3 23 L6 32' fill='none' stroke={SEAM} strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

// variant: 'full' (wordmark + descriptor) | 'wordmark' | 'monogram'
// accent: the lab's track accent hex (PL violet #8B5CF6)
export function BrandMark({ variant = 'full', descriptor = '', accent = '#8B5CF6', size = 28 }) {
  if (variant === 'monogram') {
    return (
      <span aria-label='BreakLabs' style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, borderRadius: Math.round(size * 0.24),
        background: 'var(--surface, #15171A)', border: '1px solid var(--rim, #2A2D31)' }}>
        <Seam h={Math.round(size * 0.62)} />
      </span>
    );
  }
  return (
    <span aria-label={descriptor ? `BreakLabs ${descriptor}` : 'BreakLabs'}
      style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-mono)',
        fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--ink-hi, #F2F3F5)', fontSize: size }}>
      break<Seam h={size} />labs
      {variant === 'full' && descriptor && (
        <>
          <span style={{ color: 'var(--ink-low, #5F5E5A)', margin: '0 0.4em' }}>·</span>
          <span style={{ color: accent }}>{descriptor}</span>
        </>
      )}
    </span>
  );
}

export default BrandMark;
