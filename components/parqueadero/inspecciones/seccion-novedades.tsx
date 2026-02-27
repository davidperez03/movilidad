import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle } from "lucide-react"
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
}

export function SeccionNovedades({ novedades }: SeccionNovedadesProps) {

  const novedadesPendientes = novedades.filter((n) => !n.subsanado)
  const novedadesSubsanadas = novedades.filter((n) => n.subsanado)


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
                      <IconComponent className={cn("h-5 w-5", ESTADO_ITEM_COLORS[item.estado as EstadoItem]?.icon)} />
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
                      </div>
                    </div>
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
