import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Car,
  FileText,
  ArrowRightLeft,
  ArrowDownToLine,
  AlertTriangle,
  TrendingUp,
  Activity,
  Plus,
} from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { AlertCard } from "@/components/dashboard/alert-card"
import { ActivityTimeline } from "@/components/dashboard/activity-timeline"
import { SearchBar } from "@/components/dashboard/search-bar"

export default async function MovilidadDashboard() {
  const supabase = await createClient()

  // Estadísticas generales
  const { count: totalCuentas } = await supabase
    .from("mov_cuentas_vehiculos")
    .select("*", { count: "exact", head: true })

  const { count: trasladosActivos } = await supabase
    .from("mov_traslados")
    .select("*", { count: "exact", head: true })
    .not("estado", "in", "(trasladado,devuelto)")

  const { count: radicacionesActivas } = await supabase
    .from("mov_radicaciones")
    .select("*", { count: "exact", head: true })
    .not("estado", "in", "(radicado,devuelto)")

  const { count: novedadesPendientes } = await supabase
    .from("mov_novedades")
    .select("*", { count: "exact", head: true })
    .neq("estado", "resuelta")

  // Procesos por vencer (próximos 7 días)
  const { data: procesosPorVencer } = await supabase
    .from("mov_vista_procesos_por_vencer")
    .select("*")
    .order("dias_restantes", { ascending: true })
    .limit(10)

  // Crear alertas
  const alerts = (procesosPorVencer || []).map((proceso) => {
    const daysRemaining = proceso.dias_restantes
    const severity: "critical" | "warning" | "info" =
      daysRemaining < 0 ? "critical" : daysRemaining <= 2 ? "warning" : "info"

    return {
      id: proceso.proceso_id,
      title: `${proceso.placa} - ${proceso.proceso_tipo === "traslado" ? "Traslado" : "Radicación"}`,
      description: `${proceso.proceso_tipo === "traslado" ? "Destino" : "Origen"}: ${proceso.ciudad} | Estado: ${proceso.estado.replace(/_/g, " ")}`,
      severity,
      link: `/movilidad/vehiculos/${proceso.placa}`,
      daysRemaining: Math.max(0, daysRemaining),
    }
  })

  // Actividad reciente (últimas 10 acciones del historial)
  const { data: actividadReciente } = await supabase
    .from("mov_historial_acciones")
    .select(
      `
      id,
      accion,
      estado_anterior,
      estado_nuevo,
      detalles,
      creado_en,
      cuenta:mov_cuentas_vehiculos!cuenta_id (
        placa,
        numero_cuenta
      ),
      usuario:perfiles!realizado_por (
        nombre_completo
      )
    `
    )
    .order("creado_en", { ascending: false })
    .limit(10)

  // Mapear actividades al formato del timeline
  const activities =
    actividadReciente?.map((item: any) => {
      const accionMap: Record<string, any> = {
        cuenta_creada: {
          type: "cuenta_creada",
          title: "Nueva cuenta creada",
          description: `${item.usuario?.nombre_completo || "Usuario"} registró un nuevo vehículo`,
        },
        traslado_iniciado: {
          type: "traslado_iniciado",
          title: "Traslado iniciado",
          description: `${item.usuario?.nombre_completo || "Usuario"} inició un traslado`,
        },
        radicacion_iniciada: {
          type: "radicacion_iniciada",
          title: "Radicación iniciada",
          description: `${item.usuario?.nombre_completo || "Usuario"} inició una radicación`,
        },
        estado_cambiado: {
          type: "estado_cambiado",
          title: "Estado actualizado",
          description: `Cambió de "${item.estado_anterior?.replace(/_/g, " ")}" a "${item.estado_nuevo?.replace(/_/g, " ")}"`,
        },
        novedad_agregada: {
          type: "novedad_agregada",
          title: "Novedad agregada",
          description: `${item.usuario?.nombre_completo || "Usuario"} agregó una novedad`,
        },
      }

      const accion = accionMap[item.accion] || {
        type: "estado_cambiado",
        title: item.accion.replace(/_/g, " "),
        description: "Acción realizada en el sistema",
      }

      return {
        id: item.id,
        type: accion.type,
        title: accion.title,
        description: accion.description,
        timestamp: item.creado_en,
        metadata: {
          placa: item.cuenta?.placa,
          estado: item.estado_nuevo,
        },
      }
    }) || []

  return (
    <div className="space-y-6">
      {/* Hero Section con búsqueda */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Dashboard de Movilidad</h1>
          <p className="text-blue-100 mb-6">
            Gestiona cuentas, traslados y radicaciones de vehículos de forma eficiente
          </p>
          <SearchBar placeholder="Buscar vehículo por placa..." />
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Cuentas"
          value={totalCuentas || 0}
          description="Vehículos registrados"
          iconName="car"
        />
        <StatCard
          title="Traslados Activos"
          value={trasladosActivos || 0}
          description="En proceso"
          iconName="arrow-right-left"
          className="border-l-4 border-l-purple-500"
        />
        <StatCard
          title="Radicaciones Activas"
          value={radicacionesActivas || 0}
          description="En proceso"
          iconName="arrow-down-to-line"
          className="border-l-4 border-l-green-500"
        />
        <StatCard
          title="Novedades Pendientes"
          value={novedadesPendientes || 0}
          description="Requieren atención"
          iconName="alert-triangle"
          className="border-l-4 border-l-orange-500"
        />
      </div>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Acciones Rápidas
          </CardTitle>
          <CardDescription>Accede a las funciones principales del módulo</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Button asChild className="h-auto py-6 flex-col gap-2" variant="default">
            <Link href="/movilidad/cuentas/nueva">
              <FileText className="h-6 w-6" />
              <span className="font-medium">Nueva Cuenta</span>
            </Link>
          </Button>
          <Button asChild className="h-auto py-6 flex-col gap-2" variant="outline">
            <Link href="/movilidad/traslados/nuevo">
              <ArrowRightLeft className="h-6 w-6" />
              <span className="font-medium">Nuevo Traslado</span>
            </Link>
          </Button>
          <Button asChild className="h-auto py-6 flex-col gap-2" variant="outline">
            <Link href="/movilidad/radicaciones/nueva">
              <ArrowDownToLine className="h-6 w-6" />
              <span className="font-medium">Nueva Radicación</span>
            </Link>
          </Button>
          <Button asChild className="h-auto py-6 flex-col gap-2" variant="outline">
            <Link href="/movilidad/cuentas">
              <Car className="h-6 w-6" />
              <span className="font-medium">Ver Cuentas</span>
            </Link>
          </Button>
          <Button asChild className="h-auto py-6 flex-col gap-2" variant="outline">
            <Link href="/movilidad/estado">
              <Activity className="h-6 w-6" />
              <span className="font-medium">Estado General</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Alertas y Actividad */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AlertCard
          alerts={alerts}
          title="Alertas Prioritarias"
          emptyMessage="No hay procesos próximos a vencer"
        />
        <ActivityTimeline
          activities={activities}
          title="Actividad Reciente"
          emptyMessage="No hay actividad reciente para mostrar"
        />
      </div>

      {/* Vista General */}
      <Card>
        <CardHeader>
          <CardTitle>Vista General</CardTitle>
          <CardDescription>Navegación rápida a secciones principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/movilidad/traslados"
              className="group flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-100 p-2">
                  <ArrowRightLeft className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Ver Traslados</p>
                  <p className="text-sm text-muted-foreground">Gestionar envíos de vehículos</p>
                </div>
              </div>
              <Badge variant="secondary">{trasladosActivos || 0} activos</Badge>
            </Link>

            <Link
              href="/movilidad/radicaciones"
              className="group flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <ArrowDownToLine className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Ver Radicaciones</p>
                  <p className="text-sm text-muted-foreground">Gestionar recepción de vehículos</p>
                </div>
              </div>
              <Badge variant="secondary">{radicacionesActivas || 0} activas</Badge>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
