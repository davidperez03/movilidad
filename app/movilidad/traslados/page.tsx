import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRightLeft, Plus, Calendar, MapPin, FileText, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function TrasladosPage() {
  const supabase = await createClient()

  // Obtener traslados activos
  const { data: trasladosActivos } = await supabase
    .from("traslados")
    .select(`
      *,
      cuenta:cuenta_id (
        placa,
        numero_cuenta,
        tipo_servicio
      ),
      creador:creado_por (
        nombre_completo
      )
    `)
    .not("estado", "in", '("sin_asignar","trasladado","devuelto")')
    .order("creado_en", { ascending: false })

  // Obtener traslados completados
  const { data: trasladosCompletados } = await supabase
    .from("traslados")
    .select(`
      *,
      cuenta:cuenta_id (
        placa,
        numero_cuenta,
        tipo_servicio
      ),
      creador:creado_por (
        nombre_completo
      )
    `)
    .in("estado", ["trasladado", "devuelto"])
    .order("fecha_completado", { ascending: false })
    .limit(20)

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "trasladado":
        return "default"
      case "con_novedades":
        return "destructive"
      case "revisado":
        return "secondary"
      case "devuelto":
        return "outline"
      default:
        return "secondary"
    }
  }

  const formatearEstado = (estado: string) => {
    return estado.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const formatearCiudad = (ciudad: string) => {
    return ciudad.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
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
                          {traslado.cuenta?.placa}
                        </CardTitle>
                        <CardDescription>
                          {traslado.cuenta?.numero_cuenta}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getEstadoBadgeVariant(traslado.estado)}>
                          {formatearEstado(traslado.estado)}
                        </Badge>
                        {diasRestantes < 7 && (
                          <Badge variant={diasRestantes < 3 ? "destructive" : "outline"}>
                            {diasRestantes > 0 ? `${diasRestantes} días` : "Vencido"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Destino</p>
                          <p className="font-medium">{formatearCiudad(traslado.ciudad_destino)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Fecha trámite</p>
                          <p className="font-medium">
                            {new Date(traslado.fecha_tramite).toLocaleDateString("es-CO")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Vencimiento</p>
                          <p className={`font-medium ${diasRestantes < 7 ? "text-orange-600" : ""}`}>
                            {new Date(traslado.fecha_vencimiento).toLocaleDateString("es-CO")}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Creado por</p>
                        <p className="font-medium">{traslado.creador?.nombre_completo || 'Sin información'}</p>
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
                        <Link href={`/movilidad/vehiculos/${traslado.cuenta?.placa}`}>
                          <FileText className="h-4 w-4 mr-2" />
                          Ver Detalle
                        </Link>
                      </Button>
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
                        {traslado.cuenta?.placa}
                      </CardTitle>
                      <CardDescription>
                        {traslado.cuenta?.numero_cuenta}
                      </CardDescription>
                    </div>
                    <Badge variant={getEstadoBadgeVariant(traslado.estado)}>
                      {formatearEstado(traslado.estado)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Destino</p>
                      <p className="font-medium">{formatearCiudad(traslado.ciudad_destino)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha trámite</p>
                      <p className="font-medium">
                        {new Date(traslado.fecha_tramite).toLocaleDateString("es-CO")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completado</p>
                      <p className="font-medium">
                        {traslado.fecha_completado
                          ? new Date(traslado.fecha_completado).toLocaleDateString("es-CO")
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Responsable</p>
                      <p className="font-medium">{traslado.creador?.nombre_completo}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/movilidad/vehiculos/${traslado.cuenta?.placa}`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Detalle
                    </Link>
                  </Button>
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
