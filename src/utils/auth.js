// Auth helpers — thin wrappers over Supabase auth. All are no-ops (return an
// error object) when Supabase isn't configured, so the app runs fine offline.
import { supabase } from './supabase.js';

export async function signInWithGoogle() {
  if (!supabase) return { error: 'Supabase not configured' };
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
}

export async function signInWithGitHub() {
  if (!supabase) return { error: 'Supabase not configured' };
  return supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: window.location.origin },
  });
}

export async function signOut() {
  if (!supabase) return { error: 'Supabase not configured' };
  return supabase.auth.signOut();
}

export async function getUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

export function onAuthStateChange(callback) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
}
