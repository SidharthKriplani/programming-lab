// gotchaProgress — localStorage progress for the Python Gotchas room.
// Mirrors PAL's per-room progress utils (getProgress / markSeen / markSolved /
// resetProgress). Key: 'pl-gotcha-progress-v1'.
//
// Shape stored: { seen: { [id]: true }, solved: { [id]: true } }

const PROGRESS_KEY = 'pl-gotcha-progress-v1';

function read() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { seen: {}, solved: {} };
    const parsed = JSON.parse(raw);
    return {
      seen: parsed.seen || {},
      solved: parsed.solved || {},
    };
  } catch {
    return { seen: {}, solved: {} };
  }
}

function write(state) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
  } catch {
    // ignore — storage unavailable
  }
}

export function getProgress() {
  return read();
}

export function isSeen(id) {
  return !!read().seen[id];
}

export function isSolved(id) {
  return !!read().solved[id];
}

export function markSeen(id) {
  if (!id) return;
  const state = read();
  if (state.seen[id]) return;
  state.seen[id] = true;
  write(state);
}

export function markSolved(id) {
  if (!id) return;
  const state = read();
  let changed = false;
  if (!state.seen[id]) { state.seen[id] = true; changed = true; }
  if (!state.solved[id]) { state.solved[id] = true; changed = true; }
  if (changed) write(state);
}

export function resetProgress() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    // ignore
  }
}

export function getCounts() {
  const state = read();
  return {
    seen: Object.keys(state.seen).length,
    solved: Object.keys(state.solved).length,
  };
}
