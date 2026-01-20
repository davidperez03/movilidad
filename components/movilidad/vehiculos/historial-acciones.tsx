import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, User, Calendar } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { formatearEstadoProceso } from "@/lib/movilidad/formatters"
import type { HistorialAccion } from "@/lib/movilidad/types"

interface HistorialAccionesProps {
  acciones: HistorialAccion[]
}

export function HistorialAcciones({ acciones }: HistorialAccionesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historial de Acciones
        </CardTitle>
        <CardDescription>
          Registro cronológico de todas las acciones realizadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {acciones.length > 0 ? (
          <div className="space-y-2">
            {acciones.map((accion) => {
              const esDevolucion = accion.accion === "proceso_devuelto" || accion.estado_nuevo === "devuelto"
              return (
                <div
                  key={accion.id}
                  className={`flex items-start gap-3 p-3 rounded-md ${
                    esDevolucion
                      ? "bg-red-50 border border-red-200"
                      : "bg-muted"
                  }`}
                >
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      esDevolucion ? "text-red-900" : ""
                    }`}>
                      {formatearEstadoProceso(accion.accion)}
                    </p>
                    {accion.estado_anterior && accion.estado_nuevo && (
                      <p className={`text-xs ${
                        esDevolucion ? "text-red-700" : "text-muted-foreground"
                      }`}>
                        {formatearEstadoProceso(accion.estado_anterior)} → {formatearEstadoProceso(accion.estado_nuevo)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <User className={`h-3 w-3 ${
                        esDevolucion ? "text-red-600" : "text-muted-foreground"
                      }`} />
                      <span className={`text-xs ${
                        esDevolucion ? "text-red-700" : "text-muted-foreground"
                      }`}>
                        {accion.responsable?.nombre_completo}
                      </span>
                      <span className={`text-xs ${
                        esDevolucion ? "text-red-700" : "text-muted-foreground"
                      }`}>•</span>
                      <Calendar className={`h-3 w-3 ${
                        esDevolucion ? "text-red-600" : "text-muted-foreground"
                      }`} />
                      <span className={`text-xs ${
                        esDevolucion ? "text-red-700" : "text-muted-foreground"
                      }`}>
                        {formatDateTime(accion.creado_en)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay acciones registradas
          </p>
        )}
      </CardContent>
    </Card>
  )
}
