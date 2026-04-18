import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  // CSP en modo Report-Only: monitorear violaciones sin bloquear (Ola 4).
  // Cambiar a Content-Security-Policy para enforcement después de validar 24h en producción.
  'Content-Security-Policy-Report-Only': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
  ].join('; '),
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
  return response
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const publicRoutes = ["/", "/consulta"]
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)
  const isPublicApi = request.nextUrl.pathname.startsWith("/api/consulta")
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth") || request.nextUrl.pathname.startsWith("/api/auth")
  const isApiRoute  = request.nextUrl.pathname.startsWith("/api/")
  const isProtected = !isPublicRoute && !isPublicApi && !isAuthRoute

  // Fail-closed: si getUser() falla en rutas protegidas, redirigir a login
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch {
    if (isProtected) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return applySecurityHeaders(NextResponse.redirect(url))
    }
  }

  if (user && isProtected && !isApiRoute) {
    // Verificar sys_sesiones para detectar cierres forzados por admin.
    // Solo bloqueamos si hay evidencia de cierre forzado DESPUÉS del último login.
    // No bloqueamos por ausencia de sesión (puede ser login fresco o registrarInicio pendiente).
    try {
      const { data: sesion } = await supabase
        .from('sys_sesiones')
        .select('id, ultima_actividad')
        .eq('usuario_id', user.id)
        .eq('estado', 'activa')
        .order('inicio_sesion', { ascending: false })
        .limit(1)
        .maybeSingle()

      const buildLogoutRedirect = (reason: string) => {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        url.searchParams.set('reason', reason)
        const response = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
          response.cookies.set({ name, value, ...options })
        })
        return applySecurityHeaders(response)
      }

      if (!sesion) {
        // Sin sesión activa. Solo cerrar si el admin forzó el cierre DESPUÉS del último login.
        // Si no hay evidencia de cierre forzado, es un login fresco: permitir el paso.
        const lastSignIn = user.last_sign_in_at
        if (lastSignIn) {
          const { data: forcedClose } = await supabase
            .from('sys_sesiones')
            .select('id')
            .eq('usuario_id', user.id)
            .eq('estado', 'forzada_cierre')
            .gte('fin_sesion', lastSignIn)
            .limit(1)
            .maybeSingle()

          if (forcedClose) {
            await supabase.auth.signOut()
            return buildLogoutRedirect('session_closed')
          }
        }
        // Sin cierre forzado post-login → login fresco o registrarInicio pendiente.
        // Permitir el paso; SessionManager registrará la sesión en cliente.
      }
    } catch {
      // Error de BD: no bloquear a usuarios autenticados válidos.
      // La identidad ya fue verificada por getUser() arriba.
    }
  }

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return applySecurityHeaders(NextResponse.redirect(url))
  }

  return applySecurityHeaders(supabaseResponse)
}
