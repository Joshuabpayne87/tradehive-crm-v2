import { createBrowserClient } from '@supabase/ssr'

let _client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return cached client if available
  if (_client) {
    return _client
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // Don't throw during build - return a mock client that will fail gracefully at runtime
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables - using placeholder client')
    // Return a client with placeholder values - it will fail at runtime but won't break the build
    _client = createBrowserClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key'
    )
    return _client
  }

  _client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return _client
}

