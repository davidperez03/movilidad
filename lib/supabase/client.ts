import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-web'
        }
      },
      // Configurar zona horaria para todas las conexiones
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    }
  )
}
