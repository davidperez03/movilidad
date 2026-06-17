"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Truck, Loader2, LogOut, LogIn, User, Package, CheckSquare, Square } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { getNowTimestampColombia, localColombiaToUTC } from "@/lib/utils/date"

const MOTIVOS = [
  { value: "requerimiento_agentes", label: "Requerimiento agentes" },
  { value: "requerimiento_polca",   label: "Requerimiento POLCA" },
  { value: "mantenimiento",         label: "Mantenimiento" },
  { value: "tanqueo",               label: "Tanqueo" },
  { value: "autorizacion",          label: "Autorización" },
  { value: "otros",                 label: "Otros" },
]

interface ItemInv { item_id: string; nombre: string; unidad: string; cantidad: number }
interface Personal { id: string; nombre_completo: string }
interface EstadoData {
  vehiculo:       { id: string; placa: string; marca: string | null; modelo: string | null }
  enCalle:        boolean
  ultimaSalida:   { id: string; hora_salida: string; motivo: string; operador_id: string | null } | null
  operadorActual: { id: string; nombre: string } | null
  personal:       Personal[]
  inventarioGrua: ItemInv[]
}

function horaCol(ts: string) {
  return new Date(ts).toLocaleString("es-CO", { timeZone: "America/Bogota", hour: "2-digit", minute: "2-digit", hour12: true })
}

