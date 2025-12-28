import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRightLeft, ArrowDownToLine, Calendar, MapPin, FileText, AlertTriangle } from "lucide-react"
import { BadgeEstadoProceso } from "@/components/movilidad/badge-estado-proceso"
import { BadgeVencimiento } from "@/components/movilidad/badge-vencimiento"
import { BotonDescargarRemision } from "@/components/movilidad/boton-descargar-remision"
import { formatDateShort, formatDateForDisplay } from "@/lib/utils"
import { calcularDiasRestantes } from "@/lib/movilidad/formatters"

interface ProcesoCardProps {
  proceso: any
  tipoProceso: "traslado" | "radicacion"
  esCompletado?: boolean
}

export function ProcesoCard({ proceso, tipoProceso, esCompletado = false }: ProcesoCardProps) {
  const Icono = tipoProceso === "traslado" ? ArrowRightLeft : ArrowDownToLine
  const etiquetaOrganismo = tipoProceso === "traslado" ? "Destino" : "Origen"

  const diasRestantes = !esCompletado ? calcularDiasRestantes(proceso.fecha_vencimiento) : null

  return (
    <Card className={!esCompletado ? "hover:shadow-md transition-shadow" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Icono className="h-5 w-5" />
              {proceso.mov_cuentas_vehiculos?.placa}
            </CardTitle>
            <CardDescription>
              {proceso.mov_cuentas_vehiculos?.numero_cuenta}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <BadgeEstadoProceso estado={proceso.estado} tipoProceso={tipoProceso} />
            {!esCompletado && <BadgeVencimiento fechaVencimiento={proceso.fecha_vencimiento} />}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4 mb-4">
          <div className={!esCompletado ? "flex items-center gap-2" : ""}>
            {!esCompletado && <MapPin className="h-4 w-4 text-muted-foreground" />}
            <div>
              <p className="text-sm text-muted-foreground">{etiquetaOrganismo}</p>
              <p className="font-medium">{proceso.organismo?.nombre || 'Sin información'}</p>
            </div>
          </div>
          <div className={!esCompletado ? "flex items-center gap-2" : ""}>
            {!esCompletado && <Calendar className="h-4 w-4 text-muted-foreground" />}
            <div>
              <p className="text-sm text-muted-foreground">Fecha trámite</p>
              <p className="font-medium">
                {formatDateForDisplay(proceso.fecha_tramite)}
              </p>
            </div>
          </div>
          {!esCompletado ? (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Vencimiento</p>
                <p className={`font-medium ${diasRestantes && diasRestantes < 7 ? "text-orange-600" : ""}`}>
                  {formatDateForDisplay(proceso.fecha_vencimiento)}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">Completado</p>
              <p className="font-medium">
                {proceso.fecha_completado
                  ? formatDateShort(proceso.fecha_completado)
                  : "N/A"}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">{!esCompletado ? "Creado por" : "Responsable"}</p>
            <p className="font-medium">{proceso.perfiles?.nombre_completo || 'Sin información'}</p>
          </div>
        </div>
        {proceso.observaciones && !esCompletado && (
          <div className="mb-4 p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground mb-1">Observaciones:</p>
            <p className="text-sm">{proceso.observaciones}</p>
          </div>
        )}
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/movilidad/vehiculos/${proceso.mov_cuentas_vehiculos?.placa}`}>
              <FileText className="h-4 w-4 mr-2" />
              Ver Detalle
            </Link>
          </Button>
          {tipoProceso === "traslado" && (proceso.estado === "enviado_organismo" || proceso.estado === "trasladado") && (
            <BotonDescargarRemision
              trasladoId={proceso.id}
              placa={proceso.mov_cuentas_vehiculos?.placa || ""}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
