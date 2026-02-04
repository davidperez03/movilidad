import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  ArrowLeft,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react"
import { TIPOS_VEHICULO, ESTADOS_DOCUMENTO } from "@/lib/parqueadero/config"
import { formatearFecha, formatearFechaCorta, formatearHora } from "@/lib/parqueadero/utils"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function VehiculoDetallePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Obtener el vehículo
  const { data: vehiculo } = await supabase
    .from("parq_vista_vehiculos")
    .select("*")
    .eq("id", id)
    .single()

  if (!vehiculo) {
    notFound()
  }

  // Obtener últimas inspecciones
  const { data: inspecciones } = await supabase
    .from("parq_vista_inspecciones")
    .select("*")
    .eq("vehiculo_id", id)
    .order("fecha", { ascending: false })
    .order("hora", { ascending: false })
    .limit(10)

  const tipoConfig = TIPOS_VEHICULO[vehiculo.tipo]
  const soatConfig = ESTADOS_DOCUMENTO[vehiculo.estado_soat]
  const tecnoConfig = ESTADOS_DOCUMENTO[vehiculo.estado_tecnomecanica]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/parqueadero/vehiculos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight font-mono">
              {vehiculo.placa}
            </h1>
            <Badge variant={vehiculo.activo ? "default" : "secondary"}>
              {vehiculo.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {vehiculo.marca} {vehiculo.modelo}
          </p>
        </div>
        <Badge variant="outline" className={tipoConfig?.color}>
          {tipoConfig?.label || vehiculo.tipo}
        </Badge>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-cyan-100 p-2">
              <Truck className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="font-semibold">{tipoConfig?.label || vehiculo.tipo}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inspecciones</p>
              <p className="font-semibold">{vehiculo.total_inspecciones}</p>
            </div>
          </CardContent>
        </Card>

        <Card className={soatConfig?.color ? "border-l-4 border-l-current" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SOAT</p>
                {vehiculo.soat_vencimiento ? (
                  <>
                    <p className="font-semibold">
                      {formatearFechaCorta(vehiculo.soat_vencimiento)}
                    </p>
                    <Badge variant="outline" className={soatConfig?.color}>
                      {soatConfig?.label}
                    </Badge>
                  </>
                ) : (
                  <p className="text-muted-foreground">No registrado</p>
                )}
              </div>
              {vehiculo.estado_soat === "vencido" && (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
            </div>
            {vehiculo.soat_aseguradora && (
              <p className="text-xs text-muted-foreground mt-1">
                {vehiculo.soat_aseguradora}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className={tecnoConfig?.color ? "border-l-4 border-l-current" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tecnomecánica</p>
                {vehiculo.tecnomecanica_vencimiento ? (
                  <>
                    <p className="font-semibold">
                      {formatearFechaCorta(vehiculo.tecnomecanica_vencimiento)}
                    </p>
                    <Badge variant="outline" className={tecnoConfig?.color}>
                      {tecnoConfig?.label}
                    </Badge>
                  </>
                ) : (
                  <p className="text-muted-foreground">No registrado</p>
                )}
              </div>
              {vehiculo.estado_tecnomecanica === "vencido" && (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historial de inspecciones */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Inspecciones</CardTitle>
        </CardHeader>
        <CardContent>
          {inspecciones && inspecciones.length > 0 ? (
            <div className="space-y-3">
              {inspecciones.map((inspeccion) => (
                <Link
                  key={inspeccion.id}
                  href={`/parqueadero/inspecciones/${inspeccion.id}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full p-1 ${
                        inspeccion.es_apto ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      {inspeccion.es_apto ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {formatearFecha(inspeccion.fecha)} - {formatearHora(inspeccion.hora)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Operador: {inspeccion.operador_nombre}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-right">
                      <span className="text-green-600">{inspeccion.items_buenos}B</span>{" "}
                      <span className="text-yellow-600">{inspeccion.items_regulares}R</span>{" "}
                      <span className="text-red-600">{inspeccion.items_malos}M</span>
                    </div>
                    <Badge variant={inspeccion.es_apto ? "default" : "destructive"}>
                      {inspeccion.es_apto ? "Apto" : "No Apto"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No hay inspecciones registradas para este vehículo
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
