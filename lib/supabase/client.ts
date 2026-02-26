import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient> | null = null;

async function initSupabase(): Promise<SupabaseClient> {
  // Try build-time env vars first (works when Vercel builds)
  const buildUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const buildKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (buildUrl && buildKey) {
    supabaseInstance = createClient(buildUrl, buildKey);
    return supabaseInstance;
  }

  // Fallback: fetch config from API route at runtime (works when v0 builds)
  const res = await fetch('/api/supabase-config');
  const config = await res.json();

  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error(
      'Supabase environment variables are not configured. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.'
    );
  }

  supabaseInstance = createClient(config.supabaseUrl, config.supabaseAnonKey);
  return supabaseInstance;
}

export async function getSupabase(): Promise<SupabaseClient> {
  if (supabaseInstance) return supabaseInstance;
  if (!initPromise) initPromise = initSupabase();
  return initPromise;
}

// Keep backward compat — but this only works if build-time vars are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
