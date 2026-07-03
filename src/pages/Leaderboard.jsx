import { useState, useEffect } from 'react';
import { fetchLeaderboard, computeTotalSolved, upsertLeaderboardRow } from '../utils/leaderboard.js';
import { supabase } from '../utils/supabase.js';

function rankColor(rank) {
  if (rank === 1) return '#f5c518'; // gold
  if (rank === 2) return '#c0c5ce'; // silver
  if (rank === 3) return '#cd7f32'; // bronze
  return 'var(--text-muted)';
}

export function Leaderboard({ user, onSignIn }) {
  const [rows, setRows] = useState(null); // null = loading
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Push the signed-in user's latest local total first, then read the ranked board,
    // so opening the leaderboard always reflects your current progress.
    (async () => {
      if (user) { try { await upsertLeaderboardRow(user); } catch { /* ignore */ } }
      const data = await fetchLeaderboard(100);
      if (cancelled) return;
      if (data === null) setError(true);
      setRows(data || []);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const myIndex = (rows && user) ? rows.findIndex(r => r.user_id === user.id) : -1;
  const myRank = myIndex >= 0 ? myIndex + 1 : null;
  const myTotal = myIndex >= 0 ? rows[myIndex].total_solved : computeTotalSolved();

  return (
    <div className="pal-page-enter" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.025em', marginBottom: '0.35rem' }}>
          Leaderboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0, lineHeight: 1.55 }}>
          Ranked by total problems solved across every bank — KNOW, DO, BUILD, and JUDGE. Sign in to claim your spot.
        </p>
      </div>

      {/* Your standing / sign-in CTA */}
      {user ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '0.9rem 1.1rem', marginBottom: '1.25rem',
          background: 'var(--accent-bg, rgba(124,92,255,0.08))',
          border: '1px solid var(--accent-border, rgba(124,92,255,0.3))',
          borderRadius: '12px',
        }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Your standing</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>{myRank ? '#' + myRank : '—'}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rank</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>{myTotal}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Solved</div>
            </div>
          </div>
        </div>
      ) : supabase ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
          padding: '0.9rem 1.1rem', marginBottom: '1.25rem',
          background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px',
        }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            You've solved <strong style={{ color: 'var(--text)' }}>{computeTotalSolved()}</strong> so far. Sign in to put it on the board.
          </div>
          <button
            onClick={() => onSignIn && onSignIn()}
            className="pal-btn-primary"
            style={{ marginLeft: 'auto' }}
          >
            Sign in with Google
          </button>
        </div>
      ) : null}

      {/* Board */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {rows === null ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Loading the board…
          </div>
        ) : error || !supabase ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            The leaderboard isn't available right now.
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            No one's on the board yet. Solve a problem to claim the top spot.
          </div>
        ) : (
          rows.map((r, i) => {
            const rank = i + 1;
            const isMe = user && r.user_id === user.id;
            return (
              <div
                key={r.user_id}
                style={{
                  display: 'grid', gridTemplateColumns: '44px minmax(0, 1fr) auto',
                  alignItems: 'center', gap: '0.75rem',
                  padding: '0.7rem 1.1rem',
                  borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
                  background: isMe ? 'var(--accent-bg, rgba(124,92,255,0.08))' : 'transparent',
                }}
              >
                <span style={{ fontSize: rank <= 3 ? '1rem' : '0.85rem', fontWeight: 800, color: rankColor(rank), textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                  {rank}
                </span>
                <span style={{
                  fontSize: '0.9rem', fontWeight: isMe ? 700 : 500, color: 'var(--text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
                }}>
                  {r.display_name}{isMe ? ' (you)' : ''}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                  {r.total_solved}
                </span>
              </div>
            );
          })
        )}
      </div>

      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.9rem', textAlign: 'center' }}>
        Your score updates when you sign in and each time you open this page. Names come from your Google or GitHub sign-in.
      </p>
    </div>
  );
}

export default Leaderboard;
