"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, QrCode, ArrowUpFromLine, ArrowDownToLine, Printer, Download } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import Link from "next/link"
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
interface Salida {
  id: string; hora_salida: string; hora_regreso: string | null
  motivo: string; trae_carga: boolean; vehiculo_id: string
  placa: string | null; marca: string | null; operador_nombre: string | null
  inventario_items: ItemSticker[]; observaciones: string | null
}
interface Vehiculo { id: string; placa: string; marca: string | null; modelo: string | null }

function horaCol(ts: string) {
  return new Date(ts).toLocaleString("es-CO", {
    timeZone: "America/Bogota", hour: "2-digit", minute: "2-digit", hour12: true,
  })
}

export default function SalidasGruaPage() {
  const hoy = getNowDateColombia()
  const [desde, setDesde]           = useState(hoy)
  const [hasta, setHasta]           = useState(hoy)
  const [placaFiltro, setPlacaFiltro] = useState("todos")
  const [salidas, setSalidas]       = useState<Salida[]>([])
  const [vehiculos, setVehiculos]   = useState<Vehiculo[]>([])
  const [loading, setLoading]       = useState(true)
  const [qrSeleccionado, setQrSeleccionado] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const query = supabase
      .from("parq_salidas_grua")
      .select(`id, hora_salida, hora_regreso, motivo, trae_carga, inventario_items, observaciones, vehiculo_id,
        parq_vehiculos(placa, marca),
        operador:perfiles!operador_id(nombre_completo)`)
      .gte("hora_salida", `${desde}T00:00:00.000Z`)
      .lte("hora_salida", `${hasta}T23:59:59.999Z`)
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

  const enCalle   = salidas.filter(s => !s.hora_regreso).length
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
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">Cargando…</td></tr>
                ) : salidas.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">Sin registros para este período</td></tr>
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
                      {s.trae_carga && s.inventario_items.length > 0 ? (
                        <div className="space-y-0.5">
                          {s.inventario_items.map((item, i) => (
                            <p key={i} className="text-xs tabular-nums">
                              {item.nombre}: <span className="font-mono font-medium">#{item.desde}–#{item.hasta}</span>
                              <span className="text-muted-foreground ml-1">({item.cantidad})</span>
                            </p>
                          ))}
                        </div>
                      ) : s.trae_carga ? (
                        <span className="text-xs text-muted-foreground">Sí</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
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
    </div>
  )
}
