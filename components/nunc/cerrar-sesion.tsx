"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function CerrarSesionNunc({ codigo }: { codigo: string }) {
  const [cerrando, setCerrando] = useState(false)
  const router = useRouter()

  async function cerrar() {
    setCerrando(true)
    try {
      const res = await fetch("/api/nunc/cerrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success("Sesión cerrada")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cerrar")
    } finally {
      setCerrando(false)
    }
  }

  return (
    <Button variant="destructive" onClick={cerrar} disabled={cerrando} className="w-full">
      {cerrando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
      {cerrando ? "Cerrando..." : "Cerrar sesión"}
    </Button>
  )
}
