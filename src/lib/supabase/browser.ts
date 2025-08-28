import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Return null if environment variables are not set (graceful degradation)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not set. Client will not be available.')
    return null
  }

  // Create a supabase client on the browser with project's credentials
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Default client instance for browser use (can be null)
export const supabase = createClient()
