"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { CATEGORIAS_ITEMS, ESTADOS_ITEM } from "@/lib/parqueadero/config"
import { ESTADO_ITEM_ICONS, ESTADO_ITEM_COLORS, type EstadoItem } from "@/lib/parqueadero/utils"
import { cn } from "@/lib/utils"

interface ItemNovedad {
  id: string
  estado: string
  observacion: string | null
  subsanado: boolean
  subsanado_observacion: string | null
  // Snapshot (datos al momento de la inspección)
  item_nombre: string | null
  item_categoria: string | null
  // Fallback al catálogo
  item_catalogo: {
    codigo: string
    nombre: string
    categoria: string
    descripcion: string | null
  } | null
}

// Helper para obtener datos del item (snapshot o catálogo como fallback)
function getItemData(item: ItemNovedad) {
  return {
    nombre: item.item_nombre || item.item_catalogo?.nombre || "Sin nombre",
    categoria: item.item_categoria || item.item_catalogo?.categoria || "otros",
  }
}

interface SeccionNovedadesProps {
  novedades: ItemNovedad[]
  inspeccionId: string
  esEditable: boolean
}

export function SeccionNovedades({ novedades, inspeccionId, esEditable }: SeccionNovedadesProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null) // id del item en proceso
  const [expandido, setExpandido] = useState<string | null>(null) // id del item con form abierto
  const [observaciones, setObservaciones] = useState<Record<string, string>>({})

  const novedadesPendientes = novedades.filter((n) => !n.subsanado)
  const novedadesSubsanadas = novedades.filter((n) => n.subsanado)

  const handleSubsanar = async (itemId: string) => {
    setLoading(itemId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("parq_items_inspeccion")
        .update({
          subsanado: true,
          subsanado_observacion: observaciones[itemId] || null,
        })
        .eq("id", itemId)

      if (error) throw error

      toast.success("Novedad subsanada")
      setExpandido(null)
      setObservaciones((prev) => { const next = { ...prev }; delete next[itemId]; return next })
      router.refresh()
    } catch {
      toast.error("Error al subsanar la novedad")
    } finally {
      setLoading(null)
    }
  }

  const handleDesmarcar = async (itemId: string) => {
    setLoading(itemId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("parq_items_inspeccion")
        .update({ subsanado: false, subsanado_observacion: null })
        .eq("id", itemId)

      if (error) throw error

      toast.success("Subsanación revertida")
      router.refresh()
    } catch {
      toast.error("Error al revertir la subsanación")
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className={cn(
      "border-2",
      novedadesPendientes.length > 0 ? "border-orange-300 bg-orange-50/30" : "border-green-300 bg-green-50/30"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn(
              "h-5 w-5",
              novedadesPendientes.length > 0 ? "text-orange-600" : "text-green-600"
            )} />
            <span>Novedades</span>
            <Badge variant={novedadesPendientes.length > 0 ? "destructive" : "default"}>
              {novedadesPendientes.length} pendiente{novedadesPendientes.length !== 1 && "s"}
            </Badge>
          </div>
          {novedadesSubsanadas.length > 0 && (
            <Badge variant="outline" className="bg-green-100 text-green-700">
              {novedadesSubsanadas.length} subsanada{novedadesSubsanadas.length !== 1 && "s"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Novedades pendientes */}
        {novedadesPendientes.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-orange-700">Pendientes de subsanar:</p>
            {novedadesPendientes.map((item) => {
              const itemData = getItemData(item)
              const categoriaConfig = CATEGORIAS_ITEMS[itemData.categoria]
              const estadoConfig = ESTADOS_ITEM[item.estado]
              const IconComponent = ESTADO_ITEM_ICONS[item.estado as EstadoItem]
              const esteExpandido = expandido === item.id

              return (
                <div
                  key={item.id}
                  className={cn(
                    "p-4 border rounded-lg bg-white",
                    item.estado === "malo" ? "border-red-300" : "border-yellow-300"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <IconComponent className={cn("h-5 w-5 mt-0.5", ESTADO_ITEM_COLORS[item.estado as EstadoItem]?.icon)} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{itemData.nombre}</p>
                          <Badge variant="outline" className={cn("text-xs", categoriaConfig?.color)}>
                            {categoriaConfig?.label || itemData.categoria}
                          </Badge>
                          <Badge variant="outline" className={cn("text-xs", estadoConfig?.color)}>
                            {estadoConfig?.label}
                          </Badge>
                        </div>
                        {item.observacion && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.observacion}
                          </p>
                        )}

                        {/* Formulario inline de subsanación */}
                        {esEditable && esteExpandido && (
                          <div className="mt-3 space-y-2">
                            <Textarea
                              placeholder="Observación de cierre (opcional)"
                              value={observaciones[item.id] || ""}
                              onChange={(e) =>
                                setObservaciones((prev) => ({ ...prev, [item.id]: e.target.value }))
                              }
                              rows={2}
                              className="text-sm"
                              disabled={loading === item.id}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSubsanar(item.id)}
                                disabled={loading === item.id}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {loading === item.id ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                )}
                                Confirmar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setExpandido(null)}
                                disabled={loading === item.id}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botón subsanar */}
                    {esEditable && !esteExpandido && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-700 border-green-300 hover:bg-green-50 flex-shrink-0"
                        onClick={() => setExpandido(item.id)}
                        disabled={loading === item.id}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Subsanar
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Novedades subsanadas */}
        {novedadesSubsanadas.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-green-700">Subsanadas:</p>
            {novedadesSubsanadas.map((item) => {
              const itemData = getItemData(item)
              const categoriaConfig = CATEGORIAS_ITEMS[itemData.categoria]

              return (
                <div
                  key={item.id}
                  className="p-3 border border-green-200 rounded-lg bg-green-50/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{itemData.nombre}</p>
                          <Badge variant="outline" className={cn("text-xs", categoriaConfig?.color)}>
                            {categoriaConfig?.label || itemData.categoria}
                          </Badge>
                        </div>
                        {item.subsanado_observacion && (
                          <p className="text-sm text-green-700 mt-1">
                            {item.subsanado_observacion}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Botón desmarcar */}
                    {esEditable && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        onClick={() => handleDesmarcar(item.id)}
                        disabled={loading === item.id}
                      >
                        {loading === item.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Mensaje si todo está subsanado */}
        {novedadesPendientes.length === 0 && novedadesSubsanadas.length > 0 && (
          <p className="text-sm text-green-700 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Todas las novedades han sido subsanadas
          </p>
        )}
      </CardContent>
    </Card>
  )
}
