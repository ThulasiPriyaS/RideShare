import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './apiConfig';

// We'll instantiate this later with the correct credentials
let supabaseInstance: ReturnType<typeof createClient> | null = null;

/**
 * Initializes and returns the Supabase client instance
 */
export async function initSupabase() {
  if (supabaseInstance) return supabaseInstance;
  
  try {
    const { url, key } = await getSupabaseConfig();
    supabaseInstance = createClient(url, key);
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    throw error;
  }
}

/**
 * Returns the Supabase client instance, initializing it if necessary
 */
export async function getSupabase() {
  if (!supabaseInstance) {
    return await initSupabase();
  }
  return supabaseInstance;
}