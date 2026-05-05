import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// No usar variable global — en Fluid Compute cada request debe crear su propia instancia.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Ignorado si se llama desde un Server Component (middleware ya refresca la sesión).
          }
        },
      },
      db: { schema: 'public' },
      global: { headers: { 'X-Client-Info': 'supabase-js-node' } },
    }
  )
}
