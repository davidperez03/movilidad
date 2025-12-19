import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRightLeft, Plus, Calendar, MapPin, FileText, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BotonDescargarRemision } from "@/components/movilidad/boton-descargar-remision"
import { BadgeEstadoProceso } from "@/components/movilidad/badge-estado-proceso"
import { BadgeVencimiento } from "@/components/movilidad/badge-vencimiento"
import { formatDateShort, formatDateForDisplay } from "@/lib/utils"
import { calcularDiasRestantes, formatearDiasRestantes } from "@/lib/movilidad/formatters"

export default async function TrasladosPage() {
  const supabase = await createClient()

  // Obtener traslados activos
  const { data: trasladosActivos, error: errorActivos } = await supabase
    .from("mov_traslados")
    .select(`
      *,
      mov_cuentas_vehiculos!cuenta_id (
        placa,
        numero_cuenta,
        tipo_servicio
      ),
      perfiles!creado_por (
        nombre_completo
      ),
      organismo:mov_organismos_transito!organismo_destino_id (
        nombre,
        municipio,
        departamento
      )
    `)
    .not("estado", "in", "(trasladado,devuelto)")
    .order("creado_en", { ascending: false })

  if (errorActivos) {
    console.error("Error traslados activos:", errorActivos)
  }

  // Obtener traslados completados
  const { data: trasladosCompletados } = await supabase
    .from("mov_traslados")
    .select(`
      *,
      cuenta:mov_cuentas_vehiculos!cuenta_id (
        placa,
        numero_cuenta,
        tipo_servicio
      ),
      creador:perfiles!creado_por (
        nombre_completo
      ),
      organismo:mov_organismos_transito!organismo_destino_id (
        nombre,
        municipio,
        departamento
      )
    `)
    .in("estado", ["trasladado", "devuelto"])
    .order("fecha_completado", { ascending: false })
    .limit(20)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Traslados</h1>
          <p className="text-muted-foreground">
            Gestiona los procesos de envío de vehículos
          </p>
        </div>
        <Button asChild>
          <Link href="/movilidad/traslados/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Traslado
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="activos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activos">
            Activos ({trasladosActivos?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="completados">
            Completados ({trasladosCompletados?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="space-y-4">
          {trasladosActivos && trasladosActivos.length > 0 ? (
            trasladosActivos.map((traslado) => {
              const diasRestantes = calcularDiasRestantes(traslado.fecha_vencimiento)
              return (
                <Card key={traslado.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <ArrowRightLeft className="h-5 w-5" />
                          {traslado.mov_cuentas_vehiculos?.placa}
                        </CardTitle>
                        <CardDescription>
                          {traslado.mov_cuentas_vehiculos?.numero_cuenta}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <BadgeEstadoProceso estado={traslado.estado} tipoProceso="traslado" />
                        <BadgeVencimiento fechaVencimiento={traslado.fecha_vencimiento} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Destino</p>
                          <p className="font-medium">{traslado.organismo?.nombre || 'Sin información'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Fecha trámite</p>
                          <p className="font-medium">
                            {formatDateForDisplay(traslado.fecha_tramite)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Vencimiento</p>
                          <p className={`font-medium ${diasRestantes < 7 ? "text-orange-600" : ""}`}>
                            {formatDateForDisplay(traslado.fecha_vencimiento)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Creado por</p>
                        <p className="font-medium">{traslado.perfiles?.nombre_completo || 'Sin información'}</p>
                      </div>
                    </div>
                    {traslado.observaciones && (
                      <div className="mb-4 p-3 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground mb-1">Observaciones:</p>
                        <p className="text-sm">{traslado.observaciones}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/movilidad/vehiculos/${traslado.mov_cuentas_vehiculos?.placa}`}>
                          <FileText className="h-4 w-4 mr-2" />
                          Ver Detalle
                        </Link>
                      </Button>
                      {(traslado.estado === "enviado_organismo" || traslado.estado === "trasladado") && (
                        <BotonDescargarRemision
                          trasladoId={traslado.id}
                          placa={traslado.mov_cuentas_vehiculos?.placa || ""}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <ArrowRightLeft className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No hay traslados activos</p>
                <p className="text-muted-foreground mb-4">
                  No hay procesos de traslado en curso en este momento
                </p>
                <Button asChild>
                  <Link href="/movilidad/traslados/nuevo">
                    <Plus className="h-4 w-4 mr-2" />
                    Iniciar Primer Traslado
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completados" className="space-y-4">
          {trasladosCompletados && trasladosCompletados.length > 0 ? (
            trasladosCompletados.map((traslado) => (
              <Card key={traslado.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <ArrowRightLeft className="h-5 w-5" />
                        {traslado.mov_cuentas_vehiculos?.placa}
                      </CardTitle>
                      <CardDescription>
                        {traslado.mov_cuentas_vehiculos?.numero_cuenta}
                      </CardDescription>
                    </div>
                    <BadgeEstadoProceso estado={traslado.estado} tipoProceso="traslado" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Destino</p>
                      <p className="font-medium">{traslado.organismo?.nombre || 'Sin información'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha trámite</p>
                      <p className="font-medium">
                        {formatDateForDisplay(traslado.fecha_tramite)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completado</p>
                      <p className="font-medium">
                        {traslado.fecha_completado
                          ? formatDateShort(traslado.fecha_completado)
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Responsable</p>
                      <p className="font-medium">{traslado.perfiles?.nombre_completo}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/movilidad/vehiculos/${traslado.mov_cuentas_vehiculos?.placa}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Detalle
                      </Link>
                    </Button>
                    {(traslado.estado === "enviado_organismo" || traslado.estado === "trasladado") && (
                      <BotonDescargarRemision
                        trasladoId={traslado.id}
                        placa={traslado.mov_cuentas_vehiculos?.placa || ""}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <ArrowRightLeft className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No hay traslados completados</p>
                <p className="text-muted-foreground">
                  No se han completado procesos de traslado aún
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
