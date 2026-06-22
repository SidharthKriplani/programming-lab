// theme — dark/light toggle for PL. Dark ("Instrument") is the default identity;
// "light" is the warm Field Notes mode. Applied as [data-theme] on <html>, the
// same mechanism the sibling labs use. Persisted to localStorage.
const KEY = 'pl-theme-v1';

export function getTheme() {
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function applyTheme(t) {
  document.documentElement.dataset.theme = t === 'light' ? 'light' : 'dark';
}

export function setTheme(t) {
  const v = t === 'light' ? 'light' : 'dark';
  try { localStorage.setItem(KEY, v); } catch { /* ignore */ }
  applyTheme(v);
  return v;
}

export function toggleTheme() {
  return setTheme(getTheme() === 'light' ? 'dark' : 'light');
}

export function initTheme() {
  applyTheme(getTheme());
}
