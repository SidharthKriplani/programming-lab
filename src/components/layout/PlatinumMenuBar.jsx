// PlatinumMenuBar — the classic Mac OS menu bar for the Platinum skin.
// Fixed to the very top of the screen: rainbow Apple, app menus, live clock.
// Rendered only when skin === 'platinum' (App gates it). Part of D-PL-19.
import { useState, useEffect } from 'react';

const MENUS = ['File', 'Edit', 'View', 'Run', 'Special'];

function RainbowApple() {
  return (
    <svg width="13" height="15" viewBox="0 0 170 200" aria-label="Apple" style={{ display: 'block' }}>
      <defs>
        <clipPath id="pl-apple-clip">
          <path d="M99.9,42.2c0,0,2.6-19.5,19.8-21.3c0,0,3.2,13.9-8.9,21.3C99.9,49.2,99.9,42.2,99.9,42.2z" />
          <path d="M132.4,60.2c-0.3,0.2-18.2,10.3-18,32.7c0.2,26.8,23.5,35.7,23.8,35.8c-0.2,0.6-3.7,12.8-12.3,25.4c-7.4,10.9-15.1,21.7-27.3,21.9c-12,0.2-15.8-7.1-29.5-7.1c-13.7,0-17.9,6.9-29.2,7.3c-11.7,0.4-20.7-11.8-28.1-22.6C-5.7,140.5-17.3,100.1-1.7,72.9C6,59.4,19.9,50.8,34.9,50.6c11.5-0.2,22.4,7.8,29.5,7.8c7,0,20.3-9.6,34.2-8.2C104.4,50.4,120.8,52.6,131.3,68C150.5,49.9,132.7,60,132.4,60.2z" />
        </clipPath>
      </defs>
      <g clipPath="url(#pl-apple-clip)">
        <rect x="0" y="15" width="170" height="28" fill="#61bb46" />
        <rect x="0" y="43" width="170" height="28" fill="#fdb827" />
        <rect x="0" y="71" width="170" height="28" fill="#f5821f" />
        <rect x="0" y="99" width="170" height="28" fill="#e03a3e" />
        <rect x="0" y="127" width="170" height="28" fill="#963d97" />
        <rect x="0" y="155" width="170" height="30" fill="#009ddc" />
      </g>
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
        background: '#f0f0f0', borderBottom: '1px solid #000',
        padding: '0 11px', fontFamily: "Geneva, 'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontSize: '13px', color: '#000', userSelect: 'none',
      }}
    >
      <RainbowApple />
      <span style={{ fontWeight: 700 }}>Programming Lab</span>
      <span style={{ marginLeft: 'auto', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{clock}</span>
    </div>
  );
}

export default PlatinumMenuBar;
