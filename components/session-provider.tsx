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

  // Rutas públicas que no necesitan gestión de sesión
  const publicRoutes = ["/auth/login", "/auth/sign-up", "/consulta", "/auth/error"]
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route))

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

    // Configurar timer de advertencia (si está habilitado)
    if (SESSION_CONFIG.WARNING_BEFORE_TIMEOUT) {
      const warningTime = SESSION_CONFIG.INACTIVITY_TIMEOUT - SESSION_CONFIG.WARNING_BEFORE_TIMEOUT

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

      // Registrar cierre de sesión en BD como "expirada"
      await SessionManager.registrarFin('expirada')

      // Cerrar sesión de Supabase
      await supabase.auth.signOut()
      router.push("/auth/login?reason=inactivity")
    }, SESSION_CONFIG.INACTIVITY_TIMEOUT)
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

    // Iniciar timers
    updateActivity()

    // Verificar sesión al montar
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth/login")
      }
    }
    checkSession()

    // Cleanup
    return () => {
      SESSION_CONFIG.ACTIVITY_EVENTS.forEach((eventName) => {
        document.removeEventListener(eventName, activityHandler)
      })

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
        // Registrar cierre de sesión en BD
        SessionManager.registrarFin('cerrada')
        router.push("/auth/login")
      }

      // Solo resetear timer cuando el usuario inicia sesión manualmente
      if (event === "SIGNED_IN") {
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
