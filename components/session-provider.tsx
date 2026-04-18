"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SessionManager } from "@/lib/session-manager"
import { SESSION_CONFIG } from "@/lib/config/session"
import { toast } from "sonner"

interface SessionProviderProps {
  children: React.ReactNode
}

/**
 * Proveedor de Sesión Centralizado
 *
 * Funcionalidades:
 * - Detecta inactividad del usuario y cierra sesión automáticamente
 * - Refresca el token de Supabase mientras hay actividad
 * - Muestra advertencias antes del cierre de sesión
 * - Verifica el estado de la sesión
 *
 * Configuración: /lib/config/session.ts
 */
export function SessionProvider({ children }: SessionProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const lastActivityRef = useRef<number>(Date.now())
  const lastUpdateRef = useRef<number>(0) // 0 para permitir primera ejecución
  const lastTokenRefreshRef = useRef<number>(0) // Para tracking de refresh del token
  const lastDbActivityUpdateRef = useRef<number>(0) // Para tracking de actualización en BD
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null)
  const sessionInitializedRef = useRef<boolean>(false)

  // Rutas públicas que no necesitan gestión de sesión
  const isPublicRoute = pathname?.startsWith("/auth") || pathname?.startsWith("/consulta") || pathname === "/"

  // Timeout según el tipo de dispositivo detectado
  const getInactivityTimeout = (): number => {
    if (typeof navigator === 'undefined') return SESSION_CONFIG.INACTIVITY_TIMEOUT_WEB
    const device = SessionManager.detectarDispositivo()
    if (device === 'mobile') return SESSION_CONFIG.INACTIVITY_TIMEOUT_MOBILE
    if (device === 'tablet') return SESSION_CONFIG.INACTIVITY_TIMEOUT_TABLET
    return SESSION_CONFIG.INACTIVITY_TIMEOUT_WEB
  }

  // Refrescar token de Supabase
  const refreshToken = async () => {
    try {
      await supabase.auth.refreshSession()
    } catch (error) {
    }
  }

  // Actualizar última actividad y resetear timers
  const updateActivity = (event?: Event) => {
    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdateRef.current

    // Throttle: solo actualizar si han pasado al menos N ms
    if (timeSinceLastUpdate < SESSION_CONFIG.ACTIVITY_THROTTLE) {
      return
    }


    lastActivityRef.current = now
    lastUpdateRef.current = now

    // Refrescar token si es necesario cuando hay actividad
    refreshTokenIfNeeded()

    // Actualizar última actividad en BD cada 1 minuto
    const timeSinceLastDbUpdate = now - lastDbActivityUpdateRef.current
    if (timeSinceLastDbUpdate >= 60000) { // 1 minuto
      SessionManager.actualizarActividad()
      lastDbActivityUpdateRef.current = now
    }

    // Limpiar timers anteriores
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
    }

    const timeout = getInactivityTimeout()

    // Configurar timer de advertencia (si está habilitado)
    if (SESSION_CONFIG.WARNING_BEFORE_TIMEOUT) {
      const warningTime = timeout - SESSION_CONFIG.WARNING_BEFORE_TIMEOUT

      warningTimerRef.current = setTimeout(() => {
        toast.warning(
          `Tu sesión se cerrará en ${SESSION_CONFIG.WARNING_BEFORE_TIMEOUT / 1000} segundos por inactividad. Haz click en cualquier lugar para continuar.`,
          { duration: SESSION_CONFIG.WARNING_BEFORE_TIMEOUT }
        )
      }, warningTime)
    }

    // Configurar timer de inactividad
    inactivityTimerRef.current = setTimeout(async () => {
      toast.error(SESSION_CONFIG.TIMEOUT_MESSAGE)

      // Registrar cierre en BD primero — auth.uid() aún válido
      await SessionManager.registrarFin('expirada')

      // Cerrar sesión de Supabase
      await supabase.auth.signOut()

      // Hard navigation para evitar que el listener SIGNED_OUT sobreescriba el reason
      window.location.href = "/auth/login?reason=inactivity"
    }, timeout)
  }

  // Refrescar token cuando hay actividad (no automáticamente)
  const refreshTokenIfNeeded = async () => {
    const now = Date.now()
    const timeSinceLastRefresh = now - lastTokenRefreshRef.current

    // Solo refrescar si han pasado más de 30 segundos desde el último refresh
    if (timeSinceLastRefresh >= SESSION_CONFIG.TOKEN_REFRESH_INTERVAL) {
      await refreshToken()
      lastTokenRefreshRef.current = now
    }
  }

  useEffect(() => {
    // Solo aplicar en rutas privadas
    if (isPublicRoute) {
      return
    }

    // No hacer nada si está deshabilitado
    if (!SESSION_CONFIG.ENABLE_INACTIVITY_TIMEOUT) {
      return
    }

    // Agregar listeners de actividad
    const activityHandler = (event: Event) => {
      updateActivity(event)
    }

    SESSION_CONFIG.ACTIVITY_EVENTS.forEach((eventName) => {
      document.addEventListener(eventName, activityHandler, { passive: true })
    })

    // Verificar inactividad real al volver al tab.
    // Los browsers congelan setTimeout en tabs de fondo, por lo que el timer
    // de 5 minutos nunca dispara si el usuario deja el tab en background.
    // Con visibilitychange calculamos el tiempo transcurrido real contra
    // lastActivityRef y forzamos el cierre si corresponde.
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return

      const timeout = getInactivityTimeout()
      const elapsed = Date.now() - lastActivityRef.current

      if (elapsed >= timeout) {
        // El tiempo de inactividad se cumplió mientras el tab estaba oculto
        await SessionManager.registrarFin('expirada')
        await supabase.auth.signOut()
        window.location.href = '/auth/login?reason=inactivity'
        return
      }

      // Tab vuelve antes del timeout: recalcular el tiempo restante y
      // resetear los timers con el tiempo que realmente queda.
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)

      const remaining = timeout - elapsed

      if (SESSION_CONFIG.WARNING_BEFORE_TIMEOUT) {
        const warningRemaining = remaining - SESSION_CONFIG.WARNING_BEFORE_TIMEOUT
        if (warningRemaining > 0) {
          warningTimerRef.current = setTimeout(() => {
            toast.warning(
              `Tu sesión se cerrará en ${SESSION_CONFIG.WARNING_BEFORE_TIMEOUT / 1000} segundos por inactividad. Haz click en cualquier lugar para continuar.`,
              { duration: SESSION_CONFIG.WARNING_BEFORE_TIMEOUT }
            )
          }, warningRemaining)
        }
      }

      inactivityTimerRef.current = setTimeout(async () => {
        toast.error(SESSION_CONFIG.TIMEOUT_MESSAGE)
        await SessionManager.registrarFin('expirada')
        await supabase.auth.signOut()
        window.location.href = '/auth/login?reason=inactivity'
      }, remaining)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cerrar sesión en BD cuando el usuario cierra la pestaña/browser.
    // - beforeunload: desktop y Android Chrome
    // - pagehide: iOS Safari (beforeunload no es confiable en iOS).
    //   IMPORTANTE: pagehide se dispara también al entrar al bfcache (persisted=true),
    //   p.ej. al minimizar la app o cambiar de tab. En ese caso NO debemos cerrar la
    //   sesión — solo cuando persisted=false (unload real).
    const handlePageClose = (event: PageTransitionEvent | Event) => {
      if ('persisted' in event && (event as PageTransitionEvent).persisted) return
      const sessionId = SessionManager.getSessionId()
      if (sessionId) {
        navigator.sendBeacon('/api/close-session', JSON.stringify({ sessionId }))
        // Limpiar sessionStorage para forzar nueva sesión al volver
        sessionStorage.removeItem('current_session_id')
        sessionInitializedRef.current = false
      }
    }
    window.addEventListener('beforeunload', handlePageClose)
    window.addEventListener('pagehide', handlePageClose)

    // Iniciar timers
    updateActivity()

    // Verificar sesión al montar contra el servidor (getUser valida el token,
    // getSession solo lee del caché local y no detecta tokens expirados)
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Antes de crear sesión nueva, verificar si el admin forzó un cierre
      // después del último login. Crítico en móvil: sessionStorage se limpia
      // al cerrar el browser, pero el JWT sigue válido y sin esta verificación
      // el provider crearía una sesión nueva saltándose el cierre forzado.
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
          window.location.href = '/auth/login?reason=session_closed'
          return
        }
      }

      const sessionId = SessionManager.getSessionId()

      if (!sessionId) {
        // Sin sesión en cliente: crear una nueva (login reciente, pestaña nueva, etc.)
        await SessionManager.registrarInicio(user.id)
        sessionInitializedRef.current = true
        return
      }

      // Si ya inicializamos en este montado, no volver a verificar en cada
      // cambio de ruta — evita crear sesiones duplicadas en navegación en móvil.
      if (sessionInitializedRef.current) return
      sessionInitializedRef.current = true

      // Primera vez en este montado con sessionId existente:
      // verificar que siga activa en BD (caso Ctrl+Shift+T con sessionStorage restaurado).
      // Solo crear nueva sesión si la BD confirma que está cerrada ('inactive').
      // Un error de red ('error') no es conclusivo — conservar la sesión existente.
      const estadoBD = await SessionManager.actualizarActividad()
      if (estadoBD === 'inactive') {
        SessionManager.clearSessionId()
        await SessionManager.registrarInicio(user.id)
      }
    }
    checkSession()

    // Cleanup
    return () => {
      SESSION_CONFIG.ACTIVITY_EVENTS.forEach((eventName) => {
        document.removeEventListener(eventName, activityHandler)
      })

      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handlePageClose)
      window.removeEventListener('pagehide', handlePageClose)

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current)
      }
    }
  }, [pathname, isPublicRoute])

  // Escuchar cambios de estado de autenticación
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && !isPublicRoute) {
        // Fallback para expiraciones inesperadas de token del lado de Supabase.
        // Los flujos normales (logout manual, inactividad) ya llamaron registrarFin()
        // antes de signOut() y usaron window.location.href para navegar.
        router.push("/auth/login")
      }

      // Solo resetear timer cuando el usuario inicia sesión manualmente en rutas privadas
      if (event === "SIGNED_IN" && !isPublicRoute) {
        updateActivity()
      }

      // NO resetear timer cuando se refresca el token automáticamente
      // El refresh mantiene la sesión válida pero NO cuenta como actividad del usuario
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, isPublicRoute])


  return <>{children}</>
}
