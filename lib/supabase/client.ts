import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Desactivar el auto-refresh interno de Supabase.
        // El token solo se refresca cuando hay actividad real del usuario
        // via refreshTokenIfNeeded() en session-provider.tsx.
        // Con autoRefreshToken: true (default), el token se renueva silenciosamente
        // cada ~55 min aunque el usuario lleve días sin tocar la pantalla.
        autoRefreshToken: false,
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-web'
        }
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    }
  )
}
