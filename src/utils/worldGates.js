// worldGates.js — per-world unlock state, persisted in localStorage.
// Schema: { [worldId]: { unlocked: true, method: 'self'|'quiz'|'tutorial', defaultLevel: string } }
// The `defaultLevel` is the level the problem grid should open at when entering this world
// for the first time (driven by unlock method — see pyLabWorlds.js unlockDefaultLevel).

const GATES_KEY = 'pl-world-gates-v1';

function load() {
  try { return JSON.parse(localStorage.getItem(GATES_KEY) || '{}'); }
  catch { return {}; }
}

function save(gates) {
  try { localStorage.setItem(GATES_KEY, JSON.stringify(gates)); }
  catch { /* storage full — silently ignore */ }
}

export function getAllGateStates() {
  return load();
}

export function getWorldState(worldId) {
  return load()[worldId] || null;
}

export function isWorldUnlocked(worldId) {
  const state = load()[worldId];
  return !!(state && state.unlocked);
}

// Unlock a world. method = 'self' | 'quiz' | 'tutorial'.
// defaultLevel = the level to open the grid at after unlocking.
export function unlockWorld(worldId, method, defaultLevel) {
  const gates = load();
  gates[worldId] = { unlocked: true, method, defaultLevel: defaultLevel || 'correctness' };
  save(gates);
}

export function resetWorldGates() {
  try { localStorage.removeItem(GATES_KEY); } catch { /* ignore */ }
}
