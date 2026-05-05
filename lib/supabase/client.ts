import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Desactivado: el token se refresca solo cuando hay actividad real (session-provider.tsx).
        // Con true (default), Supabase renueva silenciosamente cada ~55 min sin importar inactividad.
        autoRefreshToken: false,
      },
      db: { schema: 'public' },
      global: { headers: { 'X-Client-Info': 'supabase-js-web' } },
      realtime: { params: { eventsPerSecond: 10 } },
    }
  )
}
