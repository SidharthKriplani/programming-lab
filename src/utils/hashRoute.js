// hashRoute — lightweight hash-based deep linking for PL (no router dependency).
// Every room is addressable at #/<view>; PyLab problems at #/pylab/<problemId>; gotchas at
// #/gotchas/<gotchaId>. Enables shareable/bookmarkable internal links across the whole app,
// and lets the md docs point at specific surfaces. Sibling labs can adopt the same shape.
//
//   #/pylab                     -> the PyLab bank
//   #/pylab/dc-active-users     -> that problem, opened
//   #/gotchas/py-gotcha-03      -> that gotcha, opened
//   #/foundations               -> the KNOW foundations surface
//
// parse: read the current hash into { view, sub }. build/set: write it back without a reload.

export const VIEWS = ['home', 'gotchas', 'pylab', 'foundations', 'know', 'judge', 'trapmuseum', 'build', 'progress', 'leaderboard'];

export function parseHash() {
  const raw = (typeof window !== 'undefined' && window.location ? window.location.hash : '') || '';
  const clean = raw.replace(/^#\/?/, '');          // strip a leading "#" or "#/"
  const parts = clean.split('/').filter(Boolean);
  const view = parts[0];
  return {
    view: VIEWS.includes(view) ? view : 'home',
    sub: parts.slice(1).join('/') || '',
  };
}

export function buildHash(view, sub) {
  let h = '#/' + (view || 'home');
  if (sub) h += '/' + sub;
  return h;
}

// Set the hash without triggering a reload; no-op if it already matches (avoids loops).
export function setHash(view, sub) {
  if (typeof window === 'undefined' || !window.location) return;
  const h = buildHash(view, sub);
  if (window.location.hash !== h) window.location.hash = h;
}