export default function GruaPage() {
  const router         = useRouter()
  const { vehiculoId } = useParams<{ vehiculoId: string }>()
  const [data, setData]       = useState<EstadoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  // Formulario salida
  const [operadorId, setOperadorId] = useState("")
  const [hora, setHora]             = useState(getNowTimestampColombia().slice(0, 16))
  const [motivo, setMotivo]         = useState("")
  const [traeCarga, setTraeCarga]   = useState(false)
  const [itemsSel, setItemsSel]     = useState<string[]>([])
  const [obs, setObs]               = useState("")

  // Formulario regreso
  const [horaReg, setHoraReg] = useState(getNowTimestampColombia().slice(0, 16))
  const [obsReg, setObsReg]   = useState("")

  useEffect(() => {
    fetch(`/api/grua/${vehiculoId}/estado`)
      .then(r => { if (r.status === 401) { router.replace(`/grua/${vehiculoId}/login`); return null } return r.json() })
      .then(d => {
        if (!d) return
        setData(d)
        if (d.operadorActual?.id) setOperadorId(d.operadorActual.id)
      })
      .catch(() => router.replace(`/grua/${vehiculoId}/login`))
      .finally(() => setLoading(false))
  }, [vehiculoId, router])

  const registrarSalida = async () => {
    if (!motivo) { toast.error("Seleccione un motivo"); return }
    setSaving(true)
    try {
      const inventario_items = traeCarga
        ? (data?.inventarioGrua ?? []).filter(i => itemsSel.includes(i.item_id))
        : []

      const res  = await fetch(`/api/grua/${vehiculoId}/registrar`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "salida", operador_id: operadorId || null, hora: localColombiaToUTC(hora), motivo, trae_carga: traeCarga, inventario_items, observaciones: obs || null }),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error ?? "Error"); return }
      toast.success("Salida registrada")
      window.location.reload()
    } catch { toast.error("Error de conexión") }
    finally { setSaving(false) }
  }

  const registrarRegreso = async () => {
    setSaving(true)
    try {
      const res  = await fetch(`/api/grua/${vehiculoId}/registrar`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "regreso", hora: localColombiaToUTC(horaReg), observaciones: obsReg || null }),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error ?? "Error"); return }
      toast.success("Regreso registrado")
      window.location.reload()
    } catch { toast.error("Error de conexión") }
    finally { setSaving(false) }
  }

  const toggleItem = (id: string) =>
    setItemsSel(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  if (!data)   return null

  const { vehiculo, enCalle, ultimaSalida, personal, inventarioGrua } = data

  return (
    <div className="flex-1 flex flex-col gap-6 px-5 py-8 w-full max-w-sm mx-auto">
      {/* Header grúa */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center shrink-0">
          <Truck className="h-6 w-6 text-background" />
        </div>
        <div>
          <p className="text-xl font-bold">{vehiculo.placa}</p>
          <p className="text-sm text-muted-foreground">{vehiculo.marca} {vehiculo.modelo}</p>
        </div>
        <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${enCalle ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>
          {enCalle ? "En calle" : "Disponible"}
        </span>
      </div>

      {enCalle && ultimaSalida && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm space-y-1">
          <p className="font-medium text-rose-700">Salida registrada</p>
          <p className="text-rose-600">{horaCol(ultimaSalida.hora_salida)} — {MOTIVOS.find(m => m.value === ultimaSalida.motivo)?.label}</p>
        </div>
      )}

      <Separator />

      {!enCalle ? (
        // ── FORMULARIO SALIDA ──
        <div className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><LogOut className="h-4 w-4 text-rose-500" />Registrar salida</h2>

          <div className="space-y-1.5">
            <Label className="text-xs">Operador</Label>
            <Select value={operadorId} onValueChange={setOperadorId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar operador" /></SelectTrigger>
              <SelectContent>
                {personal.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre_completo}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Hora de salida</Label>
            <Input type="datetime-local" value={hora} onChange={e => { if (e.target.value) setHora(e.target.value) }} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Motivo *</Label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger><SelectValue placeholder="Seleccionar motivo" /></SelectTrigger>
              <SelectContent>
                {MOTIVOS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={() => setTraeCarga(p => !p)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${traeCarga ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border bg-background text-foreground"}`}
          >
            <span className="flex items-center gap-2"><Package className="h-4 w-4" />Trae carga</span>
            {traeCarga ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-muted-foreground" />}
          </button>

          {traeCarga && inventarioGrua.length > 0 && (
            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground">Inventario de la grúa</p>
              {inventarioGrua.map(item => (
                <button key={item.item_id} onClick={() => toggleItem(item.item_id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm border transition-colors ${itemsSel.includes(item.item_id) ? "border-blue-400 bg-blue-50" : "border-border bg-background"}`}>
                  <span>{item.nombre}</span>
                  <span className="text-muted-foreground tabular-nums">{item.cantidad} {item.unidad}</span>
                </button>
              ))}
            </div>
          )}

          {traeCarga && inventarioGrua.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">Sin inventario asignado a esta grúa</p>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">Observaciones</Label>
            <textarea rows={2} value={obs} onChange={e => setObs(e.target.value)} placeholder="Opcional…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>

          <button onClick={registrarSalida} disabled={saving}
            className="w-full h-14 rounded-xl bg-rose-600 text-white font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><LogOut className="h-5 w-5" />Registrar salida</>}
          </button>
        </div>
      ) : (
        // ── FORMULARIO REGRESO ──
        <div className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><LogIn className="h-4 w-4 text-emerald-500" />Registrar regreso</h2>

          <div className="space-y-1.5">
            <Label className="text-xs">Hora de regreso</Label>
            <Input type="datetime-local" value={horaReg} onChange={e => { if (e.target.value) setHoraReg(e.target.value) }} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Observaciones</Label>
            <textarea rows={2} value={obsReg} onChange={e => setObsReg(e.target.value)} placeholder="Opcional…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>

          <button onClick={registrarRegreso} disabled={saving}
            className="w-full h-14 rounded-xl bg-emerald-600 text-white font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><LogIn className="h-5 w-5" />Registrar regreso</>}
          </button>
        </div>
      )}

      <button onClick={async () => { await fetch(`/api/grua/${vehiculoId}/logout`, { method: "POST" }); router.replace(`/grua/${vehiculoId}/login`) }}
        className="text-xs text-muted-foreground hover:text-foreground text-center py-2 transition-colors mt-auto">
        Cerrar sesión
      </button>
    </div>
  )
}
