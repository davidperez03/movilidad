import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRightLeft, ArrowDownToLine } from "lucide-react"
import { ItemTraslado } from "./item-traslado"
import { ItemRadicacion } from "./item-radicacion"
import type { TrasladoHistorial, RadicacionHistorial } from "@/lib/movilidad/types"

interface HistorialProcesosProps {
  traslados: TrasladoHistorial[]
  radicaciones: RadicacionHistorial[]
  placa: string
}

export function HistorialProcesos({ traslados, radicaciones, placa }: HistorialProcesosProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Traslados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Historial de Traslados ({traslados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {traslados.length > 0 ? (
            <div className="space-y-3">
              {traslados.map((traslado) => (
                <ItemTraslado key={traslado.id} traslado={traslado} placa={placa} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay traslados registrados
            </p>
          )}
        </CardContent>
      </Card>

      {/* Radicaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5" />
            Historial de Radicaciones ({radicaciones.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {radicaciones.length > 0 ? (
            <div className="space-y-3">
              {radicaciones.map((radicacion) => (
                <ItemRadicacion key={radicacion.id} radicacion={radicacion} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay radicaciones registradas
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
