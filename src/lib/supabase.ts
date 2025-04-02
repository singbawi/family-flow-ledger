
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Default values for development - replace these with your actual Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create a mock client if credentials are missing
const isMissingCredentials = supabaseUrl === 'https://your-project.supabase.co' || supabaseKey === 'your-anon-key';

if (isMissingCredentials) {
  console.warn('Using mock Supabase client. Please set your Supabase credentials in .env.local file.');
  console.warn('Add these two lines to your .env.local:');
  console.warn('VITE_SUPABASE_URL=your_supabase_project_url');
  console.warn('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
}

// Create the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
