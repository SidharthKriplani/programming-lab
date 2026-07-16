// src/components/tracks/AddTrackBtn.jsx — the family "+" save-to-track button,
// PL edition. Popover with the track list, tick to add/remove, inline create.
import { useState, useRef, useEffect } from 'react';
import { getTracks, createTrack, addItem, removeGenericFromTrack, getTracksForItem } from '../../utils/tracks.js';

export function AddTrackBtn({ itemType, itemId, label, itemMeta = {} }) {
  const [open, setOpen] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [inIds, setInIds] = useState([]);
  const [newName, setNewName] = useState('');
  const ref = useRef(null);

  function refresh() {
    setTracks(getTracks());
    setInIds(getTracksForItem(itemType, itemId));
  }

  useEffect(() => {
    if (!open) return;
    refresh();
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const saved = getTracksForItem(itemType, itemId).length > 0;

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        title={saved ? 'Saved to a track' : 'Save to a track'}
        style={{
          width: 26, height: 26, borderRadius: 7, cursor: 'pointer', lineHeight: 1,
          background: saved ? 'var(--accent-bg)' : 'var(--surface-2)',
          border: `1px solid ${saved ? 'var(--accent-border)' : 'var(--border)'}`,
          color: saved ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700,
        }}
      >{saved ? '✓' : '+'}</button>

      {open && (
        <div className="mo-pop" style={{
          position: 'absolute', zIndex: 60, right: 0, top: 30, width: 230,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
          boxShadow: 'var(--shadow-md, 0 10px 28px rgba(0,0,0,0.18))', padding: '0.4rem',
        }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-dim)', padding: '0.25rem 0.5rem' }}>
            Save to track
          </div>
          {tracks.length === 0 && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0.3rem 0.5rem' }}>No tracks yet — create one below.</div>
          )}
          {tracks.map(t => {
            const inTrack = inIds.includes(t.id);
            return (
              <button key={t.id}
                onClick={() => { inTrack ? removeGenericFromTrack(t.id, itemType, itemId) : addItem(t.id, itemType, itemId, label, itemMeta); refresh(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.45rem', width: '100%', textAlign: 'left',
                  background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6,
                  padding: '0.32rem 0.5rem', fontSize: '0.78rem', color: inTrack ? 'var(--accent)' : 'var(--text)',
                }}
              >
                <span style={{ width: 14, flexShrink: 0, fontWeight: 700 }}>{inTrack ? '✓' : ''}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{t.items.length}</span>
              </button>
            );
          })}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newName.trim()) return;
              const t = createTrack(newName.trim());
              addItem(t.id, itemType, itemId, label, itemMeta);
              setNewName(''); refresh();
            }}
            style={{ display: 'flex', gap: '0.3rem', padding: '0.35rem 0.4rem 0.15rem', borderTop: '1px solid var(--border)', marginTop: '0.25rem' }}
          >
            <input
              value={newName} onChange={e => setNewName(e.target.value)} placeholder="New track…"
              style={{ flex: 1, minWidth: 0, fontSize: '0.75rem', padding: '0.28rem 0.45rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', outline: 'none' }}
            />
            <button type="submit" disabled={!newName.trim()}
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '0.28rem 0.55rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, opacity: newName.trim() ? 1 : 0.4 }}>
              +
            </button>
          </form>
        </div>
      )}
    </span>
  );
}
