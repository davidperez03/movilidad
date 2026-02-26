import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  User,
  Calendar,
  Clock,
  FileText,
  Shield,
  PenTool,
  Camera,
} from "lucide-react"
import { TURNOS, CATEGORIAS_ITEMS, ESTADOS_ITEM, ESTADOS_DOCUMENTO } from "@/lib/parqueadero/config"
import { formatearFecha, formatearFechaLarga, formatearFechaHora, formatearFechaCorta, formatearHora, ESTADO_ITEM_ICONS, ESTADO_ITEM_COLORS, type EstadoItem } from "@/lib/parqueadero/utils"
import { formatearTimestampParaImagen } from "@/lib/parqueadero/procesamiento-imagen"
import type { FotoConTimestamp } from "@/lib/parqueadero/types"
import { SeccionNovedades } from "@/components/parqueadero/inspecciones/seccion-novedades"
import { BotonDescargarInspeccion } from "@/components/parqueadero/inspecciones/boton-descargar-inspeccion"
import { cn } from "@/lib/utils"
import { capitalizeName } from "@/lib/utils/capitalize"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InspeccionDetallePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: inspeccion } = await supabase
    .from("parq_vista_inspecciones")
    .select("*")
    .eq("id", id)
    .single()

  if (!inspeccion) {
    notFound()
  }

  // Obtener firmas
  const { data: firmas } = await supabase
    .from("parq_inspecciones")
    .select("firma_inspector, firma_operador")
    .eq("id", id)
    .single()

  const { data: itemsInspeccion } = await supabase
    .from("parq_items_inspeccion")
    .select(`
      *,
      item_catalogo:parq_items_catalogo (
        codigo,
        nombre,
        categoria,
        descripcion,
        orden
      )
    `)
    .eq("inspeccion_id", id)

  type ItemInspeccionConCatalogo = NonNullable<typeof itemsInspeccion>[number]

  // Helper para obtener datos del item (snapshot o catálogo como fallback)
  const getItemData = (item: ItemInspeccionConCatalogo) => {
    const catalogo = item.item_catalogo as { nombre?: string; categoria?: string; orden?: number } | null
    return {
      nombre: item.item_nombre || catalogo?.nombre || "Sin nombre",
      categoria: item.item_categoria || catalogo?.categoria || "otros",
      orden: item.item_orden ?? catalogo?.orden ?? 0,
    }
  }

  // Separar novedades (regular/malo)
  const novedades = (itemsInspeccion || []).filter(
    (item) => item.estado === "regular" || item.estado === "malo"
  )

  // Agrupar items por categoría y ordenar por el campo orden (snapshot o catálogo)
  const itemsPorCategoria = (itemsInspeccion || [])
    .sort((a, b) => getItemData(a).orden - getItemData(b).orden)
    .reduce((acc, item) => {
      const categoria = getItemData(item).categoria
      if (!acc[categoria]) {
        acc[categoria] = []
      }
      acc[categoria].push(item)
      return acc
    }, {} as Record<string, ItemInspeccionConCatalogo[]>)


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/parqueadero/inspecciones">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Inspección - {inspeccion.placa}
          </h1>
          <p className="text-muted-foreground">
            {formatearFechaLarga(inspeccion.fecha)}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
          <BotonDescargarInspeccion
            inspeccionId={id}
            placa={inspeccion.placa}
            variant="outline"
            className="w-full sm:w-auto"
          />
          <Badge
            variant={inspeccion.es_apto ? "default" : "destructive"}
            className="text-base sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2 justify-center"
          >
            {inspeccion.es_apto ? (
              <>
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                APTO
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                NO APTO
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Info general - 4 cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-cyan-100 p-2">
              <Truck className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vehículo</p>
              <p className="font-semibold">{inspeccion.placa}</p>
              <p className="text-xs text-muted-foreground">
                {inspeccion.marca} {inspeccion.modelo}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Operador</p>
              <p className="font-semibold">{capitalizeName(inspeccion.operador_nombre)}</p>
              {inspeccion.auxiliar_nombre && (
                <p className="text-xs text-muted-foreground">
                  Aux: {capitalizeName(inspeccion.auxiliar_nombre)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p className="font-semibold">
                {formatearFechaCorta(inspeccion.fecha)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hora / Turno</p>
              <p className="font-semibold">{formatearHora(inspeccion.hora)}</p>
              {inspeccion.turno && (
                <Badge variant="outline" className={TURNOS[inspeccion.turno]?.color}>
                  {TURNOS[inspeccion.turno]?.label}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documentación */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5" />
            Documentación al momento de la inspección
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">SOAT</p>
              <p className="font-medium">{formatearFecha(inspeccion.soat_vencimiento)}</p>
              {inspeccion.estado_soat && (
                <Badge
                  variant="outline"
                  className={cn("mt-1 text-xs", ESTADOS_DOCUMENTO[inspeccion.estado_soat]?.color)}
                >
                  {ESTADOS_DOCUMENTO[inspeccion.estado_soat]?.label}
                </Badge>
              )}
            </div>

            <div className="p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Tecnomecánica</p>
              <p className="font-medium">{formatearFecha(inspeccion.tecnomecanica_vencimiento)}</p>
              {inspeccion.estado_tecnomecanica && (
                <Badge
                  variant="outline"
                  className={cn("mt-1 text-xs", ESTADOS_DOCUMENTO[inspeccion.estado_tecnomecanica]?.color)}
                >
                  {ESTADOS_DOCUMENTO[inspeccion.estado_tecnomecanica]?.label}
                </Badge>
              )}
            </div>

            <div className="p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Licencia {inspeccion.operador_licencia_categoria || ""}
              </p>
              <p className="font-medium">{formatearFecha(inspeccion.operador_licencia_vencimiento)}</p>
              {inspeccion.operador_estado_licencia && (
                <Badge
                  variant="outline"
                  className={cn("mt-1 text-xs", ESTADOS_DOCUMENTO[inspeccion.operador_estado_licencia]?.color)}
                >
                  {ESTADOS_DOCUMENTO[inspeccion.operador_estado_licencia]?.label}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Novedades - solo si hay */}
      {novedades.length > 0 && (
        <SeccionNovedades
          novedades={novedades}
          inspeccionId={id}
          esApto={inspeccion.es_apto}
        />
      )}

      {/* Resumen de items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5" />
            Resumen de Verificación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <div className="flex items-center gap-2 min-w-[140px]">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-xl sm:text-2xl font-bold text-green-600">
                {inspeccion.items_buenos}
              </span>
              <span className="text-sm sm:text-base text-muted-foreground">Buenos</span>
            </div>
            <div className="flex items-center gap-2 min-w-[140px]">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <span className="text-xl sm:text-2xl font-bold text-yellow-600">
                {inspeccion.items_regulares}
              </span>
              <span className="text-sm sm:text-base text-muted-foreground">Regulares</span>
            </div>
            <div className="flex items-center gap-2 min-w-[140px]">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <span className="text-xl sm:text-2xl font-bold text-red-600">
                {inspeccion.items_malos}
              </span>
              <span className="text-sm sm:text-base text-muted-foreground">Malos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items por categoría */}
      {Object.keys(itemsPorCategoria)
        .sort((a, b) => {
          const ordenA = getItemData(itemsPorCategoria[a][0]).orden
          const ordenB = getItemData(itemsPorCategoria[b][0]).orden
          return ordenA - ordenB
        })
        .map((categoria) => {
        const items = itemsPorCategoria[categoria]
        const configCategoria = CATEGORIAS_ITEMS[categoria]
        return (
          <Card key={categoria}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <span className={cn("px-2 py-1 rounded text-sm", configCategoria?.color)}>
                  {configCategoria?.label || categoria}
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  ({items.length} items)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item: ItemInspeccionConCatalogo) => {
                  const itemData = getItemData(item)
                  const estadoConfig = ESTADOS_ITEM[item.estado]
                  const esNovedad = item.estado === "regular" || item.estado === "malo"
                  const IconComponent = ESTADO_ITEM_ICONS[item.estado as EstadoItem]
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-start justify-between p-3 border rounded-lg",
                        esNovedad && !item.subsanado && "border-l-4",
                        item.estado === "malo" && !item.subsanado && "border-l-red-500 bg-red-50/50",
                        item.estado === "regular" && !item.subsanado && "border-l-yellow-500 bg-yellow-50/50",
                        item.subsanado && "bg-green-50/30"
                      )}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <IconComponent className={cn("h-4 w-4 mt-0.5", ESTADO_ITEM_COLORS[item.estado as EstadoItem]?.icon)} />
                        <div className="flex-1">
                          <p className="font-medium">{itemData.nombre}</p>
                          {item.observacion && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.observacion}
                            </p>
                          )}
                          {item.subsanado && (
                            <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Subsanado{item.subsanado_observacion && `: ${item.subsanado_observacion}`}
                            </p>
                          )}
                          {/* Fotos de evidencia múltiples */}
                          {item.fotos && Array.isArray(item.fotos) && item.fotos.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground mb-2">Evidencia:</p>
                              <div className="flex flex-wrap gap-2">
                                {item.fotos.map((foto: FotoConTimestamp, index: number) => (
                                  <div key={index} className="relative">
                                    <a href={foto.url} target="_blank" rel="noopener noreferrer">
                                      <div className="relative">
                                        <img
                                          src={foto.url}
                                          alt={`Evidencia ${index + 1}`}
                                          className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded border hover:opacity-80 transition-opacity"
                                        />
                                        {foto.origen && (
                                          <span
                                            className={`absolute bottom-0 left-0 right-0 text-center text-[8px] font-bold py-0.5 rounded-b text-white ${
                                              foto.origen === 'camera'
                                                ? 'bg-green-600/85'
                                                : 'bg-orange-600/85'
                                            }`}
                                          >
                                            {foto.origen === 'camera' ? 'Camara' : 'Galeria'}
                                          </span>
                                        )}
                                      </div>
                                    </a>
                                    {foto.timestamp && (
                                      <p className="text-xs text-muted-foreground text-center mt-1">
                                        {formatearTimestampParaImagen(foto.timestamp)}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Retrocompatibilidad: mostrar foto_url si fotos está vacío */}
                          {(!item.fotos || item.fotos.length === 0) && item.foto_url && (
                            <div className="mt-2">
                              <a href={item.foto_url} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={item.foto_url}
                                  alt="Evidencia"
                                  className="h-16 w-16 object-cover rounded border hover:opacity-80 transition-opacity"
                                />
                              </a>
                            </div>
                          )}

                          {/* Foto de subsanación */}
                          {item.subsanado_foto_url && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground mb-1">Subsanación:</p>
                              <a href={item.subsanado_foto_url} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={item.subsanado_foto_url}
                                  alt="Subsanación"
                                  className="h-16 w-16 object-cover rounded border border-green-300 hover:opacity-80 transition-opacity"
                                />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.subsanado && (
                          <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">
                            Subsanado
                          </Badge>
                        )}
                        <Badge variant="outline" className={estadoConfig?.color}>
                          {estadoConfig?.label}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Observaciones generales con fotos */}
      {(inspeccion.observaciones || inspeccion.observaciones_fotos) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Observaciones Generales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inspeccion.observaciones && (
              <p className="text-muted-foreground">{inspeccion.observaciones}</p>
            )}
            {inspeccion.observaciones_fotos && Array.isArray(inspeccion.observaciones_fotos) && inspeccion.observaciones_fotos.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Fotos adjuntas:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {inspeccion.observaciones_fotos.map((foto: FotoConTimestamp, index: number) => (
                    <div key={index}>
                      <a href={foto.url} target="_blank" rel="noopener noreferrer">
                        <div className="relative">
                          <img
                            src={foto.url}
                            alt={`Observacion ${index + 1}`}
                            className="w-full h-24 sm:h-32 object-cover rounded-lg border hover:opacity-80 transition-opacity"
                          />
                          {foto.origen && (
                            <span
                              className={`absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold py-0.5 rounded-b-lg text-white ${
                                foto.origen === 'camera'
                                  ? 'bg-green-600/85'
                                  : 'bg-orange-600/85'
                              }`}
                            >
                              {foto.origen === 'camera' ? 'Camara' : 'Galeria'}
                            </span>
                          )}
                        </div>
                      </a>
                      {foto.timestamp && (
                        <p className="text-xs text-muted-foreground text-center mt-1">
                          {formatearTimestampParaImagen(foto.timestamp)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Firmas */}
      {(firmas?.firma_operador || firmas?.firma_inspector) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <PenTool className="h-5 w-5" />
              Firmas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="text-center">
                {firmas?.firma_operador ? (
                  <div className="border rounded-lg p-4 bg-white">
                    <img
                      src={firmas.firma_operador}
                      alt="Firma del operador"
                      className="max-h-24 mx-auto"
                    />
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-gray-50 h-24 flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Sin firma</span>
                  </div>
                )}
                <div className="mt-2 pt-2 border-t">
                  <p className="font-medium">{capitalizeName(inspeccion.operador_nombre)}</p>
                  <p className="text-xs text-muted-foreground">Operador</p>
                </div>
              </div>
              <div className="text-center">
                {firmas?.firma_inspector ? (
                  <div className="border rounded-lg p-4 bg-white">
                    <img
                      src={firmas.firma_inspector}
                      alt="Firma del inspector"
                      className="max-h-24 mx-auto"
                    />
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-gray-50 h-24 flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Sin firma</span>
                  </div>
                )}
                <div className="mt-2 pt-2 border-t">
                  <p className="font-medium">{capitalizeName(inspeccion.inspector_nombre)}</p>
                  <p className="text-xs text-muted-foreground">Inspector</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inspector */}
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">
            Inspección realizada por{" "}
            <span className="font-medium">{capitalizeName(inspeccion.inspector_nombre)}</span> el{" "}
            {formatearFechaHora(inspeccion.creado_en)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
