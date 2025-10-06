import { createClient } from '@supabase/supabase-js';

// --- Supabase Credentials ---
// Using the temporary test credentials provided by the user.
// For a production deployment, these should be replaced with your own keys.
const supabaseUrl = '';
const supabaseAnonKey = '';


export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.error(
    'CRITICAL ERROR: Supabase credentials are not configured in `src/services/supabaseClient.ts`'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export default supabase;
