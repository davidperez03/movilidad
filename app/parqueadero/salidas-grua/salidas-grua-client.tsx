"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RefreshCw, ArrowUpFromLine, ArrowDownToLine, Printer, Download, Package, PackageX, Pencil, CheckSquare, Square, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { getNowDateColombia } from "@/lib/utils/date"
import { QRCodeSVG } from "qrcode.react"

const MOTIVOS: Record<string, string> = {
  requerimiento_agentes: "Req. agentes",
  requerimiento_polca:   "Req. POLCA",
  mantenimiento:         "Mantenimiento",
  tanqueo:               "Tanqueo",
  autorizacion:          "Autorización",
  otros:                 "Otros",
}

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://movilidad.vercel.app").replace(/\/+$/, "")

interface ItemSticker { item_id: string; nombre: string; desde: number; hasta: number; cantidad: number }
interface ItemInv { item_id: string; nombre: string; usados: number; rango_fin: number; disponibles: number }
interface Salida {
  id: string; hora_salida: string; hora_regreso: string | null
  motivo: string; trae_carga: boolean; vehiculo_id: string
  placa: string | null; marca: string | null; operador_nombre: string | null
  inventario_items: ItemSticker[]; observaciones: string | null
}
interface Vehiculo { id: string; placa: string; marca: string | null; modelo: string | null }

// Estado interno del modal de edición
interface EditState {
  salidaId:     string
  traeCarga:    boolean
  itemsSel:     Record<string, { desde: string; hasta: string }>
  observaciones: string
  horaSalida:   string  // datetime-local format (Colombia)
  confirmando:  boolean  // segunda pantalla de confirmación
}

function horaCol(ts: string) {
  return new Date(ts).toLocaleString("es-CO", {
    timeZone: "America/Bogota", hour: "2-digit", minute: "2-digit", hour12: true,
  })
}

// Convierte un timestamp ISO a formato datetime-local en hora Colombia
function tsToDatetimeLocal(ts: string): string {
  return new Intl.DateTimeFormat("sv", { timeZone: "America/Bogota" }).format(new Date(ts)).slice(0, 16)
}

// Convierte datetime-local (Colombia) a ISO con offset -05:00
function datetimeLocalToISO(dtl: string): string {
  return `${dtl}:00-05:00`
}

