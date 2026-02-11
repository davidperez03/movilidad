import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Car, ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import {
  obtenerCuentaVehiculo,
  obtenerProcesoActivo,
  obtenerHistorialTraslados,
  obtenerHistorialRadicaciones,
  obtenerNovedadesProceso,
  obtenerHistorialAcciones,
} from "@/lib/movilidad/server/detalle-vehiculo"
import { InformacionCuenta } from "@/components/movilidad/vehiculos/informacion-cuenta"
import { ProcesoActivo } from "@/components/movilidad/vehiculos/proceso-activo"
import { HistorialProcesos } from "@/components/movilidad/vehiculos/historial-procesos"
import { HistorialAcciones } from "@/components/movilidad/vehiculos/historial-acciones"

export default async function DetalleVehiculoPage({
  params,
}: {
  params: Promise<{ placa: string }>
}) {
  const { placa } = await params

  // Obtener datos del vehículo
  let cuenta
  try {
    cuenta = await obtenerCuentaVehiculo(placa)
  } catch {
    notFound()
  }

  // Obtener todos los datos en paralelo
  const [procesoActivo, traslados, radicaciones, historial] = await Promise.all([
    obtenerProcesoActivo(cuenta.id),
    obtenerHistorialTraslados(cuenta.id),
    obtenerHistorialRadicaciones(cuenta.id),
    obtenerHistorialAcciones(cuenta.id),
  ])

  // Obtener novedades si hay proceso activo
  const novedades = procesoActivo?.proceso_id
    ? await obtenerNovedadesProceso(
        procesoActivo.proceso_id,
        procesoActivo.proceso_tipo as 'traslado' | 'radicacion'
      )
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/movilidad/cuentas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Car className="h-8 w-8" />
              <span className="font-plate">{cuenta.placa}</span>
            </h1>
            <p className="text-muted-foreground">
              Cuenta: {cuenta.numero_cuenta}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-lg py-2 px-4">
          {cuenta.tipo_servicio === "particular" && "Particular"}
          {cuenta.tipo_servicio === "publico" && "Público"}
          {cuenta.tipo_servicio === "otro" && "Otro"}
        </Badge>
      </div>

      {/* Información de la cuenta */}
      <InformacionCuenta cuenta={cuenta} />

      {/* Proceso activo */}
      <ProcesoActivo proceso={procesoActivo} novedades={novedades} placa={placa} />

      {/* Historial de procesos */}
      <HistorialProcesos
        traslados={traslados}
        radicaciones={radicaciones}
        placa={placa}
      />

      {/* Historial de acciones */}
      <HistorialAcciones acciones={historial} />
    </div>
  )
}
