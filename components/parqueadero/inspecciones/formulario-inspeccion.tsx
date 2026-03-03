"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Loader2,
  Save,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  PenTool,
  Camera,
} from "lucide-react"
import { OPCIONES_TURNO, CATEGORIAS_ITEMS, ESTADOS_DOCUMENTO } from "@/lib/parqueadero/config"
import { formatearFecha, getEstadoDocumentoColor, ESTADO_ITEM_ICONS, ESTADO_ITEM_COLORS, type EstadoItem } from "@/lib/parqueadero/utils"
import { getNowDateColombia, getNowTimeColombia, getNowTimestampColombia } from "@/lib/utils/date"
import type { ItemCatalogo, VistaPersonal, VistaVehiculo, EstadoDocumento, FotoConTimestamp } from "@/lib/parqueadero/types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { capitalizeName } from "@/lib/utils/capitalize"
import { CapturaFirma, VistaFirma } from "./captura-firma"
import { CapturaFoto, VistaFotos } from "./captura-foto"

type VehiculoFormulario = Pick<VistaVehiculo, 'id' | 'placa' | 'marca' | 'modelo' | 'tipo' | 'soat_vencimiento' | 'tecnomecanica_vencimiento' | 'estado_soat' | 'estado_tecnomecanica'>

interface FormularioInspeccionProps {
  vehiculos: VehiculoFormulario[]
  itemsCatalogo: ItemCatalogo[]
  operadores: VistaPersonal[]
  auxiliares: VistaPersonal[]
}

interface ItemInspeccion {
  item_catalogo_id: string
  estado: EstadoItem
  observacion: string
  fotos: FotoConTimestamp[]  // Cambio: array de fotos con timestamps
}

interface NovedadPendiente {
  id: string
  item_catalogo_id: string
  estado: string
  observacion: string | null
  inspeccion_id: string
  fecha_inspeccion: string
  item_nombre: string
  item_categoria: string
}


