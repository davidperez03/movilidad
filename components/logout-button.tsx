"use client"

import { createClient } from "@/lib/supabase/client"
import { SessionManager } from "@/lib/session-manager"
import { invalidarCachePermisos } from "@/lib/auth/permissions-queries"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface BotonCerrarSesionProps {
  className?: string
}

export function BotonCerrarSesion({ className }: BotonCerrarSesionProps) {
  const [estaCargando, setEstaCargando] = useState(false)

  const manejarCerrarSesion = async () => {
    setEstaCargando(true)
    await SessionManager.registrarFin('cerrada')
    invalidarCachePermisos()
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={manejarCerrarSesion}
      disabled={estaCargando}
      className={className}
    >
      {estaCargando ? "Saliendo..." : "Cerrar Sesión"}
    </Button>
  )
}
