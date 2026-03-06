"use client"

import { createClient } from "@/lib/supabase/client"
import { SessionManager } from "@/lib/session-manager"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface BotonCerrarSesionProps {
  className?: string
}

export function BotonCerrarSesion({ className }: BotonCerrarSesionProps) {
  const [estaCargando, setEstaCargando] = useState(false)

  const manejarCerrarSesion = async () => {
    setEstaCargando(true)

    // Registrar cierre en BD primero — auth.uid() aún válido en este punto
    await SessionManager.registrarFin('cerrada')

    const supabase = createClient()
    await supabase.auth.signOut()

    // Usar window.location para forzar una recarga completa
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
