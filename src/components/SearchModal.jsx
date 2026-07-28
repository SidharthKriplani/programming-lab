// SearchModal — PL v1 search trigger's modal (new ruling 2026-07-28: chrome search trigger
// centered + wired for all four labs; PL had no search feature at all). Client-side,
// title-only index (data/searchIndex.js) — no scoring, no content search, no highlights,
// substring match capped to MAX_RESULTS. Keyboard: Esc closes, Enter opens the highlighted
// (or top) hit, Up/Down move the highlight.
//
// Navigation-granularity flag: PL's only room-addressable ROUTE is `climb` (roomId) —
// FoundationsBrowser's per-module RoomDetail view is internal component state, not a
// route, so there is no existing deep link straight to a module. Every hit (room or
// module) therefore opens that module's/room's ROOM via the climb route; ClimbRunner
// already has its own graceful "not authored yet — back to Foundations" fallback for
// rooms with no ready climb thread, so this degrades safely rather than breaking.
import { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from './shared/Icon.jsx';
import { SEARCH_INDEX } from '../data/searchIndex.js';

const MAX_RESULTS = 8;

export function SearchModal({ open, onClose, onNavigateRoom }) {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setQ(''); setIdx(-1);
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return SEARCH_INDEX.filter(it => it.title.toLowerCase().includes(needle)).slice(0, MAX_RESULTS);
  }, [q]);

  function go(hit) {
    if (!hit) return;
    onNavigateRoom(hit.roomId);
    onClose();
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => (i < results.length - 1 ? i + 1 : i)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => (i > 0 ? i - 1 : -1)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(results[idx >= 0 ? idx : 0]); }
  }

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Search" onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ width: 'min(520px, 92vw)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 0.9rem', borderBottom: '1px solid var(--border)' }}>
          <Icon name="search" size={15} color="var(--text-dim)" />
          <input ref={inputRef} value={q} onChange={e => { setQ(e.target.value); setIdx(-1); }} onKeyDown={onKeyDown}
            placeholder="Search rooms & modules…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '0.92rem', color: 'var(--text)', fontFamily: 'inherit' }} />
          <kbd style={{ fontSize: '0.62rem', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Esc</kbd>
        </div>
        {q.trim() && (
          <div style={{ maxHeight: '48vh', overflowY: 'auto', padding: '0.35rem' }}>
            {results.length === 0 ? (
              <div style={{ padding: '0.9rem', fontSize: '0.82rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>No matches.</div>
            ) : results.map((hit, i) => (
              <button key={hit.type + ':' + hit.id} onClick={() => go(hit)} onMouseEnter={() => setIdx(i)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 1, width: '100%', textAlign: 'left',
                  padding: '0.5rem 0.65rem', borderRadius: 8, cursor: 'pointer', border: 'none',
                  background: i === idx ? 'var(--surface-2)' : 'transparent',
                }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{hit.title}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  {hit.type === 'room' ? 'room' : 'module · ' + hit.roomTitle}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchModal;
