// skin — the pluggable look system for PL. A "skin" is the whole visual world
// (chrome family + palette + fonts), applied as [data-skin] on <html>, swappable
// in one line. Orthogonal to the dark/light theme toggle.
//
//   platinum    — classic Mac OS 8/9 Platinum workstation (DEFAULT, the active look)
//   greenscreen — the P1 phosphor CRT terminal (lives inside terminal windows later)
//   aqua        — Mac OS X Aqua terminal (reserved)
//   hybrid      — Platinum desktop that opens Aqua terminals (reserved)
//
// Changing the active skin = setSkin('greenscreen'). No rebuild — the CSS token
// blocks scoped to :root[data-skin='...'] do the rest. (D-PL-19)
const KEY = 'pl-skin-v1';
export const SKINS = ['platinum', 'greenscreen', 'aqua', 'hybrid'];
const DEFAULT_SKIN = 'platinum';

export function getSkin() {
  try {
    const s = localStorage.getItem(KEY);
    return SKINS.includes(s) ? s : DEFAULT_SKIN;
  } catch {
    return DEFAULT_SKIN;
  }
}

export function applySkin(s) {
  document.documentElement.dataset.skin = SKINS.includes(s) ? s : DEFAULT_SKIN;
}

export function setSkin(s) {
  const v = SKINS.includes(s) ? s : DEFAULT_SKIN;
  try { localStorage.setItem(KEY, v); } catch { /* ignore */ }
  applySkin(v);
  return v;
}

// cycle through the two LIVE skins (platinum <-> greenscreen) — proves pluggability
export function cycleSkin() {
  return setSkin(getSkin() === 'platinum' ? 'greenscreen' : 'platinum');
}

export function initSkin() {
  applySkin(getSkin());
}
