import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Car,
  FileText,
  ArrowRightLeft,
  ArrowDownToLine,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
} from "lucide-react"
import { notFound } from "next/navigation"
import { AgregarNovedad } from "@/components/movilidad/agregar-novedad"
import { CambiarEstado } from "@/components/movilidad/cambiar-estado"
import { ResolverNovedad } from "@/components/movilidad/resolver-novedad"

export default async function DetalleVehiculoPage({
  params,
}: {
  params: Promise<{ placa: string }>
}) {
  const supabase = await createClient()
  const { placa } = await params

  // Obtener cuenta del vehículo
  const { data: cuenta, error: errorCuenta } = await supabase
    .from("cuentas_vehiculos")
    .select(`
      *,
      creador:creado_por (
        nombre_completo,
        correo
      )
    `)
    .eq("placa", placa.toUpperCase())
    .single()

  if (errorCuenta || !cuenta) {
    notFound()
  }

  // Obtener proceso activo
  const { data: procesoActivoData } = await supabase
    .from("vista_proceso_activo")
    .select("*")
    .eq("cuenta_id", cuenta.id)
    .single()

  // Si hay proceso activo, obtener detalles completos con usuarios
  let procesoActivo = procesoActivoData
  if (procesoActivoData?.proceso_id) {
    const tabla = procesoActivoData.proceso_tipo === "traslado" ? "traslados" : "radicaciones"
    const { data: procesoDetalle } = await supabase
      .from(tabla)
      .select(`
        *,
        creador:creado_por (nombre_completo),
        actualizador:actualizado_por (nombre_completo)
      `)
      .eq("id", procesoActivoData.proceso_id)
      .single()

    if (procesoDetalle) {
      procesoActivo = { ...procesoActivoData, ...procesoDetalle }
    }
  }

  // Obtener historial de traslados
  const { data: traslados } = await supabase
    .from("traslados")
    .select(`
      *,
      creador:creado_por (nombre_completo),
      actualizador:actualizado_por (nombre_completo)
    `)
    .eq("cuenta_id", cuenta.id)
    .order("creado_en", { ascending: false })

  // Obtener historial de radicaciones
  const { data: radicaciones } = await supabase
    .from("radicaciones")
    .select(`
      *,
      creador:creado_por (nombre_completo),
      actualizador:actualizado_por (nombre_completo)
    `)
    .eq("cuenta_id", cuenta.id)
    .order("creado_en", { ascending: false })

  // Obtener novedades del proceso activo
  let novedadesActivas: any[] = []
  if (procesoActivo?.proceso_id) {
    const { data: novedades } = await supabase
      .from("novedades")
      .select(`
        *,
        creador:creado_por (nombre_completo),
        resolutor:resuelta_por (nombre_completo)
      `)
      .eq("proceso_tipo", procesoActivo.proceso_tipo)
      .eq("proceso_id", procesoActivo.proceso_id)
      .order("creado_en", { ascending: false })

    novedadesActivas = novedades || []
  }

  // Obtener historial de acciones
  const { data: historial } = await supabase
    .from("historial_acciones")
    .select(`
      *,
      responsable:realizado_por (nombre_completo)
    `)
    .eq("cuenta_id", cuenta.id)
    .order("creado_en", { ascending: false })
    .limit(20)

  const formatearEstado = (estado: string) => {
    return estado.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const formatearCiudad = (ciudad: string) => {
    return ciudad.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const formatearAccion = (accion: string) => {
    return accion.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const calcularDiasRestantes = (fechaVencimiento: string) => {
    const hoy = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const diferencia = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    return diferencia
  }

  return (
    <div className="space-y-6">
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
              {cuenta.placa}
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
      <Card>
        <CardHeader>
          <CardTitle>Información de la Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Creado por</p>
              <p className="font-medium">{cuenta.creador?.nombre_completo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de creación</p>
              <p className="font-medium">
                {new Date(cuenta.creado_en).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipo de servicio</p>
              <p className="font-medium capitalize">{cuenta.tipo_servicio}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proceso activo */}
      {procesoActivo?.proceso_id ? (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {procesoActivo.proceso_tipo === "traslado" ? (
                    <ArrowRightLeft className="h-5 w-5" />
                  ) : (
                    <ArrowDownToLine className="h-5 w-5" />
                  )}
                  Proceso Activo: {procesoActivo.proceso_tipo === "traslado" ? "Traslado" : "Radicación"}
                </CardTitle>
                <CardDescription>
                  Este vehículo tiene un proceso en curso
                </CardDescription>
              </div>
              <Badge
                variant={procesoActivo.proceso_estado === "con_novedades" ? "destructive" : "default"}
              >
                {formatearEstado(procesoActivo.proceso_estado)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {procesoActivo.proceso_tipo === "traslado" ? "Destino" : "Origen"}
                </p>
                <p className="font-medium">{formatearCiudad(procesoActivo.ciudad)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha trámite</p>
                <p className="font-medium">
                  {new Date(procesoActivo.fecha_tramite).toLocaleDateString("es-CO")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vencimiento</p>
                <p className={`font-medium ${
                  calcularDiasRestantes(procesoActivo.fecha_vencimiento) < 7 ? "text-orange-600" : ""
                }`}>
                  {new Date(procesoActivo.fecha_vencimiento).toLocaleDateString("es-CO")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Días restantes</p>
                <p className={`font-medium ${
                  calcularDiasRestantes(procesoActivo.fecha_vencimiento) < 7
                    ? "text-orange-600"
                    : "text-green-600"
                }`}>
                  {calcularDiasRestantes(procesoActivo.fecha_vencimiento)} días
                </p>
              </div>
            </div>

            {/* Información de auditoría */}
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Creado por</p>
                <p className="font-medium">{procesoActivo.creador?.nombre_completo || 'Sin información'}</p>
              </div>
              {procesoActivo.actualizador && (
                <div>
                  <p className="text-xs text-muted-foreground">Última actualización por</p>
                  <p className="font-medium">{procesoActivo.actualizador?.nombre_completo}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Actualizado</p>
                <p className="font-medium">
                  {new Date(procesoActivo.actualizado_en).toLocaleDateString("es-CO")}
                </p>
              </div>
            </div>

            {procesoActivo.observaciones && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Observaciones:</p>
                <p className="text-sm">{procesoActivo.observaciones}</p>
              </div>
            )}

            {/* Acciones del proceso */}
            <div className="flex gap-2">
              <CambiarEstado
                procesoId={procesoActivo.proceso_id}
                procesoTipo={procesoActivo.proceso_tipo as "traslado" | "radicacion"}
                estadoActual={procesoActivo.proceso_estado}
              />
              <AgregarNovedad
                procesoId={procesoActivo.proceso_id}
                procesoTipo={procesoActivo.proceso_tipo as "traslado" | "radicacion"}
              />
            </div>

            {/* Novedades del proceso activo */}
            {novedadesActivas.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Novedades Activas ({novedadesActivas.length})
                </h3>
                <div className="space-y-2">
                  {novedadesActivas.map((novedad) => (
                    <div
                      key={novedad.id}
                      className={`p-3 rounded-md border ${
                        novedad.estado === "resuelta"
                          ? "bg-green-50 border-green-200"
                          : "bg-yellow-50 border-yellow-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              novedad.prioridad === "critica" ? "destructive" :
                              novedad.prioridad === "alta" ? "destructive" :
                              "secondary"
                            }
                          >
                            {novedad.prioridad}
                          </Badge>
                          <Badge variant="outline">
                            {formatearEstado(novedad.tipo_novedad)}
                          </Badge>
                        </div>
                        <Badge variant={novedad.estado === "resuelta" ? "default" : "secondary"}>
                          {formatearEstado(novedad.estado)}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{novedad.descripcion}</p>
                      {novedad.solucion && novedad.estado === "resuelta" && (
                        <div className="mb-2 p-2 bg-white rounded border">
                          <p className="text-xs font-medium text-green-700 mb-1">Solución:</p>
                          <p className="text-sm text-green-900">{novedad.solucion}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Creado por: {novedad.creador?.nombre_completo}</span>
                          <span>
                            {new Date(novedad.creado_en).toLocaleDateString("es-CO")}
                          </span>
                          {novedad.estado === "resuelta" && (
                            <>
                              <span>•</span>
                              <span>Resuelto por: {novedad.resolutor?.nombre_completo}</span>
                            </>
                          )}
                        </div>
                        {novedad.estado !== "resuelta" && (
                          <ResolverNovedad
                            novedadId={novedad.id}
                            descripcion={novedad.descripcion}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <p className="text-lg font-medium mb-2">Sin procesos activos</p>
            <p className="text-muted-foreground mb-4">
              Este vehículo no tiene procesos en curso actualmente
            </p>
            <div className="flex gap-2 justify-center">
              <Button asChild>
                <Link href={`/movilidad/traslados/nuevo?placa=${placa}`}>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Iniciar Traslado
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/movilidad/radicaciones/nueva?placa=${placa}`}>
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  Iniciar Radicación
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de procesos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Traslados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Historial de Traslados ({traslados?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {traslados && traslados.length > 0 ? (
              <div className="space-y-3">
                {traslados.map((traslado) => (
                  <div key={traslado.id} className="border rounded-md p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {formatearEstado(traslado.estado)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(traslado.creado_en).toLocaleDateString("es-CO")}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Destino:</strong> {formatearCiudad(traslado.ciudad_destino)}</p>
                      <p><strong>Creado por:</strong> {traslado.creador?.nombre_completo || 'Sin información'}</p>
                      <p><strong>Fecha trámite:</strong> {new Date(traslado.fecha_tramite).toLocaleDateString("es-CO")}</p>
                      <p><strong>Vencimiento:</strong> {new Date(traslado.fecha_vencimiento).toLocaleDateString("es-CO")}</p>
                      {traslado.fecha_completado && (
                        <p><strong>Completado:</strong> {new Date(traslado.fecha_completado).toLocaleDateString("es-CO")}</p>
                      )}
                      {traslado.observaciones && (
                        <p className="text-xs text-muted-foreground italic">
                          <strong>Obs:</strong> {traslado.observaciones}
                        </p>
                      )}
                    </div>
                  </div>
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
              Historial de Radicaciones ({radicaciones?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {radicaciones && radicaciones.length > 0 ? (
              <div className="space-y-3">
                {radicaciones.map((radicacion) => (
                  <div key={radicacion.id} className="border rounded-md p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {formatearEstado(radicacion.estado)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(radicacion.creado_en).toLocaleDateString("es-CO")}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Origen:</strong> {formatearCiudad(radicacion.ciudad_origen)}</p>
                      <p><strong>Creado por:</strong> {radicacion.creador?.nombre_completo || 'Sin información'}</p>
                      <p><strong>Fecha trámite:</strong> {new Date(radicacion.fecha_tramite).toLocaleDateString("es-CO")}</p>
                      <p><strong>Vencimiento:</strong> {new Date(radicacion.fecha_vencimiento).toLocaleDateString("es-CO")}</p>
                      {radicacion.fecha_completado && (
                        <p><strong>Completado:</strong> {new Date(radicacion.fecha_completado).toLocaleDateString("es-CO")}</p>
                      )}
                      {radicacion.observaciones && (
                        <p className="text-xs text-muted-foreground italic">
                          <strong>Obs:</strong> {radicacion.observaciones}
                        </p>
                      )}
                    </div>
                  </div>
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

      {/* Historial de acciones */}
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
          {historial && historial.length > 0 ? (
            <div className="space-y-2">
              {historial.map((accion) => (
                <div key={accion.id} className="flex items-start gap-3 p-3 rounded-md bg-muted">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{formatearAccion(accion.accion)}</p>
                    {accion.estado_anterior && accion.estado_nuevo && (
                      <p className="text-xs text-muted-foreground">
                        {formatearEstado(accion.estado_anterior)} → {formatearEstado(accion.estado_nuevo)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {accion.responsable?.nombre_completo}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(accion.creado_en).toLocaleString("es-CO")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay acciones registradas
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
