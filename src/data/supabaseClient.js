/**
 * AURA OS — Central Supabase Client
 * 
 * Reusable Supabase client for all services.
 * SECURITY: Uses ONLY publishable/anon keys (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY).
 * NEVER import or expose service-role or secret keys in browser code.
 */

import { createClient } from '@supabase/supabase-js';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});

const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// Security guard: Ensure service-role or secret keys are NEVER used in frontend
if (supabaseAnonKey.startsWith('sb_secret_') || supabaseAnonKey.includes('service_role')) {
  throw new Error('SECURITY VIOLATION: A service-role or secret key was detected in frontend code. Only the anon/publishable key may be used in the client.');
}

export function isSupabaseConfigured() {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseAnonKey !== 'your_supabase_anon_publishable_key_here' &&
    supabaseUrl.startsWith('https://')
  );
}

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;
