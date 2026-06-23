// theme — light/dark toggle for PL. Platinum LIGHT is the default (the adopted look);
// DARK paints Platinum as Graphite (a charcoal dark mode, not a separate skin).
// Applied as [data-theme] on <html>. Persisted to localStorage. (Dark used to be the
// green-screen CRT — retired; see index.css PLATINUM · DARK = GRAPHITE.)
const KEY = 'pl-theme-v1';

export function getTheme() {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
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
