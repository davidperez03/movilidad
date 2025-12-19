"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface BotonCerrarSesionProps {
  className?: string
}

export function BotonCerrarSesion({ className }: BotonCerrarSesionProps) {
  const [estaCargando, setEstaCargando] = useState(false)

  const manejarCerrarSesion = async () => {
    setEstaCargando(true)
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
