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

  let cuenta
  try {
    cuenta = await obtenerCuentaVehiculo(placa)
  } catch {
    notFound()
  }

  const [procesoActivo, traslados, radicaciones, historial] = await Promise.all([
    obtenerProcesoActivo(cuenta.id),
    obtenerHistorialTraslados(cuenta.id),
    obtenerHistorialRadicaciones(cuenta.id),
    obtenerHistorialAcciones(cuenta.id),
  ])

  const novedades = procesoActivo?.proceso_id
    ? await obtenerNovedadesProceso(
        procesoActivo.proceso_id,
        procesoActivo.proceso_tipo as 'traslado' | 'radicacion'
      )
    : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/movilidad/cuentas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Car className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="font-plate">{cuenta.placa}</span>
            </h1>
            <p className="text-muted-foreground">Cuenta: {cuenta.numero_cuenta}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm sm:text-lg py-1 sm:py-2 px-3 sm:px-4 w-fit">
          {cuenta.tipo_servicio === "particular" && "Particular"}
          {cuenta.tipo_servicio === "publico" && "Público"}
          {cuenta.tipo_servicio === "otro" && "Otro"}
        </Badge>
      </div>

      <InformacionCuenta cuenta={cuenta} />
      <ProcesoActivo proceso={procesoActivo} novedades={novedades} placa={placa} />
      <HistorialProcesos traslados={traslados} radicaciones={radicaciones} placa={placa} />
      <HistorialAcciones acciones={historial} />
    </div>
  )
}
