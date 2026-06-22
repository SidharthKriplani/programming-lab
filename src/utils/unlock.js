// Access gate — beta passthrough.
// isUnlocked() returns true during beta so every room is open.
// TODO: set to false when Stripe goes live.
//
// Copied from Product Analytics Lab (PAL) unlock.js to keep the gate API
// identical across sibling labs. When Stripe ships, isUnlocked() will also
// accept a valid Stripe session / access code.
const UNLOCK_KEY = 'pl-access-code-v1';

// Access codes — comparison is case-insensitive at runtime.
const VALID_CODES = ['PROG2026'];

export function isUnlocked() {
  // Beta: everything is unlocked.
  // TODO: set to false when Stripe goes live.
  return true;
}

export function tryUnlock(code) {
  const normalized = code.trim().toUpperCase();
  if (VALID_CODES.includes(normalized)) {
    try {
      localStorage.setItem(UNLOCK_KEY, normalized);
    } catch {
      // ignore — storage unavailable
    }
    return true;
  }
  return false;
}

export function lock() {
  try {
    localStorage.removeItem(UNLOCK_KEY);
  } catch {
    // ignore
  }
}

export function getStoredCode() {
  try {
    return localStorage.getItem(UNLOCK_KEY) || null;
  } catch {
    return null;
  }
}
