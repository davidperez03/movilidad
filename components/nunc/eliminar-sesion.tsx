"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function EliminarSesionNunc({ sesionId }: { sesionId: string }) {
  const [confirmando, setConfirmando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const router = useRouter()

  async function eliminar() {
    setEliminando(true)
    try {
      const res = await fetch(`/api/nunc/sesion/${sesionId}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success("Sesión eliminada")
      router.push("/nunc")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar")
      setEliminando(false)
    }
  }

  if (confirmando) {
    return (
      <div className="flex gap-2">
        <Button variant="destructive" size="sm" onClick={eliminar} disabled={eliminando}>
          {eliminando ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}
          {eliminando ? "Eliminando..." : "Sí, eliminar sesión"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setConfirmando(false)} disabled={eliminando}>
          Cancelar
        </Button>
      </div>
    )
  }

  return (
    <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setConfirmando(true)}>
      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
      Eliminar sesión
    </Button>
  )
}
