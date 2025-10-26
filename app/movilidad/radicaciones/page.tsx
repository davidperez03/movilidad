import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowDownToLine, Plus, Calendar, MapPin, FileText, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function RadicacionesPage() {
  const supabase = await createClient()

  // Obtener radicaciones activas
  const { data: radicacionesActivas } = await supabase
    .from("radicaciones")
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
    .not("estado", "in", '("sin_asignar","radicado","devuelto")')
    .order("creado_en", { ascending: false })

  // Obtener radicaciones completadas
  const { data: radicacionesCompletadas } = await supabase
    .from("radicaciones")
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
    .in("estado", ["radicado", "devuelto"])
    .order("fecha_completado", { ascending: false })
    .limit(20)

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "radicado":
        return "default"
      case "con_novedades":
        return "destructive"
      case "revisado":
      case "recibido":
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
          <h1 className="text-3xl font-bold">Radicaciones</h1>
          <p className="text-muted-foreground">
            Gestiona los procesos de recepción de vehículos
          </p>
        </div>
        <Button asChild>
          <Link href="/movilidad/radicaciones/nueva">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Radicación
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="activas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activas">
            Activas ({radicacionesActivas?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="completadas">
            Completadas ({radicacionesCompletadas?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activas" className="space-y-4">
          {radicacionesActivas && radicacionesActivas.length > 0 ? (
            radicacionesActivas.map((radicacion) => {
              const diasRestantes = calcularDiasRestantes(radicacion.fecha_vencimiento)
              return (
                <Card key={radicacion.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <ArrowDownToLine className="h-5 w-5" />
                          {radicacion.cuenta?.placa}
                        </CardTitle>
                        <CardDescription>
                          {radicacion.cuenta?.numero_cuenta}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getEstadoBadgeVariant(radicacion.estado)}>
                          {formatearEstado(radicacion.estado)}
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
                          <p className="text-sm text-muted-foreground">Origen</p>
                          <p className="font-medium">{formatearCiudad(radicacion.ciudad_origen)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Fecha trámite</p>
                          <p className="font-medium">
                            {new Date(radicacion.fecha_tramite).toLocaleDateString("es-CO")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Vencimiento</p>
                          <p className={`font-medium ${diasRestantes < 7 ? "text-orange-600" : ""}`}>
                            {new Date(radicacion.fecha_vencimiento).toLocaleDateString("es-CO")}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Creado por</p>
                        <p className="font-medium">{radicacion.creador?.nombre_completo || 'Sin información'}</p>
                      </div>
                    </div>
                    {radicacion.observaciones && (
                      <div className="mb-4 p-3 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground mb-1">Observaciones:</p>
                        <p className="text-sm">{radicacion.observaciones}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/movilidad/vehiculos/${radicacion.cuenta?.placa}`}>
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
                <ArrowDownToLine className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No hay radicaciones activas</p>
                <p className="text-muted-foreground mb-4">
                  No hay procesos de radicación en curso en este momento
                </p>
                <Button asChild>
                  <Link href="/movilidad/radicaciones/nueva">
                    <Plus className="h-4 w-4 mr-2" />
                    Iniciar Primera Radicación
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completadas" className="space-y-4">
          {radicacionesCompletadas && radicacionesCompletadas.length > 0 ? (
            radicacionesCompletadas.map((radicacion) => (
              <Card key={radicacion.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <ArrowDownToLine className="h-5 w-5" />
                        {radicacion.cuenta?.placa}
                      </CardTitle>
                      <CardDescription>
                        {radicacion.cuenta?.numero_cuenta}
                      </CardDescription>
                    </div>
                    <Badge variant={getEstadoBadgeVariant(radicacion.estado)}>
                      {formatearEstado(radicacion.estado)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Origen</p>
                      <p className="font-medium">{formatearCiudad(radicacion.ciudad_origen)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha trámite</p>
                      <p className="font-medium">
                        {new Date(radicacion.fecha_tramite).toLocaleDateString("es-CO")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completado</p>
                      <p className="font-medium">
                        {radicacion.fecha_completado
                          ? new Date(radicacion.fecha_completado).toLocaleDateString("es-CO")
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Responsable</p>
                      <p className="font-medium">{radicacion.creador?.nombre_completo}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/movilidad/vehiculos/${radicacion.cuenta?.placa}`}>
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
                <ArrowDownToLine className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No hay radicaciones completadas</p>
                <p className="text-muted-foreground">
                  No se han completado procesos de radicación aún
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
