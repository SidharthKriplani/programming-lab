// PlatinumMenuBar — the classic Mac OS menu bar for the Platinum skin.
// Fixed to the very top of the screen. The corner glyph is the BreakLabs SEAM
// (NOT Apple's apple — that's trademarked); then the app name + live clock.
// Rendered only when skin === 'platinum' (App gates it). Part of D-PL-19.
import { useState, useEffect } from 'react';

// The BreakLabs fault-glyph seam (constant red mark across all labs, HQ D-19) —
// sits where the Apple menu would, making the system corner ours.
function BreakSeam() {
  return (
    <svg width="7" height="16" viewBox="0 0 11 34" aria-label="BreakLabs" style={{ display: 'block' }}>
      <path d="M6 2 L3 11 L9 17 L3 23 L6 32" fill="none" stroke="#FB5247" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function useClock() {
  const fmt = () => {
    const d = new Date();
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ap = h < 12 ? 'AM' : 'PM';
    h = h % 12; if (h === 0) h = 12;
    return h + ':' + m + ' ' + ap;
  };
  const [t, setT] = useState(fmt());
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 15000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export function PlatinumMenuBar() {
  const clock = useClock();
  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '22px', zIndex: 1000,
        display: 'flex', alignItems: 'center', gap: '16px',
        background: 'var(--header-bg)', borderBottom: '1px solid var(--border)',
        padding: '0 11px', fontFamily: "Geneva, 'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontSize: '13px', color: 'var(--text)', userSelect: 'none',
      }}
    >
      <BreakSeam />
      <span style={{ fontWeight: 700 }}>Programming Lab</span>
      <span style={{ marginLeft: 'auto', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{clock}</span>
    </div>
  );
}

export default PlatinumMenuBar;