export default function SalidasGruaClient({ puedeEditar }: { puedeEditar: boolean }) {
  const hoy = getNowDateColombia()
  const [desde, setDesde]             = useState(hoy)
  const [hasta, setHasta]             = useState(hoy)
  const [placaFiltro, setPlacaFiltro] = useState("todos")
  const [salidas, setSalidas]         = useState<Salida[]>([])
  const [vehiculos, setVehiculos]     = useState<Vehiculo[]>([])
  const [loading, setLoading]         = useState(true)
  const [qrSeleccionado, setQrSeleccionado] = useState<string | null>(null)

  // Modal edición
  const [edit, setEdit]           = useState<EditState | null>(null)
  const [inventario, setInventario] = useState<ItemInv[]>([])
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const query = supabase
      .from("parq_salidas_grua")
      .select(`id, hora_salida, hora_regreso, motivo, trae_carga, inventario_items, observaciones, vehiculo_id,
        parq_vehiculos(placa, marca),
        operador:perfiles!operador_id(nombre_completo)`)
      .gte("hora_salida", `${desde}T00:00:00-05:00`)
      .lte("hora_salida", `${hasta}T23:59:59.999-05:00`)
      .order("hora_salida", { ascending: false })

    if (placaFiltro !== "todos") query.eq("vehiculo_id", placaFiltro)

    const { data, error } = await query
    if (error) { toast.error("Error al cargar"); setLoading(false); return }

    setSalidas((data ?? []).map((r) => ({
      id: r.id, hora_salida: r.hora_salida, hora_regreso: r.hora_regreso,
      motivo: r.motivo, trae_carga: r.trae_carga, vehiculo_id: r.vehiculo_id,
      placa:            (r.parq_vehiculos as unknown as { placa: string; marca: string } | null)?.placa ?? null,
      marca:            (r.parq_vehiculos as unknown as { placa: string; marca: string } | null)?.marca ?? null,
      operador_nombre:  (r.operador as unknown as { nombre_completo: string } | null)?.nombre_completo ?? null,
      inventario_items: (r.inventario_items as unknown as ItemSticker[]) ?? [],
      observaciones:    r.observaciones ?? null,
    })))
    setLoading(false)
  }, [desde, hasta, placaFiltro])

  useEffect(() => {
    createClient().from("parq_vehiculos").select("id, placa, marca, modelo")
      .eq("activo", true).order("placa")
      .then(({ data }) => setVehiculos(data ?? []))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // Cargar inventario disponible al abrir modal (una sola vez)
  useEffect(() => {
    if (!puedeEditar) return
    fetch("/api/parqueadero/salidas-grua/inventario")
      .then(r => r.json())
      .then(d => setInventario(d.items ?? []))
      .catch(() => {})
  }, [puedeEditar])

  function abrirModal(s: Salida) {
    // Pre-cargar con los items ya guardados en el registro
    const itemsSel: Record<string, { desde: string; hasta: string }> = {}
    for (const item of s.inventario_items) {
      itemsSel[item.item_id] = { desde: String(item.desde), hasta: String(item.hasta) }
    }
    setEdit({
      salidaId:     s.id,
      traeCarga:    s.trae_carga,
      itemsSel,
      observaciones: s.observaciones ?? "",
      horaSalida:   tsToDatetimeLocal(s.hora_salida),
      confirmando:  false,
    })
  }

  function toggleItem(item_id: string, usados: number) {
    if (!edit) return
    const next = { ...edit.itemsSel }
    if (next[item_id]) {
      delete next[item_id]
    } else {
      next[item_id] = { desde: String(usados + 1), hasta: "" }
    }
    setEdit({ ...edit, itemsSel: next })
  }

  async function guardar() {
    if (!edit) return
    setGuardando(true)
    try {
      const inventario_items = edit.traeCarga
        ? Object.entries(edit.itemsSel)
            .filter(([, v]) => v.desde && v.hasta && Number(v.hasta) >= Number(v.desde))
            .map(([item_id, v]) => ({
              item_id,
              nombre:   inventario.find(i => i.item_id === item_id)?.nombre ?? "",
              desde:    Number(v.desde),
              hasta:    Number(v.hasta),
              cantidad: Number(v.hasta) - Number(v.desde) + 1,
            }))
        : []

      const horaSalidaISO = edit.horaSalida ? datetimeLocalToISO(edit.horaSalida) : undefined

      const res = await fetch(`/api/parqueadero/salidas-grua/${edit.salidaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trae_carga:       edit.traeCarga,
          inventario_items,
          observaciones:    edit.observaciones || null,
          hora_salida:      horaSalidaISO,
        }),
      })
      if (!res.ok) { toast.error("Error al guardar"); return }

      setSalidas(prev => prev.map(s => s.id === edit.salidaId
        ? { ...s, trae_carga: edit.traeCarga, inventario_items, observaciones: edit.observaciones || null,
            hora_salida: horaSalidaISO ?? s.hora_salida }
        : s
      ))
      toast.success("Registro actualizado")
      setEdit(null)
    } finally {
      setGuardando(false)
    }
  }

  const enCalle    = salidas.filter(s => !s.hora_regreso).length
  const regresadas = salidas.filter(s => s.hora_regreso).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Salidas de Grúa</h1>
          <p className="text-muted-foreground text-sm">Registro de salidas/regresos y QR por vehículo</p>
        </div>
      </div>

      <Tabs defaultValue="registros">
        <TabsList>
          <TabsTrigger value="registros">Registros</TabsTrigger>
          <TabsTrigger value="qrs">QRs por grúa</TabsTrigger>
        </TabsList>

        {/* ── REGISTROS ── */}
        <TabsContent value="registros" className="space-y-4 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">En calle</p>
              <p className="text-2xl font-bold text-rose-600">{enCalle}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Regresadas</p>
              <p className="text-2xl font-bold text-emerald-600">{regresadas}</p>
            </div>
            <div className="rounded-lg border p-4 hidden sm:block">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{salidas.length}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="w-auto" />
            <Input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="w-auto" />
            <Select value={placaFiltro} onValueChange={setPlacaFiltro}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las grúas</SelectItem>
                {vehiculos.map(v => <SelectItem key={v.id} value={v.id}>{v.placa}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={cargar} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Excel</Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 space-y-3" align="end">
                <p className="text-sm font-medium">Exportar rango</p>
                <div className="space-y-1"><Label className="text-xs">Desde</Label>
                  <Input type="date" value={desde} onChange={e => setDesde(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Hasta</Label>
                  <Input type="date" value={hasta} onChange={e => setHasta(e.target.value)} /></div>
                <Button size="sm" className="w-full"
                  onClick={() => window.open(`/api/parqueadero/salidas-grua/exportar?desde=${desde}&hasta=${hasta}`, "_blank")}>
                  <Download className="h-4 w-4 mr-1" />Descargar
                </Button>
              </PopoverContent>
            </Popover>
          </div>

          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Grúa</th>
                  <th className="text-left px-4 py-3 font-medium">Operador</th>
                  <th className="text-left px-4 py-3 font-medium">Motivo</th>
                  <th className="text-right px-4 py-3 font-medium">H. Salida</th>
                  <th className="text-right px-4 py-3 font-medium">H. Regreso</th>
                  <th className="text-left px-4 py-3 font-medium">Carga</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Observaciones</th>
                  <th className="text-center px-4 py-3 font-medium">Estado</th>
                  {puedeEditar && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={puedeEditar ? 9 : 8} className="text-center py-10 text-muted-foreground">Cargando…</td></tr>
                ) : salidas.length === 0 ? (
                  <tr><td colSpan={puedeEditar ? 9 : 8} className="text-center py-10 text-muted-foreground">Sin registros para este período</td></tr>
                ) : salidas.map(s => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors align-top">
                    <td className="px-4 py-3 font-mono font-semibold">{s.placa ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.operador_nombre ?? "—"}</td>
                    <td className="px-4 py-3">{MOTIVOS[s.motivo] ?? s.motivo}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{horaCol(s.hora_salida)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {s.hora_regreso ? horaCol(s.hora_regreso) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {s.trae_carga ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                            <Package className="h-3 w-3" />Con carga
                          </span>
                          {s.inventario_items.map((item, i) => (
                            <p key={i} className="text-xs tabular-nums text-muted-foreground">
                              {item.nombre}: <span className="font-mono font-medium">#{item.desde}–#{item.hasta}</span>
                              <span className="ml-1">({item.cantidad})</span>
                            </p>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <PackageX className="h-3 w-3" />Sin carga
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell max-w-[200px] truncate" title={s.observaciones ?? ""}>
                      {s.observaciones ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.hora_regreso ? (
                        <Badge variant="outline" className="border-emerald-500 text-emerald-600 text-xs">
                          <ArrowDownToLine className="h-3 w-3 mr-1" />Regresó
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-rose-500 text-rose-600 text-xs">
                          <ArrowUpFromLine className="h-3 w-3 mr-1" />En calle
                        </Badge>
                      )}
                    </td>
                    {puedeEditar && (
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => abrirModal(s)}
                          title="Editar carga y observaciones"
                          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── QRs POR GRÚA ── */}
        <TabsContent value="qrs" className="pt-2">
          <p className="text-sm text-muted-foreground mb-4">
            Seleccione una grúa para ver su QR e imprimirlo.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
            {vehiculos.map(v => (
              <button key={v.id} onClick={() => setQrSeleccionado(v.id)}
                className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                  qrSeleccionado === v.id
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-border hover:bg-muted/50"
                }`}>
                <p className="font-mono font-bold">{v.placa}</p>
                <p className="text-xs text-muted-foreground">{v.marca ?? "—"}</p>
              </button>
            ))}
          </div>

          {qrSeleccionado && (() => {
            const v = vehiculos.find(x => x.id === qrSeleccionado)
            const url = `${SITE}/grua/${qrSeleccionado}`
            return (
              <div className="flex flex-col items-center gap-6">
                <div id="qr-grua-card" className="rounded-2xl border-2 border-border p-8 flex flex-col items-center gap-4 w-full max-w-xs print:border-black">
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Registro de Salida</p>
                    <p className="text-2xl font-bold font-mono mt-1">{v?.placa}</p>
                    {v?.marca && <p className="text-sm text-muted-foreground">{v.marca} {v.modelo}</p>}
                  </div>
                  <QRCodeSVG value={url} size={200} level="H" includeMargin className="rounded-xl" />
                  <p className="text-xs text-muted-foreground font-mono text-center break-all bg-muted px-3 py-1 rounded-full">
                    {url}
                  </p>
                </div>
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />Imprimir QR
                </Button>
              </div>
            )
          })()}

          {vehiculos.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-10">Sin vehículos registrados</p>
          )}
        </TabsContent>
      </Tabs>

      {/* ── MODAL EDICIÓN ── */}
      <Dialog open={!!edit} onOpenChange={open => { if (!open) setEdit(null) }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {edit && !edit.confirmando && (
            <>
              <DialogHeader>
                <DialogTitle>Editar registro de carga</DialogTitle>
              </DialogHeader>

              <div className="space-y-5 py-2">
                {/* Toggle trae_carga */}
                <button
                  onClick={() => setEdit({ ...edit, traeCarga: !edit.traeCarga, itemsSel: {} })}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                    edit.traeCarga
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-border bg-background text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Trajo carga (stickers)
                  </span>
                  {edit.traeCarga
                    ? <CheckSquare className="h-4 w-4" />
                    : <Square className="h-4 w-4 text-muted-foreground" />
                  }
                </button>

                {/* Stickers */}
                {edit.traeCarga && (
                  <div className="space-y-3">
                    {inventario.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">Sin stickers disponibles en el sistema</p>
                    ) : (
                      <div className="rounded-lg border p-3 space-y-3">
                        <p className="text-xs font-medium text-muted-foreground">Stickers asignados en campo</p>
                        {inventario.map(item => {
                          const sel = edit.itemsSel[item.item_id]
                          return (
                            <div key={item.item_id} className={`rounded-lg border p-3 space-y-2 ${sel ? "border-emerald-400 bg-emerald-50/50" : "border-border"}`}>
                              <button
                                onClick={() => toggleItem(item.item_id, item.usados)}
                                className="w-full flex items-center justify-between text-sm"
                              >
                                <span className="font-medium">{item.nombre}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">{item.disponibles} disp.</span>
                                  {sel
                                    ? <CheckSquare className="h-4 w-4 text-emerald-600" />
                                    : <Square className="h-4 w-4 text-muted-foreground" />
                                  }
                                </div>
                              </button>
                              {sel && (
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Desde #</label>
                                    <Input
                                      type="number" inputMode="numeric" value={sel.desde}
                                      onChange={e => setEdit({ ...edit, itemsSel: { ...edit.itemsSel, [item.item_id]: { ...sel, desde: e.target.value } } })}
                                      className="h-9 text-center font-mono"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Hasta #</label>
                                    <Input
                                      type="number" inputMode="numeric" value={sel.hasta}
                                      onChange={e => setEdit({ ...edit, itemsSel: { ...edit.itemsSel, [item.item_id]: { ...sel, hasta: e.target.value } } })}
                                      className="h-9 text-center font-mono"
                                    />
                                  </div>
                                  {sel.desde && sel.hasta && Number(sel.hasta) >= Number(sel.desde) && (
                                    <p className="col-span-2 text-xs text-center text-emerald-700 font-medium tabular-nums">
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
                  </div>
                )}

                {/* Hora de salida */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Hora de salida</Label>
                  <Input
                    type="datetime-local"
                    value={edit.horaSalida}
                    onChange={e => setEdit({ ...edit, horaSalida: e.target.value })}
                  />
                </div>

                {/* Observaciones */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Observaciones</Label>
                  <textarea
                    rows={3}
                    value={edit.observaciones}
                    onChange={e => setEdit({ ...edit, observaciones: e.target.value })}
                    placeholder="Opcional…"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setEdit(null)}>Cancelar</Button>
                <Button onClick={() => setEdit({ ...edit, confirmando: true })}>
                  Continuar
                </Button>
              </DialogFooter>
            </>
          )}

          {edit?.confirmando && (
            <>
              <DialogHeader>
                <DialogTitle>¿Confirmar cambios?</DialogTitle>
              </DialogHeader>

              <div className="py-3 space-y-3 text-sm">
                <div className="rounded-lg bg-muted px-4 py-3 space-y-1">
                  {edit.horaSalida && (
                    <p><span className="text-muted-foreground">H. salida:</span> <span className="font-medium tabular-nums">{edit.horaSalida.replace("T", " ")}</span></p>
                  )}
                  <p><span className="text-muted-foreground">Carga:</span> <span className="font-medium">{edit.traeCarga ? "Con carga" : "Sin carga"}</span></p>
                  {edit.traeCarga && Object.entries(edit.itemsSel).filter(([, v]) => v.desde && v.hasta).map(([id, v]) => {
                    const nombre = inventario.find(i => i.item_id === id)?.nombre ?? id
                    return (
                      <p key={id}><span className="text-muted-foreground">{nombre}:</span> <span className="font-mono font-medium">#{v.desde} – #{v.hasta}</span></p>
                    )
                  })}
                  {edit.observaciones && (
                    <p><span className="text-muted-foreground">Obs:</span> {edit.observaciones}</p>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">Esta acción sobreescribirá los datos actuales del registro.</p>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setEdit({ ...edit, confirmando: false })}>
                  Atrás
                </Button>
                <Button onClick={guardar} disabled={guardando}>
                  {guardando ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Guardando…</> : "Guardar cambios"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
