// src/pages/MyTracksPage.jsx — the family My Tracks room, PL edition (skeleton
// wave, 2026-07-16): tracks sidebar, S/A/B tier seeding from the PyLab bank,
// rich block notes (full family NoteEditor), deep-linked item rows.
import { useState, useEffect } from 'react';
import {
  getTracks, createTrack, renameTrack, deleteTrack, removeItem,
  createNote, deleteNoteById, seedTierTracks,
} from '../utils/tracks.js';
import { NoteEditor } from '../components/tracks/NoteEditor.jsx';
import { Icon } from '../components/shared/Icon.jsx';

const TYPE_LABEL = { pylab: 'PyLab', gotcha: 'Gotcha', know: 'Know', note: 'Note' };
const TYPE_HASH = { pylab: '#/pylab/', gotcha: '#/gotchas/' };
const NOTE_TEXTISH = ['text', 'h1', 'h2', 'h3', 'bullet', 'numbered', 'todo', 'quote', 'callout'];

function notePreview(note) {
  const b = (note.blocks || []).find(x => NOTE_TEXTISH.includes(x.type) && x.content?.trim());
  return b ? b.content.replace(/[*~=`#>]/g, '').slice(0, 90) : '';
}

export function MyTracksPage() {
  const [tracks, setTracks] = useState(() => getTracks());
  const [selectedId, setSelectedId] = useState(() => getTracks()[0]?.id || null);
  const [openNote, setOpenNote] = useState(null); // { trackId, noteId }
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  const refresh = () => setTracks(getTracks());
  useEffect(() => {
    window.addEventListener('pl_tracks', refresh);
    return () => window.removeEventListener('pl_tracks', refresh);
  }, []);

  const track = tracks.find(t => t.id === selectedId) || null;
  const liveNote = openNote
    ? (tracks.find(t => t.id === openNote.trackId)?.items.find(i => i.type === 'note' && i.id === openNote.noteId) || null)
    : null;

  return (
    <div className="pal-page-enter">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Icon name="file-text" size={18} color="var(--accent)" />
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>My Tracks</h1>
      </div>

      <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--surface)', minHeight: 'calc(100vh - 220px)' }}>
        {/* Sidebar */}
        <div style={{ width: 230, flexShrink: 0, borderRight: '1px solid var(--border)', padding: '0.9rem 0.6rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.4rem', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-dim)' }}>My Tracks</span>
            <button onClick={() => setCreating(true)} title="New track"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '1.05rem', lineHeight: 1 }}>+</button>
          </div>

          <button
            onClick={() => {
              if (!window.confirm('Build the S / A / B tier tracks from the PyLab bank (by seniority level)? Existing S/A/B tracks are rebuilt.')) return;
              const res = seedTierTracks();
              refresh();
              const s = getTracks().find(t => t.name === 'S Tier');
              if (s) setSelectedId(s.id);
              window.alert(res.map(r => `${r.name}: ${r.count}`).join(' · '));
            }}
            style={{ width: '100%', margin: '0 0 0.6rem', padding: '0.38rem 0.5rem', borderRadius: 8, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', color: 'var(--accent)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
          >Build S / A / B tier tracks</button>

          {creating && (
            <form onSubmit={(e) => { e.preventDefault(); if (!newName.trim()) return; const t = createTrack(newName); refresh(); setSelectedId(t.id); setNewName(''); setCreating(false); }}
              style={{ display: 'flex', gap: '0.3rem', padding: '0 0.2rem', marginBottom: '0.5rem' }}>
              <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="Track name…"
                onKeyDown={e => { if (e.key === 'Escape') { setCreating(false); setNewName(''); } }}
                style={{ flex: 1, minWidth: 0, fontSize: '0.75rem', padding: '0.3rem 0.45rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', outline: 'none' }} />
              <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '0.3rem 0.5rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>Add</button>
            </form>
          )}

          {tracks.length === 0 && !creating && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0 0.4rem', lineHeight: 1.5 }}>
              No tracks yet. Hit + to create one, then use the + buttons across the lab to save problems here.
            </p>
          )}

          {tracks.map(t => (
            <div key={t.id} onClick={() => { setOpenNote(null); setSelectedId(t.id); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.42rem 0.55rem', borderRadius: 8, cursor: 'pointer', marginBottom: 2,
                background: t.id === selectedId ? 'var(--accent-bg)' : 'transparent',
                border: `1px solid ${t.id === selectedId ? 'var(--accent-border)' : 'transparent'}`,
              }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: '0.8rem', fontWeight: t.id === selectedId ? 700 : 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
              <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', flexShrink: 0 }}>{t.items.length}</span>
            </div>
          ))}
        </div>

        {/* Detail / editor */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {openNote && liveNote ? (
            <NoteEditor key={liveNote.id} trackId={openNote.trackId} note={liveNote} onBack={() => { refresh(); setOpenNote(null); }} />
          ) : track ? (
            <div style={{ padding: '1.1rem 1.3rem', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {renaming ? (
                  <form onSubmit={(e) => { e.preventDefault(); renameTrack(track.id, nameDraft); refresh(); setRenaming(false); }}>
                    <input autoFocus value={nameDraft} onChange={e => setNameDraft(e.target.value)}
                      onBlur={() => { renameTrack(track.id, nameDraft); refresh(); setRenaming(false); }}
                      onKeyDown={e => { if (e.key === 'Escape') setRenaming(false); }}
                      style={{ fontSize: '1.05rem', fontWeight: 800, background: 'var(--surface-2)', border: '1px solid var(--accent)', borderRadius: 6, padding: '0.15rem 0.45rem', color: 'var(--text)', outline: 'none' }} />
                  </form>
                ) : (
                  <>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>{track.name}</h2>
                    <button onClick={() => { setNameDraft(track.name); setRenaming(true); }} title="Rename"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: '0.75rem' }}>✎</button>
                  </>
                )}
                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{track.items.length} item{track.items.length !== 1 ? 's' : ''}</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.45rem' }}>
                  <button onClick={() => { const n = createNote(track.id, ''); refresh(); if (n) setOpenNote({ trackId: track.id, noteId: n.id }); }}
                    className="pal-btn-primary" style={{ padding: '0.32rem 0.75rem', fontSize: '0.75rem' }}>+ New Note</button>
                  <button onClick={() => { if (!window.confirm('Delete this track? This cannot be undone.')) return; deleteTrack(track.id); refresh(); setSelectedId(getTracks()[0]?.id || null); }}
                    style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}>Delete</button>
                </div>
              </div>

              {track.items.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  This track is empty. Use the + button on any PyLab problem or Know module to save it here, or create a note above.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {track.items.map((item, idx) => (
                    <div key={idx} className="mo-rise" style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.6rem 0.75rem',
                      borderRadius: 9, background: 'var(--surface-2)', border: '1px solid var(--border)',
                      borderLeft: item.type === 'note' ? '3px solid var(--accent)' : '1px solid var(--border)',
                      animationDelay: `${Math.min(idx, 10) * 25}ms`,
                    }}>
                      <div style={{ flex: 1, minWidth: 0, cursor: item.type === 'note' ? 'pointer' : 'default' }}
                        onClick={() => { if (item.type === 'note') setOpenNote({ trackId: track.id, noteId: item.id }); }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 2, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.58rem', fontWeight: 800, color: 'var(--accent)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 4, padding: '0.05rem 0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {item.type === 'note' ? '📝 Note' : TYPE_LABEL[item.type] || item.type}
                          </span>
                          {item.meta?.topic && <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{item.meta.topic}</span>}
                          {item.meta?.tier && <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>tier {item.meta.tier}</span>}
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.35 }}>
                          {item.type === 'note' ? (item.title || 'Untitled note') : (item.label || item.itemId)}
                        </div>
                        {item.type === 'note' && notePreview(item) && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notePreview(item)}</div>
                        )}
                      </div>
                      {item.type === 'note' ? (
                        <button onClick={() => setOpenNote({ trackId: track.id, noteId: item.id })}
                          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.7rem', padding: '0.2rem 0.5rem', flexShrink: 0 }}>Open →</button>
                      ) : TYPE_HASH[item.type] ? (
                        <button onClick={() => { window.location.hash = TYPE_HASH[item.type] + item.itemId; }}
                          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.7rem', padding: '0.2rem 0.5rem', flexShrink: 0 }}>Open →</button>
                      ) : null}
                      <button onClick={() => {
                        if (item.type === 'note') { if (!window.confirm('Delete this note?')) return; deleteNoteById(track.id, item.id); }
                        else removeItem(track.id, idx);
                        refresh();
                      }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: '0.72rem', flexShrink: 0, padding: '0.1rem 0.2rem' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              {tracks.length === 0 ? 'Create a track to get started.' : 'Select a track.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
