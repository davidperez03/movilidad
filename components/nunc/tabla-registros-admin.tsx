"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface RegistroFila {
  id: string
  placa: string
  nunc_completo: string
  observaciones: string | null
  hora: string
}

export function TablaRegistrosAdmin({
  registros,
  sesionId,
  puedeEliminar,
}: {
  registros: RegistroFila[]
  sesionId: string
  puedeEliminar: boolean
}) {
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [filas, setFilas] = useState(registros)
  const router = useRouter()

  async function eliminar(registroId: string) {
    setEliminando(registroId)
    try {
      const res = await fetch(`/api/nunc/sesion/${sesionId}/registro/${registroId}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error)
      setFilas((prev) => prev.filter((r) => r.id !== registroId))
      setConfirmando(null)
      toast.success("Registro eliminado")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar")
    } finally {
      setEliminando(null)
    }
  }

  if (filas.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">Sin registros aún</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="text-left py-2 pr-4 font-medium w-8">#</th>
            <th className="text-left py-2 pr-4 font-medium">Placa</th>
            <th className="text-left py-2 pr-4 font-medium">NUNC completo</th>
            <th className="text-left py-2 pr-4 font-medium hidden md:table-cell">Observaciones</th>
            <th className="text-left py-2 font-medium hidden sm:table-cell">Hora</th>
            {puedeEliminar && <th className="text-left py-2 pl-2 font-medium w-10" />}
          </tr>
        </thead>
        <tbody>
          {filas.map((r, i) => (
            <tr key={r.id} className="border-b last:border-0">
              <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
              <td className="py-2 pr-4 font-plate font-semibold">{r.placa}</td>
              <td className="py-2 pr-4 font-mono text-xs">{r.nunc_completo}</td>
              <td className="py-2 pr-4 text-muted-foreground hidden md:table-cell">{r.observaciones || "—"}</td>
              <td className="py-2 text-muted-foreground hidden sm:table-cell">{r.hora}</td>
              {puedeEliminar && (
                <td className="py-2 pl-2">
                  {confirmando === r.id ? (
                    <div className="flex gap-1">
                      <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => eliminar(r.id)} disabled={eliminando === r.id}>
                        {eliminando === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Sí"}
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setConfirmando(null)}>No</Button>
                    </div>
                  ) : (
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setConfirmando(r.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