export function FormularioInspeccion({
  vehiculos,
  itemsCatalogo,
  operadores,
  auxiliares,
}: FormularioInspeccionProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    vehiculo_id: "",
    operador_id: "",
    auxiliar_id: "",
    turno: "diurno" as "diurno" | "nocturno",
    observaciones: "",
  })

  // El inspector decide si es apto (por defecto sí)
  const [esAptoManual, setEsAptoManual] = useState(true)

  // Novedades pendientes de inspecciones anteriores
  const [novedadesPendientes, setNovedadesPendientes] = useState<NovedadPendiente[]>([])
  // Estado de resolución: 'subsanado' | 'se_mantiene' | 'empeoro' | null
  const [novedadesResolucion, setNovedadesResolucion] = useState<Record<string, { estado: 'subsanado' | 'se_mantiene' | 'empeoro' | null; observacion: string }>>({})

  // Inicializar items sin estado seleccionado
  const [items, setItems] = useState<Record<string, ItemInspeccion>>(
    Object.fromEntries(
      itemsCatalogo.map((item) => [
        item.id,
        { item_catalogo_id: item.id, estado: "" as EstadoItem, observacion: "", fotos: [] },
      ])
    )
  )

  // Fotos de observaciones generales
  const [observacionesFotos, setObservacionesFotos] = useState<FotoConTimestamp[]>([])
  const [modalFotoObservaciones, setModalFotoObservaciones] = useState(false)

  // Firmas
  const [firmaInspector, setFirmaInspector] = useState<string | null>(null)
  const [firmaOperador, setFirmaOperador] = useState<string | null>(null)
  const [modalFirma, setModalFirma] = useState<"inspector" | "operador" | null>(null)

  // Foto de evidencia
  const [modalFoto, setModalFoto] = useState<string | null>(null) // item_catalogo_id

  // Cargar novedades pendientes cuando se selecciona un vehículo
  useEffect(() => {
    async function cargarNovedades() {
      if (!formData.vehiculo_id) {
        setNovedadesPendientes([])
        return
      }

      try {
        const supabase = createClient()

        // Buscar la última inspección del vehículo
        const { data: ultimaInspeccion } = await supabase
          .from("parq_inspecciones")
          .select("id, fecha")
          .eq("vehiculo_id", formData.vehiculo_id)
          .order("fecha", { ascending: false })
          .order("creado_en", { ascending: false })
          .limit(1)
          .single()

        if (!ultimaInspeccion) {
          setNovedadesPendientes([])
          return
        }

        // Buscar items con novedades no subsanadas
        const { data: novedades } = await supabase
          .from("parq_items_inspeccion")
          .select(`
            id,
            item_catalogo_id,
            estado,
            observacion,
            inspeccion_id,
            subsanado,
            item_catalogo:parq_items_catalogo (
              nombre,
              categoria
            )
          `)
          .eq("inspeccion_id", ultimaInspeccion.id)
          .in("estado", ["regular", "malo"])
          .eq("subsanado", false)

        if (novedades && novedades.length > 0) {
          setNovedadesPendientes(
            novedades.map((n) => ({
              id: n.id,
              item_catalogo_id: n.item_catalogo_id,
              estado: n.estado,
              observacion: n.observacion,
              inspeccion_id: n.inspeccion_id,
              fecha_inspeccion: ultimaInspeccion.fecha,
              item_nombre: (n.item_catalogo as { nombre?: string; categoria?: string } | null)?.nombre || "",
              item_categoria: (n.item_catalogo as { nombre?: string; categoria?: string } | null)?.categoria || "",
            }))
          )
          // Inicializar estado de resolución
          const inicial: Record<string, { estado: 'subsanado' | 'se_mantiene' | 'empeoro' | null; observacion: string }> = {}
          novedades.forEach((n) => {
            inicial[n.id] = { estado: null, observacion: "" }
          })
          setNovedadesResolucion(inicial)
        } else {
          setNovedadesPendientes([])
        }
      } catch {
        // Error silencioso - no hay novedades previas
      }
    }

    cargarNovedades()
  }, [formData.vehiculo_id])

  // Obtener datos del vehículo y operador seleccionados
  const vehiculoSeleccionado = useMemo(
    () => vehiculos.find((v) => v.id === formData.vehiculo_id),
    [vehiculos, formData.vehiculo_id]
  )

  const operadorSeleccionado = useMemo(
    () => operadores.find((o) => o.id === formData.operador_id),
    [operadores, formData.operador_id]
  )

  const handleEstadoChange = (itemId: string, estado: EstadoItem) => {
    setItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], estado },
    }))
  }

  const handleObservacionChange = (itemId: string, observacion: string) => {
    setItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], observacion },
    }))
  }

  const handleFotosChange = (itemId: string, nuevasFotos: FotoConTimestamp[]) => {
    setItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        fotos: [...(prev[itemId].fotos || []), ...nuevasFotos]
      },
    }))
  }

  const eliminarFoto = (itemId: string, fotoIndex: number) => {
    setItems((prev) => {
      const fotosActuales = prev[itemId].fotos || []
      const nuevasFotos = fotosActuales.filter((_, i) => i !== fotoIndex)
      return {
        ...prev,
        [itemId]: { ...prev[itemId], fotos: nuevasFotos },
      }
    })
  }

  const handleResolucionChange = (novedadId: string, estado: 'subsanado' | 'se_mantiene' | 'empeoro' | null, itemCatalogoId: string) => {
    setNovedadesResolucion((prev) => ({
      ...prev,
      [novedadId]: { ...prev[novedadId], estado },
    }))

    // También establecer el estado del item para la nueva inspección
    if (estado) {
      const novedadOriginal = novedadesPendientes.find((n) => n.item_catalogo_id === itemCatalogoId)
      const nuevoEstado: EstadoItem =
        estado === 'subsanado' ? 'bueno' :
        estado === 'se_mantiene' ? (novedadOriginal?.estado as EstadoItem || 'regular') : 'malo'

      setItems((prev) => ({
        ...prev,
        [itemCatalogoId]: { ...prev[itemCatalogoId], estado: nuevoEstado },
      }))
    } else {
      // Si se deselecciona, limpiar el estado
      setItems((prev) => ({
        ...prev,
        [itemCatalogoId]: { ...prev[itemCatalogoId], estado: '' as EstadoItem },
      }))
    }
  }

  const handleResolucionObsChange = (novedadId: string, observacion: string, itemCatalogoId: string) => {
    setNovedadesResolucion((prev) => ({
      ...prev,
      [novedadId]: { ...prev[novedadId], observacion },
    }))
    // Sincronizar al item de la nueva inspección para que quede guardado
    setItems((prev) => ({
      ...prev,
      [itemCatalogoId]: { ...prev[itemCatalogoId], observacion },
    }))
  }

  // Mapa de novedades pendientes por item_catalogo_id
  const novedadesPorItem = useMemo(() => {
    const map: Record<string, NovedadPendiente> = {}
    novedadesPendientes.forEach((n) => {
      map[n.item_catalogo_id] = n
    })
    return map
  }, [novedadesPendientes])

  // Agrupar items por categoría
  const itemsPorCategoria = itemsCatalogo.reduce((acc, item) => {
    if (!acc[item.categoria]) {
      acc[item.categoria] = []
    }
    acc[item.categoria].push(item)
    return acc
  }, {} as Record<string, ItemCatalogo[]>)

  // Verificar estados para mostrar advertencias
  const tieneItemsMalos = Object.values(items).some((item) => item.estado === "malo")
  const tieneItemsRegulares = Object.values(items).some((item) => item.estado === "regular")

  // Solo documentos vencidos fuerzan NO APTO automáticamente
  const tieneDocumentosVencidos =
    vehiculoSeleccionado?.estado_soat === "vencido" ||
    vehiculoSeleccionado?.estado_tecnomecanica === "vencido" ||
    operadorSeleccionado?.estado_licencia === "vencido"

  // Verificar si hay novedades pendientes sin resolución (solo informativo)
  const tieneNovedadesPendientes = novedadesPendientes.some(
    (n) => !novedadesResolucion[n.id]?.estado
  )

  // NO APTO forzado solo por documentos vencidos, el resto lo decide el inspector
  const esApto = tieneDocumentosVencidos ? false : esAptoManual

  // Contar items evaluados vs total
  const totalItems = Object.keys(items).filter((itemId) => {
    if (!formData.auxiliar_id) {
      const catalogoItem = itemsCatalogo.find((c) => c.id === itemId)
      if (catalogoItem?.categoria === "epp_auxiliar") return false
    }
    return true
  }).length

  const itemsEvaluados = Object.entries(items).filter(([itemId, item]) => {
    if (!formData.auxiliar_id) {
      const catalogoItem = itemsCatalogo.find((c) => c.id === itemId)
      if (catalogoItem?.categoria === "epp_auxiliar") return false
    }
    return !!item.estado
  }).length

  const porcentajeEvaluado = totalItems > 0 ? Math.round((itemsEvaluados / totalItems) * 100) : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.vehiculo_id) {
      toast.error("Selecciona un vehículo")
      return
    }
    if (!formData.operador_id) {
      toast.error("Selecciona un operador")
      return
    }

    // Validar que todos los items estén evaluados
    const itemsSinEvaluar = Object.entries(items).filter(([itemId, item]) => {
      // Ignorar EPP auxiliar si no hay auxiliar
      if (!formData.auxiliar_id) {
        const catalogoItem = itemsCatalogo.find((c) => c.id === itemId)
        if (catalogoItem?.categoria === "epp_auxiliar") {
          return false
        }
      }
      return !item.estado
    })

    if (itemsSinEvaluar.length > 0) {
      const nombresItems = itemsSinEvaluar.slice(0, 3).map(([itemId]) => {
        const catalogoItem = itemsCatalogo.find((c) => c.id === itemId)
        return catalogoItem?.nombre || "Item desconocido"
      })
      const mensaje = itemsSinEvaluar.length > 3
        ? `Faltan ${itemsSinEvaluar.length} items por evaluar: ${nombresItems.join(", ")}...`
        : `Faltan items por evaluar: ${nombresItems.join(", ")}`
      toast.error(mensaje)
      return
    }

    if (!firmaInspector) {
      toast.error("La firma del inspector es obligatoria")
      return
    }
    if (!firmaOperador) {
      toast.error("La firma del operador es obligatoria")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Obtener el usuario actual como inspector
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Error de autenticación")
        return
      }

      // Usar funciones de fecha/hora local (Colombia)
      const fecha = getNowDateColombia()
      const hora = getNowTimeColombia()
      const timestampLocal = getNowTimestampColombia()

      // Actualizar resolución de novedades de la inspección anterior
      for (const novedad of novedadesPendientes) {
        const resolucion = novedadesResolucion[novedad.id]
        if (resolucion?.estado) {
          // Solo marcar como subsanado si el estado es 'subsanado'
          // Para 'se_mantiene' y 'empeoro' guardamos la observación pero no marcamos como subsanado
          await supabase
            .from("parq_items_inspeccion")
            .update({
              subsanado: resolucion.estado === 'subsanado',
              subsanado_en: timestampLocal,
              subsanado_por: user.id,
              subsanado_observacion: `[${resolucion.estado.toUpperCase()}] ${resolucion.observacion || ''}`.trim(),
            })
            .eq("id", novedad.id)
        }
      }

      // Crear la inspección con snapshot de documentos y firmas
      const { data: inspeccion, error: errorInspeccion } = await supabase
        .from("parq_inspecciones")
        .insert({
          vehiculo_id: formData.vehiculo_id,
          operador_id: formData.operador_id,
          auxiliar_id: formData.auxiliar_id || null,
          inspector_id: user.id,
          fecha,
          hora,
          turno: formData.turno,
          es_apto: esApto,
          observaciones: formData.observaciones || null,
          observaciones_fotos: observacionesFotos.length > 0 ? observacionesFotos : null,
          creado_por: user.id,
          // Snapshot de documentos al momento de la inspección
          snapshot_soat_vencimiento: vehiculoSeleccionado?.soat_vencimiento || null,
          snapshot_tecnomecanica_vencimiento: vehiculoSeleccionado?.tecnomecanica_vencimiento || null,
          snapshot_licencia_vencimiento: operadorSeleccionado?.licencia_vencimiento || null,
          snapshot_licencia_categoria: operadorSeleccionado?.licencia_categoria || null,
          // Firmas
          firma_inspector: firmaInspector,
          firma_operador: firmaOperador,
        })
        .select("id")
        .single()

      if (errorInspeccion) {
        toast.error("Error al crear la inspección")
        return
      }

      // Crear los items de inspección (filtrar items sin estado y EPP auxiliar si no hay auxiliar)
      const itemsToInsert = Object.values(items)
        .filter((item) => {
          // Filtrar items sin estado seleccionado
          if (!item.estado) {
            return false
          }
          // Filtrar EPP auxiliar si no hay auxiliar
          if (!formData.auxiliar_id) {
            const catalogoItem = itemsCatalogo.find((c) => c.id === item.item_catalogo_id)
            if (catalogoItem?.categoria === "epp_auxiliar") {
              return false
            }
          }
          return true
        })
        .map((item) => {
          // Obtener datos del catálogo para el snapshot
          const catalogoItem = itemsCatalogo.find((c) => c.id === item.item_catalogo_id)
          return {
            inspeccion_id: inspeccion.id,
            item_catalogo_id: item.item_catalogo_id,
            estado: item.estado,
            observacion: item.observacion || null,
            fotos: item.fotos.length > 0 ? item.fotos : null,
            foto_url: item.fotos.length > 0 ? item.fotos[0].url : null,  // Retrocompatibilidad
            // Snapshot del catálogo al momento de la inspección
            item_codigo: catalogoItem?.codigo || null,
            item_nombre: catalogoItem?.nombre || null,
            item_categoria: catalogoItem?.categoria || null,
            item_orden: catalogoItem?.orden ?? null,
          }
        })

      const { error: errorItems } = await supabase
        .from("parq_items_inspeccion")
        .insert(itemsToInsert)

      if (errorItems) {
        toast.error("Error al guardar los items de inspección")
        return
      }

      toast.success("Inspección registrada correctamente")
      router.push("/parqueadero/inspecciones")
      router.refresh()
    } catch {
      toast.error("Error al crear la inspección")
    } finally {
      setLoading(false)
    }
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos generales */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Generales</CardTitle>
          <CardDescription>Información básica de la inspección</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Vehículo *</Label>
            <Select
              value={formData.vehiculo_id}
              onValueChange={(value) => setFormData({ ...formData, vehiculo_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona vehículo" />
              </SelectTrigger>
              <SelectContent>
                {vehiculos.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.placa} - {v.marca} {v.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Operador *</Label>
            <Select
              value={formData.operador_id}
              onValueChange={(value) => setFormData({ ...formData, operador_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona operador" />
              </SelectTrigger>
              <SelectContent>
                {operadores.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    <div className="flex items-center gap-2">
                      <span>{capitalizeName(o.nombre_completo) || o.correo}</span>
                      {o.estado_licencia === "vencido" && (
                        <Badge variant="destructive" className="text-xs px-1">
                          Lic. vencida
                        </Badge>
                      )}
                      {o.estado_licencia === "por_vencer" && (
                        <Badge variant="outline" className="text-xs px-1 text-orange-600">
                          Lic. por vencer
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {operadorSeleccionado?.licencia_categoria && (
              <p className="text-xs text-muted-foreground">
                Licencia: {operadorSeleccionado.licencia_categoria}
                {operadorSeleccionado.licencia_numero && ` - ${operadorSeleccionado.licencia_numero}`}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Auxiliar</Label>
            <Select
              value={formData.auxiliar_id || "__none__"}
              onValueChange={(value) =>
                setFormData({ ...formData, auxiliar_id: value === "__none__" ? "" : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin auxiliar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin auxiliar</SelectItem>
                {auxiliares.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {capitalizeName(a.nombre_completo) || a.correo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Turno *</Label>
            <Select
              value={formData.turno}
              onValueChange={(value: "diurno" | "nocturno") =>
                setFormData({ ...formData, turno: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPCIONES_TURNO.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documentación - Fechas de vencimiento */}
      {(vehiculoSeleccionado || operadorSeleccionado) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-700">
                Documentación
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                (verificación automática)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* SOAT */}
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">SOAT</p>
                <p className={cn("font-medium", getEstadoDocumentoColor(vehiculoSeleccionado?.estado_soat))}>
                  {formatearFecha(vehiculoSeleccionado?.soat_vencimiento)}
                </p>
                {vehiculoSeleccionado?.estado_soat && (
                  <Badge
                    variant="outline"
                    className={cn("mt-1 text-xs", ESTADOS_DOCUMENTO[vehiculoSeleccionado.estado_soat]?.color)}
                  >
                    {ESTADOS_DOCUMENTO[vehiculoSeleccionado.estado_soat]?.label}
                  </Badge>
                )}
              </div>

              {/* Tecnomecánica */}
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Tecnomecánica</p>
                <p className={cn("font-medium", getEstadoDocumentoColor(vehiculoSeleccionado?.estado_tecnomecanica))}>
                  {formatearFecha(vehiculoSeleccionado?.tecnomecanica_vencimiento)}
                </p>
                {vehiculoSeleccionado?.estado_tecnomecanica && (
                  <Badge
                    variant="outline"
                    className={cn("mt-1 text-xs", ESTADOS_DOCUMENTO[vehiculoSeleccionado.estado_tecnomecanica]?.color)}
                  >
                    {ESTADOS_DOCUMENTO[vehiculoSeleccionado.estado_tecnomecanica]?.label}
                  </Badge>
                )}
              </div>

              {/* Licencia de conducción */}
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  Licencia {operadorSeleccionado?.licencia_categoria || ""}
                </p>
                <p className={cn("font-medium", getEstadoDocumentoColor(operadorSeleccionado?.estado_licencia))}>
                  {formatearFecha(operadorSeleccionado?.licencia_vencimiento)}
                </p>
                {operadorSeleccionado?.estado_licencia && (
                  <Badge
                    variant="outline"
                    className={cn("mt-1 text-xs", ESTADOS_DOCUMENTO[operadorSeleccionado.estado_licencia]?.color)}
                  >
                    {ESTADOS_DOCUMENTO[operadorSeleccionado.estado_licencia]?.label}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items de inspección por categoría */}
      {Object.entries(itemsPorCategoria).map(([categoria, itemsCategoria]) => {
        // Ocultar EPP auxiliar si no hay auxiliar seleccionado
        if (categoria === "epp_auxiliar" && !formData.auxiliar_id) {
          return null
        }
        const configCategoria = CATEGORIAS_ITEMS[categoria]
        return (
          <Card key={categoria}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={cn("px-2 py-1 rounded text-sm", configCategoria?.color)}>
                  {configCategoria?.label || categoria}
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  ({itemsCategoria.length} items)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {itemsCategoria.map((item) => {
                  const novedadPendiente = novedadesPorItem[item.id]
                  const resolucion = novedadPendiente ? novedadesResolucion[novedadPendiente.id] : null

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex flex-col gap-2 p-3 border rounded-lg",
                        novedadPendiente && !resolucion?.estado && "border-l-4",
                        novedadPendiente && !resolucion?.estado && novedadPendiente.estado === "malo" && "border-l-red-500 bg-red-50/30",
                        novedadPendiente && !resolucion?.estado && novedadPendiente.estado === "regular" && "border-l-yellow-500 bg-yellow-50/30",
                        novedadPendiente && resolucion?.estado === 'subsanado' && "border-l-4 border-l-green-500 bg-green-50/30",
                        novedadPendiente && resolucion?.estado === 'se_mantiene' && "border-l-4 border-l-yellow-500 bg-yellow-50/30",
                        novedadPendiente && resolucion?.estado === 'empeoro' && "border-l-4 border-l-red-600 bg-red-100/50"
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base">{item.nombre}</p>
                          {item.descripcion && (
                            <p className="text-xs text-muted-foreground">{item.descripcion}</p>
                          )}
                        </div>
                        {/* Solo mostrar botones de evaluación si NO hay novedad pendiente */}
                        {!novedadPendiente && (
                          <div className="flex gap-1 flex-shrink-0">
                            {(["bueno", "regular", "malo", "no_aplica"] as EstadoItem[]).map(
                              (estado) => {
                                const IconComponent = ESTADO_ITEM_ICONS[estado]
                                return (
                                  <Button
                                    key={estado}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                      "w-8 h-8 sm:w-10 sm:h-10 p-0",
                                      items[item.id]?.estado === estado && ESTADO_ITEM_COLORS[estado].bg
                                    )}
                                    onClick={() => handleEstadoChange(item.id, estado)}
                                  >
                                    <IconComponent className={cn("h-3 w-3 sm:h-4 sm:w-4", ESTADO_ITEM_COLORS[estado].icon)} />
                                  </Button>
                                )
                              }
                            )}
                          </div>
                        )}
                      </div>

                      {/* Novedad pendiente de inspección anterior - reemplaza la evaluación normal */}
                      {novedadPendiente && (
                        <div className={cn(
                          "p-3 rounded-lg border",
                          !resolucion?.estado && "bg-orange-50 border-orange-200",
                          resolucion?.estado === 'subsanado' && "bg-green-50 border-green-200",
                          resolucion?.estado === 'se_mantiene' && "bg-yellow-50 border-yellow-200",
                          resolucion?.estado === 'empeoro' && "bg-red-100 border-red-300"
                        )}>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              {novedadPendiente.estado === "malo" ? (
                                <XCircle className="h-4 w-4 text-red-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                              )}
                              <span className="font-medium">
                                Novedad anterior: {novedadPendiente.estado === "malo" ? "MALO" : "REGULAR"}
                              </span>
                              {novedadPendiente.observacion && (
                                <span className="text-muted-foreground">- {novedadPendiente.observacion}</span>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <span className="text-xs text-muted-foreground">¿Qué pasó?</span>
                              <div className="flex gap-1 flex-wrap">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className={cn(
                                    "text-xs h-7 px-2 sm:px-3",
                                    resolucion?.estado === 'subsanado' && "bg-green-100 border-green-500 text-green-700"
                                  )}
                                  onClick={() => handleResolucionChange(novedadPendiente.id, resolucion?.estado === 'subsanado' ? null : 'subsanado', item.id)}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  <span className="hidden sm:inline">Subsanado</span>
                                  <span className="sm:hidden">Ok</span>
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className={cn(
                                    "text-xs h-7 px-2 sm:px-3",
                                    resolucion?.estado === 'se_mantiene' && "bg-yellow-100 border-yellow-500 text-yellow-700"
                                  )}
                                  onClick={() => handleResolucionChange(novedadPendiente.id, resolucion?.estado === 'se_mantiene' ? null : 'se_mantiene', item.id)}
                                >
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  <span className="hidden sm:inline">Se mantiene</span>
                                  <span className="sm:hidden">Igual</span>
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className={cn(
                                    "text-xs h-7 px-2 sm:px-3",
                                    resolucion?.estado === 'empeoro' && "bg-red-100 border-red-500 text-red-700"
                                  )}
                                  onClick={() => handleResolucionChange(novedadPendiente.id, resolucion?.estado === 'empeoro' ? null : 'empeoro', item.id)}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  <span className="hidden sm:inline">Empeoró</span>
                                  <span className="sm:hidden">Peor</span>
                                </Button>
                              </div>
                            </div>
                            {resolucion?.estado && (
                              <Textarea
                                placeholder="Observación (opcional)"
                                value={resolucion.observacion || ""}
                                onChange={(e) => handleResolucionObsChange(novedadPendiente.id, e.target.value, item.id)}
                                className="text-sm"
                                rows={2}
                              />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Observación: ocultar si hay novedad pendiente con resolución (ya tiene su propio campo) */}
                      {(items[item.id]?.estado === "regular" ||
                        items[item.id]?.estado === "malo") &&
                        !(novedadPendiente && novedadesResolucion[novedadPendiente.id]?.estado) && (
                        <Textarea
                          placeholder="Observación (requerida para items regulares/malos)"
                          value={items[item.id]?.observacion || ""}
                          onChange={(e) => handleObservacionChange(item.id, e.target.value)}
                          className="text-sm"
                          rows={2}
                        />
                      )}

                      {/* Fotos de evidencia: siempre visibles para items regulares/malos */}
                      {(items[item.id]?.estado === "regular" ||
                        items[item.id]?.estado === "malo") && (
                        <div>
                          <VistaFotos
                            fotos={items[item.id]?.fotos || []}
                            onCapturar={() => setModalFoto(item.id)}
                            onEliminar={(index) => eliminarFoto(item.id, index)}
                            maxFotos={3}
                            size="sm"
                          />
                          {(items[item.id]?.fotos?.length || 0) === 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Agregar fotos de evidencia (hasta 3, opcional)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Observaciones generales */}
      <Card>
        <CardHeader>
          <CardTitle>Observaciones Generales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Observaciones adicionales de la inspección..."
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            rows={3}
          />
          <div>
            <Label className="mb-2 block">Fotos de Observaciones (hasta 5)</Label>
            <VistaFotos
              fotos={observacionesFotos}
              onCapturar={() => setModalFotoObservaciones(true)}
              onEliminar={(index) => {
                setObservacionesFotos(prev => prev.filter((_, i) => i !== index))
              }}
              maxFotos={5}
              size="md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Firmas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Firmas
          </CardTitle>
          <CardDescription>
            Capture las firmas del operador y del inspector
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="mb-2 block">Firma del Operador</Label>
              <VistaFirma
                firma={firmaOperador}
                label=""
                onCapturar={() => setModalFirma("operador")}
              />
              {firmaOperador && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-red-600"
                  onClick={() => setFirmaOperador(null)}
                >
                  Eliminar firma
                </Button>
              )}
            </div>
            <div>
              <Label className="mb-2 block">Firma del Inspector (usted)</Label>
              <VistaFirma
                firma={firmaInspector}
                label=""
                onCapturar={() => setModalFirma("inspector")}
              />
              {firmaInspector && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-red-600"
                  onClick={() => setFirmaInspector(null)}
                >
                  Eliminar firma
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modales de firma */}
      <CapturaFirma
        open={modalFirma === "operador"}
        onClose={() => setModalFirma(null)}
        onSave={(firma) => setFirmaOperador(firma)}
        titulo="Firma del Operador"
        descripcion={operadorSeleccionado ? `${capitalizeName(operadorSeleccionado.nombre_completo) || operadorSeleccionado.correo}` : "Operador"}
      />
      <CapturaFirma
        open={modalFirma === "inspector"}
        onClose={() => setModalFirma(null)}
        onSave={(firma) => setFirmaInspector(firma)}
        titulo="Firma del Inspector"
        descripcion="Su firma como inspector de la inspección"
      />

      {/* Modales de fotos */}
      <CapturaFoto
        open={modalFoto !== null}
        onClose={() => setModalFoto(null)}
        onSave={(fotos) => {
          if (modalFoto) {
            handleFotosChange(modalFoto, fotos)
          }
          setModalFoto(null)
        }}
        titulo="Fotos de Evidencia"
        descripcion="Capture hasta 3 fotos de la novedad encontrada"
        carpeta="inspecciones"
        maxFotos={3}
        fotosActuales={modalFoto ? items[modalFoto]?.fotos || [] : []}
      />

      <CapturaFoto
        open={modalFotoObservaciones}
        onClose={() => setModalFotoObservaciones(false)}
        onSave={(fotos) => {
          setObservacionesFotos(prev => [...prev, ...fotos])
          setModalFotoObservaciones(false)
        }}
        titulo="Fotos de Observaciones Generales"
        descripcion="Capture hasta 5 fotos adicionales para las observaciones"
        carpeta="inspecciones/observaciones"
        maxFotos={5}
        fotosActuales={observacionesFotos}
      />

      {/* Resumen y decisión APTO/NO APTO */}
      <Card className={!esApto ? "border-red-300" : "border-green-300"}>
        <CardContent className="py-4 space-y-4">
          {/* Progreso de evaluación */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progreso de evaluación</span>
              <span className={cn(
                porcentajeEvaluado === 100 ? "text-green-600" : "text-muted-foreground"
              )}>
                {itemsEvaluados} / {totalItems} items ({porcentajeEvaluado}%)
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  porcentajeEvaluado === 100 ? "bg-green-500" : "bg-blue-500"
                )}
                style={{ width: `${porcentajeEvaluado}%` }}
              />
            </div>
            {porcentajeEvaluado < 100 && (
              <p className="text-xs text-orange-600">
                Debes evaluar todos los items antes de guardar
              </p>
            )}
          </div>

          {/* Advertencias */}
          {(tieneDocumentosVencidos || tieneItemsMalos || tieneItemsRegulares || tieneNovedadesPendientes) && (
            <div className="space-y-2">
              {tieneDocumentosVencidos && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <XCircle className="h-4 w-4" />
                  <span className="font-medium">Documentos vencidos - NO APTO automático</span>
                </div>
              )}
              {tieneItemsMalos && (
                <div className="flex items-center gap-2 text-orange-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Hay items en estado MALO</span>
                </div>
              )}
              {tieneItemsRegulares && (
                <div className="flex items-center gap-2 text-yellow-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Hay items en estado REGULAR</span>
                </div>
              )}
              {tieneNovedadesPendientes && (
                <div className="flex items-center gap-2 text-orange-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Hay novedades pendientes de subsanar</span>
                </div>
              )}
            </div>
          )}

          {/* Selector APTO/NO APTO */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="font-medium text-sm sm:text-base">Resultado:</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={esApto ? "default" : "outline"}
                  size="sm"
                  className={cn(esApto && "bg-green-600 hover:bg-green-700")}
                  onClick={() => setEsAptoManual(true)}
                  disabled={tieneDocumentosVencidos}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  APTO
                </Button>
                <Button
                  type="button"
                  variant={!esApto ? "default" : "outline"}
                  size="sm"
                  className={cn(!esApto && "bg-red-600 hover:bg-red-700")}
                  onClick={() => setEsAptoManual(false)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  NO APTO
                </Button>
              </div>
            </div>
            <Button type="submit" disabled={loading || porcentajeEvaluado < 100} size="lg" className="w-full sm:w-auto">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Guardar Inspección
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
