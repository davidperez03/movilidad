"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function BotonCerrarSesion() {
  const router = useRouter()
  const [estaCargando, setEstaCargando] = useState(false)

  const manejarCerrarSesion = async () => {
    setEstaCargando(true)
    const supabase = createClient()

    await supabase.auth.signOut()

    // Redirigir al login
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={manejarCerrarSesion} disabled={estaCargando}>
      {estaCargando ? "Saliendo..." : "Cerrar Sesión"}
    </Button>
  )
}
