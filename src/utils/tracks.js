// src/utils/tracks.js — My Tracks local storage layer for programming-lab.
// Family convention (GSL/MSL/PAL siblings), PL edition. localStorage key: 'pl-tracks-v1'.
// Track shape: { id, name, createdAt, items: [...] }
// Item shapes:
//   { type: 'pylab'|'gotcha'|'know', itemId, label, meta, addedAt }   — deep-linkable content
//   { type: 'note', id, title, blocks: [...], addedAt, updatedAt }     — rich block note
//     (block shapes: see components/tracks/NoteEditor.jsx — text/h1-h3/bullet/
//      numbered/todo/quote/callout/code/toggle/divider/video/link)

import { pyLabProblems } from '../data/pyLabProblems.js';
import { tierOf } from '../data/moduleTiers.js';

const KEY = 'pl-tracks-v1';
const LAST_KEY = 'pl-tracks-last-v1';

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function load() {
  try {
    const t = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(t) ? t : [];
  } catch { return []; }
}

function save(tracks) {
  try {
    localStorage.setItem(KEY, JSON.stringify(tracks));
    window.dispatchEvent(new CustomEvent('pl_tracks'));
  } catch { /* ignore */ }
}

export function getTracks() { return load(); }
export function getTrack(id) { return load().find(t => t.id === id) || null; }

export function createTrack(name) {
  const t = { id: uid(), name: (name || '').trim() || 'Untitled Track', createdAt: Date.now(), items: [] };
  save([...load(), t]);
  return t;
}

export function renameTrack(id, name) {
  save(load().map(t => t.id === id ? { ...t, name: (name || '').trim() || t.name, updatedAt: Date.now() } : t));
}

export function deleteTrack(id) {
  save(load().filter(t => t.id !== id));
}

// One-click S/A/B tier tracks from the PyLab bank, by seniority level
// (pyLabMeta.levelOf): systems -> S, judgment -> A, the rest -> B.
export function seedTierTracks() {
  const names = { S: 'S Tier', A: 'A Tier', B: 'B Tier' };
  const now = Date.now();
  const buckets = { S: [], A: [], B: [] };
  for (const p of pyLabProblems) {
    const t = tierOf(p);
    buckets[t].push({ type: 'pylab', itemId: String(p.id), label: p.title, meta: { topic: p.topic, difficulty: p.difficulty, tier: t }, addedAt: now });
  }
  const kept = load().filter(t => !['S Tier', 'A Tier', 'B Tier'].includes(t.name));
  const tierTracks = ['S', 'A', 'B'].map(t => ({ id: uid(), name: names[t], createdAt: now, items: buckets[t] }));
  save([...kept, ...tierTracks]);
  return tierTracks.map(t => ({ name: t.name, count: t.items.length }));
}

// ── Generic item CRUD ─────────────────────────────────────────────────────────

export function addItem(trackId, type, itemId, label, meta = {}) {
  const tracks = load();
  const t = tracks.find(x => x.id === trackId);
  if (!t) return;
  if (t.items.some(i => i.type === type && i.itemId === String(itemId))) return;
  t.items.push({ type, itemId: String(itemId), label: label || '', meta, addedAt: Date.now() });
  save(tracks);
  setLastTrackId(trackId);
}

export function removeItem(trackId, index) {
  const tracks = load();
  const t = tracks.find(x => x.id === trackId);
  if (!t) return;
  t.items.splice(index, 1);
  save(tracks);
}

export function removeGenericFromTrack(trackId, type, itemId) {
  const tracks = load();
  const t = tracks.find(x => x.id === trackId);
  if (!t) return;
  const idx = t.items.findIndex(i => i.type === type && String(i.itemId) === String(itemId));
  if (idx >= 0) { t.items.splice(idx, 1); save(tracks); }
}

export function getTracksForItem(type, itemId) {
  return load()
    .filter(t => t.items.some(i => i.type === type && i.itemId === String(itemId)))
    .map(t => t.id);
}

export function reorderItems(trackId, fromIndex, toIndex) {
  const tracks = load();
  const t = tracks.find(x => x.id === trackId);
  if (!t) return;
  const [m] = t.items.splice(fromIndex, 1);
  t.items.splice(toIndex, 0, m);
  save(tracks);
}

// ── Note CRUD (rich, block-based — same shape as the siblings) ────────────────

export function createNote(trackId, title = '', seedText = '') {
  const tracks = load();
  const t = tracks.find(x => x.id === trackId);
  if (!t) return null;
  const note = {
    type: 'note', id: uid(), title,
    blocks: [{ id: uid(), type: 'text', content: seedText }],
    addedAt: Date.now(), updatedAt: Date.now(),
  };
  t.items.push(note);
  save(tracks);
  setLastTrackId(trackId);
  return note;
}

export function updateNoteById(trackId, noteId, patch) {
  const tracks = load();
  const t = tracks.find(x => x.id === trackId);
  if (!t) return;
  t.items = t.items.map(i => (i.type === 'note' && i.id === noteId) ? { ...i, ...patch, updatedAt: Date.now() } : i);
  save(tracks);
}

export function deleteNoteById(trackId, noteId) {
  const tracks = load();
  const t = tracks.find(x => x.id === trackId);
  if (!t) return;
  t.items = t.items.filter(i => !(i.type === 'note' && i.id === noteId));
  save(tracks);
}

// ── Quick-add (last-used track) ───────────────────────────────────────────────

function setLastTrackId(id) { try { if (id) localStorage.setItem(LAST_KEY, id); } catch { /* ignore */ } }
export function getLastTrackId() { try { return localStorage.getItem(LAST_KEY) || null; } catch { return null; } }
