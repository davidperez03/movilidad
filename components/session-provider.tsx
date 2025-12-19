"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
  const tokenRefreshTimerRef = useRef<NodeJS.Timeout | null>(null)
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
      console.error("Error al refrescar token:", error)
    }
  }

  // Actualizar última actividad y resetear timers
  const updateActivity = () => {
    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdateRef.current

    // Throttle: solo actualizar si han pasado al menos N ms
    if (timeSinceLastUpdate < SESSION_CONFIG.ACTIVITY_THROTTLE) {
      return
    }

    lastActivityRef.current = now
    lastUpdateRef.current = now

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
          `Tu sesión se cerrará en ${SESSION_CONFIG.WARNING_BEFORE_TIMEOUT / 1000} segundos por inactividad. Mueve el mouse para continuar.`,
          { duration: SESSION_CONFIG.WARNING_BEFORE_TIMEOUT }
        )
      }, warningTime)
    }

    // Configurar timer de inactividad
    inactivityTimerRef.current = setTimeout(async () => {
      toast.error(SESSION_CONFIG.TIMEOUT_MESSAGE)
      await supabase.auth.signOut()
      router.push("/auth/login?reason=inactivity")
    }, SESSION_CONFIG.INACTIVITY_TIMEOUT)
  }

  // Configurar refresh automático del token
  const setupTokenRefresh = () => {
    if (tokenRefreshTimerRef.current) {
      clearInterval(tokenRefreshTimerRef.current)
    }

    tokenRefreshTimerRef.current = setInterval(() => {
      if (!isPublicRoute) {
        refreshToken()
      }
    }, SESSION_CONFIG.TOKEN_REFRESH_INTERVAL)
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
    SESSION_CONFIG.ACTIVITY_EVENTS.forEach((event) => {
      document.addEventListener(event, updateActivity, { passive: true })
    })

    // Iniciar timers
    updateActivity()
    setupTokenRefresh()

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
      SESSION_CONFIG.ACTIVITY_EVENTS.forEach((event) => {
        document.removeEventListener(event, updateActivity)
      })

      if (tokenRefreshTimerRef.current) {
        clearInterval(tokenRefreshTimerRef.current)
      }
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
        router.push("/auth/login")
      }

      if (event === "SIGNED_IN") {
        updateActivity()
      }

      if (event === "TOKEN_REFRESHED") {
        updateActivity()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, isPublicRoute])

  return <>{children}</>
}
