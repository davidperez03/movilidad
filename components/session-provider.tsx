"use client"

import { useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface SessionProviderProps {
  children: React.ReactNode
  autoRefreshInterval?: number // en segundos, default 20
  inactivityTimeout?: number // en minutos, default 10
}

export function SessionProvider({
  children,
  autoRefreshInterval = 20,
  inactivityTimeout = 1
}: SessionProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const lastActivityRef = useRef<number>(Date.now())
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Rutas públicas que no necesitan auto-refresh ni timeout
  const publicRoutes = ["/auth/login", "/auth/sign-up", "/consulta", "/auth/error"]
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route))

  // Actualizar última actividad
  const updateActivity = () => {
    lastActivityRef.current = Date.now()
  }

  // Verificar inactividad
  const checkInactivity = async () => {
    const now = Date.now()
    const inactivityMs = inactivityTimeout * 60 * 1000 // convertir minutos a ms
    const timeSinceLastActivity = now - lastActivityRef.current

    if (timeSinceLastActivity > inactivityMs) {
      // Limpiar timers
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current)
      }
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current)
      }

      // Cerrar sesión
      await supabase.auth.signOut()

      // Redirigir al login
      router.push("/auth/login?timeout=true")
      router.refresh()
    }
  }

  // Auto-refresh de la página
  const setupAutoRefresh = () => {
    if (autoRefreshTimerRef.current) {
      clearInterval(autoRefreshTimerRef.current)
    }

    autoRefreshTimerRef.current = setInterval(() => {
      if (!isPublicRoute) {
        router.refresh()
      }
    }, autoRefreshInterval * 1000)
  }

  // Configurar timer de inactividad
  const setupInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearInterval(inactivityTimerRef.current)
    }

    // Verificar inactividad cada 10 segundos (más frecuente para ser más preciso)
    inactivityTimerRef.current = setInterval(() => {
      if (!isPublicRoute) {
        checkInactivity()
      }
    }, 10000) // 10 segundos
  }

  useEffect(() => {
    // Solo aplicar en rutas privadas
    if (isPublicRoute) {
      return
    }

    // Eventos para detectar actividad del usuario
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ]

    // Agregar listeners
    events.forEach((event) => {
      document.addEventListener(event, updateActivity, true)
    })

    // Configurar auto-refresh
    setupAutoRefresh()

    // Configurar timer de inactividad
    setupInactivityTimer()

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
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity, true)
      })

      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current)
      }

      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current)
      }
    }
  }, [pathname, isPublicRoute])

  // Escuchar cambios de estado de autenticación
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" && !isPublicRoute) {
        router.push("/auth/login")
      }

      if (event === "SIGNED_IN") {
        updateActivity()
      }

      // Refrescar la página cuando hay cambios
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
