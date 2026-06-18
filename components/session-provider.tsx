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

export function SessionProvider({ children }: SessionProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const lastActivityRef = useRef<number>(Date.now())
  const lastUpdateRef = useRef<number>(0)
  const lastTokenRefreshRef = useRef<number>(0)
  const lastDbActivityUpdateRef = useRef<number>(0)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null)
  const sessionInitializedRef = useRef<boolean>(false)

  const isPublicRoute = pathname?.startsWith("/auth") || pathname?.startsWith("/consulta") || pathname === "/" || pathname === "/nunc/acceso" || pathname?.startsWith("/scan") || pathname?.startsWith("/grua")

  const getInactivityTimeout = (): number => {
    if (typeof navigator === 'undefined') return SESSION_CONFIG.INACTIVITY_TIMEOUT_WEB
    const device = SessionManager.detectarDispositivo()
    if (device === 'mobile') return SESSION_CONFIG.INACTIVITY_TIMEOUT_MOBILE
    if (device === 'tablet') return SESSION_CONFIG.INACTIVITY_TIMEOUT_TABLET
    return SESSION_CONFIG.INACTIVITY_TIMEOUT_WEB
  }

  const refreshToken = async () => {
    try {
      await supabase.auth.refreshSession()
    } catch {
      // silencio intencional
    }
  }

  const refreshTokenIfNeeded = async () => {
    const now = Date.now()
    if (now - lastTokenRefreshRef.current >= SESSION_CONFIG.TOKEN_REFRESH_INTERVAL) {
      await refreshToken()
      lastTokenRefreshRef.current = now
    }
  }

  const updateActivity = (event?: Event) => {
    const now = Date.now()
    if (now - lastUpdateRef.current < SESSION_CONFIG.ACTIVITY_THROTTLE) return

    lastActivityRef.current = now
    lastUpdateRef.current = now

    refreshTokenIfNeeded()

    const timeSinceLastDbUpdate = now - lastDbActivityUpdateRef.current
    if (timeSinceLastDbUpdate >= 60000) {
      SessionManager.actualizarActividad()
      lastDbActivityUpdateRef.current = now
    }

    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    toast.dismiss('session-warning')

    const timeout = getInactivityTimeout()

    if (SESSION_CONFIG.WARNING_BEFORE_TIMEOUT) {
      warningTimerRef.current = setTimeout(() => {
        toast.warning(
          `Tu sesión se cerrará en ${SESSION_CONFIG.WARNING_BEFORE_TIMEOUT / 1000} segundos por inactividad. Haz click en cualquier lugar para continuar.`,
          { id: 'session-warning', duration: SESSION_CONFIG.WARNING_BEFORE_TIMEOUT }
        )
      }, timeout - SESSION_CONFIG.WARNING_BEFORE_TIMEOUT)
    }

    inactivityTimerRef.current = setTimeout(async () => {
      toast.error(SESSION_CONFIG.TIMEOUT_MESSAGE)
      await SessionManager.registrarFin('expirada')
      await supabase.auth.signOut()
      window.location.href = "/auth/login?reason=inactivity"
    }, timeout)
  }

  useEffect(() => {
    if (isPublicRoute || !SESSION_CONFIG.ENABLE_INACTIVITY_TIMEOUT) return

    const activityHandler = (event: Event) => updateActivity(event)
    SESSION_CONFIG.ACTIVITY_EVENTS.forEach((eventName) => {
      document.addEventListener(eventName, activityHandler, { passive: true })
    })

    // Los browsers congelan setTimeout en tabs de fondo; visibilitychange permite
    // calcular el tiempo real transcurrido y forzar el cierre si correspondía.
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return

      const timeout = getInactivityTimeout()
      const elapsed = Date.now() - lastActivityRef.current

      if (elapsed >= timeout) {
        await SessionManager.registrarFin('expirada')
        await supabase.auth.signOut()
        window.location.href = '/auth/login?reason=inactivity'
        return
      }

      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)

      const remaining = timeout - elapsed

      if (SESSION_CONFIG.WARNING_BEFORE_TIMEOUT) {
        const warningRemaining = remaining - SESSION_CONFIG.WARNING_BEFORE_TIMEOUT
        if (warningRemaining > 0) {
          warningTimerRef.current = setTimeout(() => {
            toast.warning(
              `Tu sesión se cerrará en ${SESSION_CONFIG.WARNING_BEFORE_TIMEOUT / 1000} segundos por inactividad. Haz click en cualquier lugar para continuar.`,
              { id: 'session-warning', duration: SESSION_CONFIG.WARNING_BEFORE_TIMEOUT }
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

    // beforeunload: desktop y Android Chrome.
    // pagehide: iOS Safari (beforeunload no es confiable en iOS).
    // pagehide con persisted=true = bfcache (minimizar app / cambiar tab) — NO cerrar sesión.
    const handlePageClose = (event: PageTransitionEvent | Event) => {
      if ('persisted' in event && (event as PageTransitionEvent).persisted) return
      const sessionId = SessionManager.getSessionId()
      if (sessionId) {
        navigator.sendBeacon('/api/close-session', JSON.stringify({ sessionId }))
        sessionStorage.removeItem('current_session_id')
        sessionInitializedRef.current = false
      }
    }
    window.addEventListener('beforeunload', handlePageClose)
    window.addEventListener('pagehide', handlePageClose)

    updateActivity()

    // getUser() valida el token contra el servidor; getSession() solo lee la caché local.
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Evitar que el refresh token de Supabase (~60 días) regenere sesiones bloqueadas.
      // Solo considerar cierres terminales (forzada_cierre/expirada). "cerrada" puede
      // provenir de pagehide/beforeunload en recargas y no debe expulsar al usuario.
      const lastSignIn = user.last_sign_in_at
      if (lastSignIn) {
        const { data: closedSession } = await supabase
          .from('sys_sesiones')
          .select('id, estado')
          .eq('usuario_id', user.id)
          .in('estado', ['forzada_cierre', 'expirada'])
          .gte('fin_sesion', lastSignIn)
          .order('fin_sesion', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (closedSession) {
          await supabase.auth.signOut()
          const reason = closedSession.estado === 'forzada_cierre' ? 'session_closed' : 'session_expired'
          window.location.href = `/auth/login?reason=${reason}`
          return
        }
      }

      const sessionId = SessionManager.getSessionId()

      if (!sessionId) {
        await SessionManager.registrarInicio(user.id)
        sessionInitializedRef.current = true
        return
      }

      if (sessionInitializedRef.current) return
      sessionInitializedRef.current = true

      // Caso Ctrl+Shift+T: sessionStorage restaurado pero sesión puede estar cerrada en BD.
      // Solo recrear si BD confirma inactiva; un error de red no es conclusivo (fail-open).
      const estadoBD = await SessionManager.actualizarActividad()
      if (estadoBD === 'inactive') {
        SessionManager.clearSessionId()
        await SessionManager.registrarInicio(user.id)
      }
    }
    checkSession()

    return () => {
      SESSION_CONFIG.ACTIVITY_EVENTS.forEach((eventName) => {
        document.removeEventListener(eventName, activityHandler)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handlePageClose)
      window.removeEventListener('pagehide', handlePageClose)
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    }
  }, [isPublicRoute])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && !isPublicRoute) {
        // Fallback para expiraciones inesperadas de Supabase; los flujos normales
        // ya navegaron con window.location.href antes de llegar aquí.
        router.push("/auth/login")
      }
      if (event === "SIGNED_IN" && !isPublicRoute) {
        updateActivity()
      }
    })
    return () => { subscription.unsubscribe() }
  }, [isPublicRoute])

  return <>{children}</>
}
