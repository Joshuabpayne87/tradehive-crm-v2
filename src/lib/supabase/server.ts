import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

let _clientCache: ReturnType<typeof createServerClient> | null = null

export async function createClient() {
  // Return cached client if available (helps avoid re-initialization)
  if (_clientCache) {
    return _clientCache
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // Don't throw during build - return a client with placeholder values
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === '' || supabaseAnonKey === '') {
    console.warn('Supabase not configured - using placeholder client')
    // Return a client that will fail gracefully at runtime
    _clientCache = createServerClient(
      'https://placeholder.supabase.co',
      'placeholder-key',
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {
            // No-op
          },
        },
      }
    )
    return _clientCache
  }

  try {
    const cookieStore = await cookies()

    _clientCache = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    return _clientCache
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    // Return placeholder client on error
    _clientCache = createServerClient(
      'https://placeholder.supabase.co',
      'placeholder-key',
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {
            // No-op
          },
        },
      }
    )
    return _clientCache
  }
}

