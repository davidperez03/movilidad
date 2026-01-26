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
import { ESTADOS_CONFIG } from "@/lib/movilidad/config"
import { formatearEstadoProceso } from "@/lib/movilidad/formatters"
import { StatCard } from "@/components/dashboard/stat-card"
import { AlertCard } from "@/components/dashboard/alert-card"
import { ActivityTimeline } from "@/components/dashboard/activity-timeline"
import { SearchBar } from "@/components/dashboard/search-bar"
import { obtenerPermisosUsuario } from "@/lib/server/permisos"

export default async function MovilidadDashboard() {
  const supabase = await createClient()

  // Obtener permisos del usuario
  const { movilidad: permisos } = await obtenerPermisosUsuario()

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

  // Procesos por vencer (próximos 7 días hábiles)
  const { data: procesosPorVencer, error: errorVencer } = await supabase
    .from("mov_vista_procesos_por_vencer")
    .select("*")
    .order("dias_restantes", { ascending: true })
    .limit(10)

  if (errorVencer) {
    console.error('Error obteniendo procesos por vencer:', errorVencer)
  }

  // Crear alertas (todos los procesos que vencen en 7 días hábiles o menos)
  const alerts = (procesosPorVencer || []).map((proceso) => {
    const daysRemaining = proceso.dias_restantes
    const severity: "critical" | "warning" | "info" =
      daysRemaining < 0 ? "critical" : daysRemaining <= 2 ? "warning" : "info"

    return {
      id: proceso.proceso_id,
      title: `${proceso.placa} - ${proceso.proceso_tipo === "traslado" ? "Traslado" : "Radicación"}`,
      description: `${proceso.proceso_tipo === "traslado" ? "Destino" : "Origen"}: ${proceso.ciudad} | Estado: ${ESTADOS_CONFIG[proceso.estado]?.label || formatearEstadoProceso(proceso.estado)}`,
      severity,
      link: `/movilidad/vehiculos/${proceso.placa}`,
      daysRemaining: Math.abs(daysRemaining), // Siempre positivo para el badge
    }
  })

  // Actividad reciente (últimas 5 acciones del historial)
  const { data: actividadReciente } = await supabase
    .from("mov_historial_acciones")
    .select(
      `
      id,
      accion,
      estado_anterior,
      estado_nuevo,
      creado_en,
      cuenta:mov_cuentas_vehiculos!cuenta_id (
        placa
      ),
      usuario:perfiles!realizado_por (
        nombre_completo
      )
    `
    )
    .order("creado_en", { ascending: false })
    .limit(5)

  // Mapear actividades al formato del timeline (simplificado)
  const activities =
    actividadReciente?.map((item: any) => {
      const usuario = item.usuario?.nombre_completo?.split(' ')[0] || "Usuario"
      const placa = item.cuenta?.placa || ""

      const accionMap: Record<string, any> = {
        cuenta_creada: {
          type: "cuenta_creada",
          title: `${placa} - Cuenta creada`,
          description: `Por ${usuario}`,
        },
        traslado_iniciado: {
          type: "traslado_iniciado",
          title: `${placa} - Traslado iniciado`,
          description: `Por ${usuario}`,
        },
        radicacion_iniciada: {
          type: "radicacion_iniciada",
          title: `${placa} - Radicación iniciada`,
          description: `Por ${usuario}`,
        },
        estado_cambiado: {
          type: "estado_cambiado",
          title: `${placa} - Estado actualizado`,
          description: `${ESTADOS_CONFIG[item.estado_anterior || ""]?.label || item.estado_anterior || ""} → ${ESTADOS_CONFIG[item.estado_nuevo || ""]?.label || item.estado_nuevo || ""}`,
        },
        novedad_agregada: {
          type: "novedad_agregada",
          title: `${placa} - Novedad`,
          description: `Por ${usuario}`,
        },
      }

      const accion = accionMap[item.accion] || {
        type: "estado_cambiado",
        title: `${placa} - ${formatearEstadoProceso(item.accion)}`,
        description: `Por ${usuario}`,
      }

      return {
        id: item.id,
        type: accion.type,
        title: accion.title,
        description: accion.description,
        timestamp: item.creado_en,
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

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Acciones Rápidas
          </CardTitle>
          <CardDescription>Accede a las funciones principales del módulo</CardDescription>
        </CardHeader>
        <CardContent>
          {!permisos.ver && !permisos.crear_cuentas && !permisos.crear_traslados && !permisos.crear_radicaciones ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="mb-2">No tienes permisos asignados para este módulo</p>
              <p className="text-sm">Contacta a tu administrador para solicitar acceso</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {/* Nueva Cuenta - Solo si tiene permiso */}
              {permisos.crear_cuentas && (
                <Button asChild className="h-auto py-6 flex-col gap-2" variant="default">
                  <Link href="/movilidad/cuentas/nueva">
                    <FileText className="h-6 w-6" />
                    <span className="font-medium">Nueva Cuenta</span>
                  </Link>
                </Button>
              )}

              {/* Estado General - Siempre visible si tiene permiso 'ver' */}
              {permisos.ver && (
                <Button asChild className="h-auto py-6 flex-col gap-2" variant="outline">
                  <Link href="/movilidad/estado">
                    <Activity className="h-6 w-4" />
                    <span className="font-medium">Estado General</span>
                  </Link>
                </Button>
              )}

              {/* Ver Cuentas - Siempre visible si tiene permiso 'ver' */}
              {permisos.ver && (
                <Button asChild className="h-auto py-6 flex-col gap-2" variant="outline">
                  <Link href="/movilidad/cuentas">
                    <Car className="h-6 w-6" />
                    <span className="font-medium">Ver Cuentas</span>
                  </Link>
                </Button>
              )}

              {/* Nuevo Traslado - Solo si tiene permiso */}
              {permisos.crear_traslados && (
                <Button asChild className="h-auto py-6 flex-col gap-2" variant="outline">
                  <Link href="/movilidad/traslados/nuevo">
                    <ArrowRightLeft className="h-6 w-6" />
                    <span className="font-medium">Nuevo Traslado</span>
                  </Link>
                </Button>
              )}

              {/* Nueva Radicación - Solo si tiene permiso */}
              {permisos.crear_radicaciones && (
                <Button asChild className="h-auto py-6 flex-col gap-2" variant="outline">
                  <Link href="/movilidad/radicaciones/nueva">
                    <ArrowDownToLine className="h-6 w-6" />
                    <span className="font-medium">Nueva Radicación</span>
                  </Link>
                </Button>
              )}
            </div>
          )}
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
    </div>
  )
}
