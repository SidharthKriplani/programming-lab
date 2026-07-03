// problemProgress — localStorage progress for the test-based problem banks
// (Python drills, pandas). Keyed per bank so each tracks independently.
// Shape: { seen: { [id]: true }, solved: { [id]: true } }

export const PYTHON_KEY = 'pl-python-progress-v1';
export const PANDAS_KEY = 'pl-pandas-progress-v1';
export const BUILD_KEY = 'pl-build-progress-v1';
export const IDIOMS_KEY = 'pl-idioms-progress-v1';
export const OOP_KEY = 'pl-oop-progress-v1';

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { seen: {}, solved: {} };
    const p = JSON.parse(raw);
    return { seen: p.seen || {}, solved: p.solved || {} };
  } catch {
    return { seen: {}, solved: {} };
  }
}

function write(key, s) {
  try { localStorage.setItem(key, JSON.stringify(s)); } catch { /* ignore */ }
}

export function getProgress(key) { return read(key); }

export function markSeen(key, id) {
  if (!id) return;
  const s = read(key);
  if (s.seen[id]) return;
  s.seen[id] = true;
  write(key, s);
}

export function markSolved(key, id) {
  if (!id) return;
  const s = read(key);
  let changed = false;
  if (!s.seen[id]) { s.seen[id] = true; changed = true; }
  if (!s.solved[id]) { s.solved[id] = true; changed = true; }
  if (changed) write(key, s);
}

export function getCounts(key) {
  const s = read(key);
  return { seen: Object.keys(s.seen).length, solved: Object.keys(s.solved).length };
}

// ── Attempt history (the SQL-Lab "previous attempts" feature) ────────────────
// Stored separately so the progress object stays small. Shape per key:
//   { [problemId]: [{ ts, pass, ms, peakKb }] }  (most recent last, capped)
const ATTEMPTS_SUFFIX = ':attempts';

function readAttempts(key) {
  try {
    const raw = localStorage.getItem(key + ATTEMPTS_SUFFIX);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getAttempts(key, id) {
  const all = readAttempts(key);
  return (all[id] || []);
}

// Record a Submit attempt (graded). Keeps the last 25 per problem.
export function addAttempt(key, id, { pass, ms = 0, peakKb = 0 } = {}) {
  if (!id) return [];
  const all = readAttempts(key);
  const list = all[id] || [];
  list.push({ ts: Date.now(), pass: !!pass, ms, peakKb });
  all[id] = list.slice(-25);
  try { localStorage.setItem(key + ATTEMPTS_SUFFIX, JSON.stringify(all)); } catch { /* ignore */ }
  return all[id];
}
