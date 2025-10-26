import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Car,
  FileText,
  ArrowRightLeft,
  ArrowDownToLine,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react"

export default async function MovilidadDashboard() {
  const supabase = await createClient()

  // Obtener estadísticas generales
  const { count: totalCuentas } = await supabase
    .from("cuentas_vehiculos")
    .select("*", { count: "exact", head: true })

  const { count: trasladosActivos } = await supabase
    .from("traslados")
    .select("*", { count: "exact", head: true })
    .not("estado", "in", '("sin_asignar","trasladado","devuelto")')

  const { count: radicacionesActivas } = await supabase
    .from("radicaciones")
    .select("*", { count: "exact", head: true })
    .not("estado", "in", '("sin_asignar","radicado","devuelto")')

  // Procesos por vencer (próximos 7 días)
  const { data: procesosPorVencer } = await supabase
    .from("vista_procesos_por_vencer")
    .select("*")
    .limit(5)

  // Procesos con novedades pendientes
  const { data: novedadesPendientes } = await supabase
    .from("novedades")
    .select(`
      *,
      traslados:proceso_id (
        id,
        cuenta_id,
        ciudad_destino,
        estado,
        cuentas_vehiculos (placa, numero_cuenta)
      ),
      radicaciones:proceso_id (
        id,
        cuenta_id,
        ciudad_origen,
        estado,
        cuentas_vehiculos (placa, numero_cuenta)
      )
    `)
    .eq("estado", "pendiente")
    .limit(5)

  return (
    <div className="space-y-8">
      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Cuentas
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCuentas || 0}</div>
            <p className="text-xs text-muted-foreground">
              Vehículos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Traslados Activos
            </CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trasladosActivos || 0}</div>
            <p className="text-xs text-muted-foreground">
              En proceso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Radicaciones Activas
            </CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{radicacionesActivas || 0}</div>
            <p className="text-xs text-muted-foreground">
              En proceso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novedades Pendientes
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {novedadesPendientes?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accede a las funciones principales del módulo
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button asChild className="h-auto py-6 flex-col">
            <Link href="/movilidad/cuentas/nueva">
              <FileText className="h-6 w-6 mb-2" />
              <span>Nueva Cuenta</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-6 flex-col">
            <Link href="/movilidad/traslados/nuevo">
              <ArrowRightLeft className="h-6 w-6 mb-2" />
              <span>Nuevo Traslado</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-6 flex-col">
            <Link href="/movilidad/radicaciones/nueva">
              <ArrowDownToLine className="h-6 w-6 mb-2" />
              <span>Nueva Radicación</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-6 flex-col">
            <Link href="/movilidad/cuentas">
              <Car className="h-6 w-6 mb-2" />
              <span>Ver Cuentas</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Procesos por vencer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Próximos a Vencer
            </CardTitle>
            <CardDescription>
              Procesos que vencen en los próximos 7 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            {procesosPorVencer && procesosPorVencer.length > 0 ? (
              <div className="space-y-4">
                {procesosPorVencer.map((proceso) => (
                  <div
                    key={proceso.proceso_id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{proceso.placa}</p>
                      <p className="text-sm text-muted-foreground">
                        {proceso.proceso_tipo === "traslado" ? "Traslado" : "Radicación"} - {proceso.ciudad}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        proceso.dias_restantes < 3 ? "text-red-500" : "text-orange-500"
                      }`}>
                        {proceso.dias_restantes} días
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay procesos próximos a vencer
              </p>
            )}
          </CardContent>
        </Card>

        {/* Novedades pendientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Novedades Recientes
            </CardTitle>
            <CardDescription>
              Últimas novedades pendientes de resolución
            </CardDescription>
          </CardHeader>
          <CardContent>
            {novedadesPendientes && novedadesPendientes.length > 0 ? (
              <div className="space-y-4">
                {novedadesPendientes.map((novedad) => (
                  <div
                    key={novedad.id}
                    className="flex items-start justify-between border-b pb-2 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{novedad.tipo_novedad.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {novedad.descripcion}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      novedad.prioridad === "critica" ? "bg-red-100 text-red-700" :
                      novedad.prioridad === "alta" ? "bg-orange-100 text-orange-700" :
                      novedad.prioridad === "media" ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {novedad.prioridad}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay novedades pendientes
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
