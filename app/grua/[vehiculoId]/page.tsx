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

interface ItemInv { item_id: string; nombre: string; usados: number; rango_fin: number; disponibles: number }
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
  // Formulario salida
  const [operadorId, setOperadorId] = useState("")
  const [motivo, setMotivo]         = useState("")
  const [obs, setObs]               = useState("")
  const [codigoSalida, setCodigoSalida] = useState<string | null>(null)

  // Formulario regreso
  const [obsReg, setObsReg]       = useState("")
  const [traeCarga, setTraeCarga] = useState(false)
  const [itemsSel, setItemsSel]   = useState<Record<string, { desde: string; hasta: string }>>({})

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
      const res  = await fetch(`/api/grua/${vehiculoId}/registrar`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "salida", operador_id: operadorId || null, motivo, observaciones: obs || null }),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error ?? "Error"); return }
      // Guardar solo los 5 dígitos para mostrar al vigilante
      setCodigoSalida(d.codigo_salida?.split('-')[1] ?? d.codigo_salida)
      setTimeout(() => { window.location.reload() }, 15000)
    } catch { toast.error("Error de conexión") }
    finally { setSaving(false) }
  }

  const registrarRegreso = async () => {
    setSaving(true)
    try {
      const inventario_items = traeCarga
        ? Object.entries(itemsSel)
            .filter(([, v]) => v.desde && v.hasta && Number(v.hasta) >= Number(v.desde))
            .map(([item_id, v]) => ({
              item_id,
              nombre:   data?.inventarioGrua.find(i => i.item_id === item_id)?.nombre ?? "",
              desde:    Number(v.desde),
              hasta:    Number(v.hasta),
              cantidad: Number(v.hasta) - Number(v.desde) + 1,
            }))
        : []

      const res  = await fetch(`/api/grua/${vehiculoId}/registrar`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "regreso", trae_carga: traeCarga, inventario_items, observaciones: obsReg || null }),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error ?? "Error"); return }
      toast.success("Regreso registrado")
      window.location.reload()
    } catch { toast.error("Error de conexión") }
    finally { setSaving(false) }
  }

  const toggleItem = (id: string, desdeDefault: number) =>
    setItemsSel(p => {
      if (p[id]) { const n = { ...p }; delete n[id]; return n }
      return { ...p, [id]: { desde: String(desdeDefault), hasta: "" } }
    })

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

      {codigoSalida ? (
        // ── CÓDIGO DE SALIDA ──
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <LogOut className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Salida registrada — código para el vigilante</p>
            <p className="text-6xl font-black tracking-widest mt-3 font-mono text-foreground">{codigoSalida}</p>
            <p className="text-xs text-muted-foreground mt-3">Esta pantalla se cerrará en 15 segundos</p>
          </div>
          <button onClick={() => window.location.reload()}
            className="text-sm text-muted-foreground hover:text-foreground underline">
            Cerrar ahora
          </button>
        </div>
      ) : !enCalle ? (
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
            <Label className="text-xs">Motivo *</Label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger><SelectValue placeholder="Seleccionar motivo" /></SelectTrigger>
              <SelectContent>
                {MOTIVOS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

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

          {/* Carga y stickers al regresar */}
          <button onClick={() => { setTraeCarga(p => !p); setItemsSel({}) }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${traeCarga ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border bg-background text-foreground"}`}>
            <span className="flex items-center gap-2"><Package className="h-4 w-4" />Trajo carga (stickers)</span>
            {traeCarga ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-muted-foreground" />}
          </button>

          {traeCarga && inventarioGrua.length > 0 && (
            <div className="space-y-3 rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground">Stickers asignados en campo</p>
              {inventarioGrua.map(item => {
                const sel = itemsSel[item.item_id]
                return (
                  <div key={item.item_id} className={`rounded-lg border p-3 space-y-2 ${sel ? "border-blue-400 bg-blue-50/50" : "border-border"}`}>
                    <button onClick={() => toggleItem(item.item_id, item.usados + 1)}
                      className="w-full flex items-center justify-between text-sm">
                      <span className="font-medium">{item.nombre}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{item.disponibles} disp.</span>
                        {sel ? <CheckSquare className="h-4 w-4 text-blue-500" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </button>
                    {sel && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Desde #</label>
                          <Input type="number" inputMode="numeric" value={sel.desde}
                            onChange={e => setItemsSel(p => ({ ...p, [item.item_id]: { ...p[item.item_id], desde: e.target.value } }))}
                            className="h-9 text-center font-mono" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Hasta #</label>
                          <Input type="number" inputMode="numeric" value={sel.hasta}
                            onChange={e => setItemsSel(p => ({ ...p, [item.item_id]: { ...p[item.item_id], hasta: e.target.value } }))}
                            className="h-9 text-center font-mono" />
                        </div>
                        {sel.desde && sel.hasta && Number(sel.hasta) >= Number(sel.desde) && (
                          <p className="col-span-2 text-xs text-center text-blue-600 font-medium tabular-nums">
                            {Number(sel.hasta) - Number(sel.desde) + 1} sticker(s): #{sel.desde} – #{sel.hasta}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {traeCarga && inventarioGrua.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">Sin stickers disponibles en el sistema</p>
          )}

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

      {!codigoSalida && (
        <button onClick={async () => { await fetch(`/api/grua/${vehiculoId}/logout`, { method: "POST" }); router.replace(`/grua/${vehiculoId}/login`) }}
          className="text-xs text-muted-foreground hover:text-foreground text-center py-2 transition-colors mt-auto">
          Cerrar sesión
        </button>
      )}
    </div>
  )
}
