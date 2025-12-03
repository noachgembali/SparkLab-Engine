// Corrected Supabase Client
// This file is safe to edit – fixed to use correct environment variables

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Load environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Safety checks (helps debugging)
if (!SUPABASE_URL) {
  throw new Error("Missing VITE_SUPABASE_URL. Check your .env.local file.");
}

if (!SUPABASE_ANON_KEY) {
  throw new Error("Missing VITE_SUPABASE_ANON_KEY. Check your .env.local file.");
}

// Create client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
