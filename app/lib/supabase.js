import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with environment variables
// These values should be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if the environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

// Create a singleton Supabase client
let supabaseInstance = null;

// Function to get the Supabase client - handles both client and server components
export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;
  
  supabaseInstance = createClient(supabaseUrl || '', supabaseAnonKey || '');
  return supabaseInstance;
}

// Export the Supabase client for direct use in client components
export const supabase = getSupabase();

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error);
  return { error: error.message || 'An error occurred with the database operation' };
};

// Example function to fetch data with error handling
export async function fetchDataWithErrorHandling(tableName, options = {}) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(options.select || '*')
      .order(options.orderBy || 'created_at', { ascending: options.ascending ?? false });
    
    if (error) {
      return handleSupabaseError(error);
    }
    
    return { data };
  } catch (error) {
    return handleSupabaseError(error);
  }
} 