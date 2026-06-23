// pyLabSR — spaced repetition for PyLab (PYLAB-VISION §3, Phase 3). A light SM-2:
// solve a problem and it gets a growing review interval (1d → 3d → ×ease); fail it
// (submit wrong, then reveal) and it resets to "due now". dueIds() powers the
// "due for review" queue in the browser. Only tracks problems you actually submitted —
// a pure reveal (never attempted) schedules nothing.
const KEY = 'pl-pylab-sr-v1';
const DAY = 86400000;
const EASE0 = 2.3, EASE_MIN = 1.3, EASE_MAX = 2.8;

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save(m) {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* ignore */ }
}
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// Schedule a review. correct=true grows the interval; correct=false resets it.
export function reviewSR(id, correct) {
  if (!id) return null;
  const m = load();
  const c = m[id] || { ease: EASE0, interval: 0, reps: 0 };
  if (correct) {
    c.reps += 1;
    c.interval = c.reps === 1 ? 1 : c.reps === 2 ? 3 : Math.max(1, Math.round(c.interval * c.ease));
    c.ease = clamp(c.ease + 0.1, EASE_MIN, EASE_MAX);
  } else {
    c.reps = 0;
    c.interval = 0;
    c.ease = clamp(c.ease - 0.2, EASE_MIN, EASE_MAX);
  }
  c.due = Date.now() + c.interval * DAY;
  c.last = Date.now();
  m[id] = c;
  save(m);
  return c;
}

export function dueIds(now = Date.now()) {
  const m = load();
  return Object.keys(m).filter(id => (m[id].due || 0) <= now);
}

export function srStats(now = Date.now()) {
  const m = load();
  const ids = Object.keys(m);
  return { tracked: ids.length, due: ids.filter(id => (m[id].due || 0) <= now).length };
}

export function srCard(id) {
  return load()[id] || null;
}
