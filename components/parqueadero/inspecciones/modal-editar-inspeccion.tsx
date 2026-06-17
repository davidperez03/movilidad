"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Props {
  id:      string
  inicial: {
    fecha:         string
    hora:          string
    turno:         string | null
    km_inicio:     number | null
    observaciones: string | null
    es_apto:       boolean
  }
}

export function ModalEditarInspeccion({ id, inicial }: Props) {
  const router  = useRouter()
  const [open, setOpen]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm]     = useState({
    fecha:         inicial.fecha,
    hora:          inicial.hora,
    turno:         inicial.turno ?? "diurno",
    km_inicio:     inicial.km_inicio?.toString() ?? "",
    observaciones: inicial.observaciones ?? "",
    es_apto:       inicial.es_apto,
  })

  const guardar = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/parqueadero/inspecciones/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          fecha:         form.fecha,
          hora:          form.hora,
          turno:         form.turno,
          km_inicio:     form.km_inicio ? Number(form.km_inicio) : null,
          observaciones: form.observaciones || null,
          es_apto:       form.es_apto,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Error al guardar"); return }
      toast.success("Inspección actualizada")
      setOpen(false)
      router.refresh()
    } catch { toast.error("Error de conexión") }
    finally { setLoading(false) }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="w-full sm:w-auto">
        <Pencil className="h-4 w-4 mr-1" />
        Editar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar inspección</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Fecha</Label>
                <Input type="date" value={form.fecha} onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Hora</Label>
                <Input type="time" value={form.hora} onChange={(e) => setForm((p) => ({ ...p, hora: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Turno</Label>
              <Select value={form.turno} onValueChange={(v) => setForm((p) => ({ ...p, turno: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="diurno">Diurno</SelectItem>
                  <SelectItem value="nocturno">Nocturno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">KM inicial</Label>
              <Input
                type="number" min={0} placeholder="Ej: 1000"
                value={form.km_inicio}
                onChange={(e) => setForm((p) => ({ ...p, km_inicio: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Observaciones</Label>
              <Textarea
                rows={3} className="resize-none"
                value={form.observaciones}
                onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">¿Vehículo apto?</Label>
              <Switch checked={form.es_apto} onCheckedChange={(v) => setForm((p) => ({ ...p, es_apto: v }))} />
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button size="sm" onClick={guardar} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
