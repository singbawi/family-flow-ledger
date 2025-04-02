
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// These should be environment variables in a production app
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
