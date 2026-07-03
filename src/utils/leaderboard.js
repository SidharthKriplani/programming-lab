// Leaderboard — ranks signed-in users by total problems/modules solved across
// every PL bank. Total is computed from local progress (localStorage), using the
// SAME per-bank `solved` set the Progress page + Sidebar counts use, so the number
// matches what the user sees in-app.
//
// PL shares PAL's Supabase project for *identity* but keeps its OWN scores in a
// separate `pl_leaderboard` table, so the two labs never clobber each other's
// total_solved. Each user only writes their own row (RLS); the board is public-read.
//
// SQL — run once in PAL's Supabase SQL editor:
//   create table if not exists pl_leaderboard (
//     user_id uuid primary key references auth.users(id) on delete cascade,
//     display_name text not null,
//     total_solved int not null default 0,
//     updated_at timestamptz default now()
//   );
//   alter table pl_leaderboard enable row level security;
//   create policy "Public read pl_leaderboard" on pl_leaderboard for select using (true);
//   create policy "Users upsert own pl row" on pl_leaderboard
//     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

import { supabase } from './supabase.js';
import { BANKS } from '../data/banks.js';
import { getProgress } from './problemProgress.js';

const TABLE = 'pl_leaderboard';

// Sum the `solved` set across every bank. All banks (incl. gotchas) store the
// same { seen, solved } shape, so getProgress() reads them uniformly.
export function computeTotalSolved() {
  let total = 0;
  for (const bank of BANKS) {
    try {
      const solved = getProgress(bank.progressKey).solved || {};
      total += Object.keys(solved).length;
    } catch { /* ignore a single bad key */ }
  }
  return total;
}

// Display name from OAuth metadata (Google/GitHub); anonymous handle otherwise.
export function getDisplayName(user) {
  if (!user) return 'Anonymous';
  const m = user.user_metadata || {};
  const name = m.full_name || m.name || m.user_name || m.preferred_username;
  if (name && String(name).trim()) return String(name).trim().slice(0, 40);
  const tail = (user.id || '').replace(/-/g, '').slice(0, 4).toUpperCase() || 'XXXX';
  return 'Coder-' + tail;
}

// Upsert the signed-in user's row. Safe no-op if Supabase/auth unavailable.
export async function upsertLeaderboardRow(user) {
  if (!supabase || !user) return;
  const row = {
    user_id: user.id,
    display_name: getDisplayName(user),
    total_solved: computeTotalSolved(),
    updated_at: new Date().toISOString(),
  };
  try {
    const { error } = await supabase.from(TABLE).upsert(row, { onConflict: 'user_id' });
    if (error) console.warn('[PL leaderboard] upsert failed:', error.message);
  } catch (e) {
    console.warn('[PL leaderboard] upsert threw:', e && e.message);
  }
}

// Fetch the top N rows, ranked by total_solved desc (ties broken by earliest update).
export async function fetchLeaderboard(limit = 100) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('user_id, display_name, total_solved')
      .order('total_solved', { ascending: false })
      .order('updated_at', { ascending: true })
      .limit(limit);
    if (error) { console.warn('[PL leaderboard] fetch failed:', error.message); return null; }
    return data || [];
  } catch (e) {
    console.warn('[PL leaderboard] fetch threw:', e && e.message);
    return null;
  }
}
