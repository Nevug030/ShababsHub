import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Return null if environment variables are not set (graceful degradation)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not set. Server client will not be available.')
    return null
  }

  // For server-side usage with cookies (for future use with authentication)
  // Currently returns a basic client since we're using static export
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Alternative server client factory for Route Handlers/Server Actions
export function createServerClient() {
  // This would typically use cookies for session management
  // For now, return the basic client
  return createClient()
}
