// Supabase client singleton — returns null if env vars are not set.
// All callers must check for null before using.
//
// PL points at PAL's Supabase project: set the SAME env vars on PL's Vercel
// project as PAL uses (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Auth/identity
// is then shared with PAL; PL's scores live in their own `pl_leaderboard` table.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
