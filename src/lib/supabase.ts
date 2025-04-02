
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Copy your Project URL from Supabase (from the API section in settings)
const supabaseUrl = 'https://your-supabase-project-url.supabase.co';

// Copy your anon/public key from Supabase (from the API section in settings)
const supabaseKey = 'your-supabase-anon-key';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your credentials.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
