import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Car,
  ArrowRightLeft,
  ArrowDownToLine,
  Plus,
  ChevronRight,
  Activity,
  FileBarChart,
} from "lucide-react"
import { ESTADOS_CONFIG } from "@/lib/movilidad/config"
import { formatearEstadoProceso } from "@/lib/movilidad/formatters"
import { obtenerNivelUrgenciaPorVencer } from "@/lib/movilidad/reportes/urgencia"
import { StatCard } from "@/components/dashboard/stat-card"
import { AlertCard } from "@/components/dashboard/alert-card"
import { ActivityTimeline } from "@/components/dashboard/activity-timeline"
import { SearchBar } from "@/components/dashboard/search-bar"
import { obtenerPermisosUsuario } from "@/lib/server/permisos"

export default async function MovilidadDashboard() {
  const supabase = await createClient()
  const { movilidad: permisos } = await obtenerPermisosUsuario()

  // Estadísticas
  const [
    { count: totalCuentas },
    { count: trasladosActivos },
    { count: radicacionesActivas },
    { count: novedadesPendientes },
  ] = await Promise.all([
    supabase.from("mov_cuentas_vehiculos").select("*", { count: "exact", head: true }),
    supabase.from("mov_traslados").select("*", { count: "exact", head: true }).not("estado", "in", "(trasladado,devuelto)"),
    supabase.from("mov_radicaciones").select("*", { count: "exact", head: true }).not("estado", "in", "(radicado,devuelto)"),
    supabase.from("mov_novedades").select("*", { count: "exact", head: true }).neq("estado", "resuelta"),
  ])

  // Procesos para alertas prioritarias (urgencia media y vence hoy)
  const { data: procesosConAlerta } = await supabase
    .from("mov_vista_proceso_activo")
    .select("*")
    .not("proceso_tipo", "is", null)
    .not("dias_restantes", "is", null)
    .gte("dias_restantes", 0)
    .lte("dias_restantes", 10)
    .order("dias_restantes", { ascending: true })
    .limit(50)

  const alerts = (procesosConAlerta || [])
    .filter((proceso) => {
      const nivel = obtenerNivelUrgenciaPorVencer(proceso.dias_restantes)
      return nivel === "vence_hoy" || nivel === "media"
    })
    .slice(0, 10)
    .map((proceso) => {
    const daysRemaining = proceso.dias_restantes
    const nivel = obtenerNivelUrgenciaPorVencer(daysRemaining)
    const severity: "critical" | "warning" | "info" =
      nivel === "vence_hoy" ? "warning" : "info"

    return {
      id: proceso.proceso_id,
      title: `${proceso.placa} - ${proceso.proceso_tipo === "traslado" ? "Traslado" : "Radicación"}`,
      description: `${proceso.proceso_tipo === "traslado" ? "Destino" : "Origen"}: ${proceso.ciudad}`,
      severity,
      link: `/movilidad/vehiculos/${proceso.placa}`,
      daysRemaining,
    }
  })

  // Actividad reciente
  const { data: actividadReciente } = await supabase
    .from("mov_historial_acciones")
    .select(`
      id, accion, estado_anterior, estado_nuevo, creado_en,
      cuenta:mov_cuentas_vehiculos!cuenta_id (placa),
      usuario:perfiles!realizado_por (nombre_completo)
    `)
    .order("creado_en", { ascending: false })
    .limit(5)

  interface ActividadItem {
    id: string
    accion: string
    estado_anterior: string | null
    estado_nuevo: string | null
    creado_en: string
    cuenta: { placa: string } | null
    usuario: { nombre_completo: string | null } | null
  }

  const activities = (actividadReciente as ActividadItem[] | null)?.map((item) => {
    const usuario = item.usuario?.nombre_completo?.split(' ')[0] || "Usuario"
    const placa = item.cuenta?.placa || ""

    type TipoActividad = "cuenta_creada" | "traslado_iniciado" | "radicacion_iniciada" | "estado_cambiado" | "novedad_agregada"
    const accionMap: Record<string, { type: TipoActividad; title: string; description: string }> = {
      cuenta_creada: { type: "cuenta_creada", title: `${placa} - Cuenta creada`, description: `Por ${usuario}` },
      traslado_iniciado: { type: "traslado_iniciado", title: `${placa} - Traslado iniciado`, description: `Por ${usuario}` },
      radicacion_iniciada: { type: "radicacion_iniciada", title: `${placa} - Radicación iniciada`, description: `Por ${usuario}` },
      estado_cambiado: { type: "estado_cambiado", title: `${placa} - Estado actualizado`, description: `${ESTADOS_CONFIG[item.estado_anterior || ""]?.label || item.estado_anterior || ""} → ${ESTADOS_CONFIG[item.estado_nuevo || ""]?.label || item.estado_nuevo || ""}` },
      novedad_agregada: { type: "novedad_agregada", title: `${placa} - Novedad`, description: `Por ${usuario}` },
    }

    const accion = accionMap[item.accion] || { type: "estado_cambiado", title: `${placa} - ${formatearEstadoProceso(item.accion)}`, description: `Por ${usuario}` }

    return { id: item.id, type: accion.type, title: accion.title, description: accion.description, timestamp: item.creado_en }
  }) || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Gestión de cuentas y procesos</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full md:w-80">
            <SearchBar placeholder="Buscar por placa..." />
          </div>
          {permisos.crear_cuentas && (
            <Button asChild>
              <Link href="/movilidad/cuentas/nueva">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Cuenta
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Cuentas"
          value={totalCuentas || 0}
          iconName="car"
          color="blue"
        />
        <StatCard
          title="Traslados"
          value={trasladosActivos || 0}
          iconName="arrow-right-left"
          color="purple"
        />
        <StatCard
          title="Radicaciones"
          value={radicacionesActivas || 0}
          iconName="arrow-down-to-line"
          color="green"
        />
        <StatCard
          title="Novedades"
          value={novedadesPendientes || 0}
          iconName="alert-triangle"
          color="orange"
        />
      </div>

      {/* Quick Actions - Mismo orden que nav */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <Link href="/movilidad/estado" className="group">
          <Card className="transition-all hover:shadow-md hover:border-cyan-300">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-cyan-100 p-2">
                <Activity className="h-5 w-5 text-cyan-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Estado General</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-cyan-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/movilidad/cuentas" className="group">
          <Card className="transition-all hover:shadow-md hover:border-blue-300">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Cuentas</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/movilidad/traslados" className="group">
          <Card className="transition-all hover:shadow-md hover:border-purple-300">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <ArrowRightLeft className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Traslados</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/movilidad/radicaciones" className="group">
          <Card className="transition-all hover:shadow-md hover:border-green-300">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <ArrowDownToLine className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Radicaciones</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-green-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/movilidad/reportes" className="group">
          <Card className="transition-all hover:shadow-md hover:border-amber-300">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <FileBarChart className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Reportes</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>


      {/* Alerts & Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AlertCard
          alerts={alerts}
          title="Alertas Prioritarias"
          emptyMessage="No hay procesos de urgencia media ni que venzan hoy"
        />
        <ActivityTimeline
          activities={activities}
          title="Actividad Reciente"
          emptyMessage="No hay actividad reciente"
        />
      </div>
    </div>
  )
}
