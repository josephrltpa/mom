/**
 * Supabase Client Configuration
 * 
 * This module initializes Supabase when credentials are available.
 * Falls back gracefully when not configured (uses localStorage instead).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project'));

// Create Supabase client only if configured
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  : null;

// Helper to check connection status
export async function checkSupabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  if (!supabase) {
    return { connected: false, error: 'Not configured' };
  }
  
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      return { connected: false, error: error.message };
    }
    return { connected: true };
  } catch (err) {
    return { connected: false, error: String(err) };
  }
}
