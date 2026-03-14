"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { CalendarRange, Download, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { pdf } from "@react-pdf/renderer"
import { DocumentoInspeccionesRangoPDF } from "./documento-inspecciones-rango-pdf"
import type { FotoConTimestamp } from "@/lib/parqueadero/types"
import type { ItemInspeccionRango } from "./documento-inspecciones-rango-pdf"
export function BotonDescargarRangoInspecciones() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [placa, setPlaca] = useState("todas")
  const [placas, setPlacas] = useState<string[]>([])

  const abrirDialogo = async () => {
    setOpen(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("parq_vehiculos")
      .select("placa")
      .eq("activo", true)
      .order("placa", { ascending: true })
    if (data) setPlacas(data.map(v => v.placa))
  }

  const descargar = async () => {
    if (!fechaInicio || !fechaFin) {
      toast.error("Selecciona las fechas de inicio y fin")
      return
    }
    if (fechaInicio > fechaFin) {
      toast.error("La fecha de inicio debe ser anterior a la fecha fin")
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      // 1. Obtener inspecciones del rango ordenadas por fecha y hora
      let query = supabase
        .from("parq_vista_inspecciones")
        .select("*")
        .gte("fecha", fechaInicio)
        .lte("fecha", fechaFin)
        .order("fecha", { ascending: true })
        .order("hora", { ascending: true })

      if (placa !== "todas") {
        query = query.eq("placa", placa)
      }

      const { data: inspecciones, error: errorInsp } = await query

      if (errorInsp) throw errorInsp

      if (!inspecciones || inspecciones.length === 0) {
        toast.warning("No hay inspecciones en ese rango de fechas")
        return
      }

      const ids = inspecciones.map(i => i.id)

      // 2. Obtener firmas y fotos de observaciones en una sola consulta
      const { data: firmasRaw } = await supabase
        .from("parq_inspecciones")
        .select("id, firma_inspector, firma_operador, observaciones_fotos")
        .in("id", ids)

      const firmasMap = Object.fromEntries((firmasRaw || []).map(f => [f.id, f]))

      // 3. Obtener todos los items paginando de 1000 en 1000 para evitar el límite de Supabase
      type ItemRaw = {
        id: string
        inspeccion_id: string
        estado: string
        observacion: string | null
        foto_url: string | null
        fotos: FotoConTimestamp[] | null
        item_nombre: string | null
        item_categoria: string | null
        item_orden: number | null
        subsanado: boolean
        subsanado_observacion: string | null
        item_catalogo: { nombre?: string; categoria?: string; orden?: number } | null
      }
      const itemsRaw: ItemRaw[] = []
      let desde = 0
      const PAGE = 1000
      while (true) {
        const { data, error } = await supabase
          .from("parq_items_inspeccion")
          .select(`
            id, inspeccion_id, estado, observacion, foto_url, fotos,
            item_nombre, item_categoria, item_orden,
            subsanado, subsanado_observacion,
            item_catalogo:parq_items_catalogo (nombre, categoria, orden)
          `)
          .in("inspeccion_id", ids)
          .range(desde, desde + PAGE - 1)
        if (error) throw error
        if (!data || data.length === 0) break
        itemsRaw.push(...(data as ItemRaw[]))
        if (data.length < PAGE) break
        desde += PAGE
      }

      // 4. Agrupar items por inspeccion_id
      const itemsMap: Record<string, ItemInspeccionRango[]> = {}
      for (const item of itemsRaw) {
        const parsed: ItemInspeccionRango = {
          id: item.id,
          estado: item.estado,
          observacion: item.observacion,
          foto_url: item.foto_url,
          fotos: item.fotos ?? null,
          item_nombre: item.item_nombre || item.item_catalogo?.nombre || "Sin nombre",
          item_categoria: item.item_categoria || item.item_catalogo?.categoria || "otros",
          item_orden: item.item_orden ?? item.item_catalogo?.orden ?? 0,
          subsanado: item.subsanado,
          subsanado_observacion: item.subsanado_observacion,
        }
        if (!itemsMap[item.inspeccion_id]) itemsMap[item.inspeccion_id] = []
        itemsMap[item.inspeccion_id].push(parsed)
      }

      // Ordenar items de cada inspección
      for (const id of ids) {
        if (itemsMap[id]) {
          itemsMap[id].sort((a, b) => a.item_orden - b.item_orden)
        }
      }

      // 5. Combinar datos
      const datos = inspecciones.map(insp => ({
        inspeccion: {
          ...insp,
          firma_inspector: firmasMap[insp.id]?.firma_inspector || null,
          firma_operador: firmasMap[insp.id]?.firma_operador || null,
          observaciones_fotos: (firmasMap[insp.id]?.observaciones_fotos as FotoConTimestamp[] | null) ?? null,
        },
        items: itemsMap[insp.id] || [],
      }))

      // 6. Generar y descargar el PDF
      const documento = (
        <DocumentoInspeccionesRangoPDF
          datos={datos}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
        />
      )

      const blob = await pdf(documento).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const sufijPlaca = placa !== "todas" ? `_${placa}` : ""
      link.download = `Inspecciones${sufijPlaca}_${fechaInicio.replace(/-/g, "")}_${fechaFin.replace(/-/g, "")}.pdf`
      link.click()
      URL.revokeObjectURL(url)

      toast.success(`PDF generado con ${inspecciones.length} inspección(es)`)
      setOpen(false)
      setPlaca("todas")
    } catch (error) {
      console.error("Error al generar PDF de rango:", error)
      toast.error("Error al generar el PDF")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={abrirDialogo}>
        <CalendarRange className="h-4 w-4 mr-2" />
        Descargar por rango
      </Button>

      <Dialog open={open} onOpenChange={v => { if (!loading) setOpen(v) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Descargar inspecciones por rango de fechas</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="fecha-inicio">Fecha inicio</Label>
              <Input
                id="fecha-inicio"
                type="date"
                value={fechaInicio}
                onChange={e => setFechaInicio(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha-fin">Fecha fin</Label>
              <Input
                id="fecha-fin"
                type="date"
                value={fechaFin}
                onChange={e => setFechaFin(e.target.value)}
                disabled={loading}
                min={fechaInicio || undefined}
              />
            </div>
            <div className="space-y-2">
              <Label>Vehículo</Label>
              <Select value={placa} onValueChange={setPlaca} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos los vehículos</SelectItem>
                  {placas.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Se generará un único PDF con todas las inspecciones del rango, ordenadas por fecha.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={descargar}
              disabled={loading || !fechaInicio || !fechaFin}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
