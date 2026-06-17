"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getNowDateColombia, getNowTimeColombia, localColombiaToUTC } from "@/lib/utils/date"

interface Vehiculo { id: string; placa: string; marca: string | null; modelo: string | null }

export function FormularioTurno({ vehiculos }: { vehiculos: Vehiculo[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    tipo_turno:  "diurno" as "diurno" | "nocturno",
    fecha:       getNowDateColombia(),
    vehiculo_id: "",
    hora_inicio: getNowTimeColombia().slice(0, 5), // HH:mm
  })

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.vehiculo_id) { toast.error("Seleccione un vehículo"); return }

    setLoading(true)
    try {
      const res = await fetch("/api/parqueadero/turnos", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, hora_inicio: localColombiaToUTC(`${form.fecha}T${form.hora_inicio}`) }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Error al abrir turno"); return }
      toast.success("Turno abierto")
      router.push(`/parqueadero/turnos/${data.id}`)
    } catch { toast.error("Error de conexión") }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Turno</Label>
        <Select value={form.tipo_turno} onValueChange={(v) => set("tipo_turno", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="diurno">Diurno</SelectItem>
            <SelectItem value="nocturno">Nocturno</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Fecha</Label>
        <Input type="date" value={form.fecha} onChange={(e) => set("fecha", e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label>Grúa</Label>
        <Select value={form.vehiculo_id} onValueChange={(v) => set("vehiculo_id", v)}>
          <SelectTrigger><SelectValue placeholder="Seleccionar grúa" /></SelectTrigger>
          <SelectContent>
            {vehiculos.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.placa} {v.marca ? `— ${v.marca}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Hora de inicio</Label>
        <Input
          type="time"
          value={form.hora_inicio}
          onChange={(e) => { if (e.target.value) set("hora_inicio", e.target.value) }}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
          Abrir turno
        </Button>
      </div>
    </form>
  )
}
