import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Truck,
  ClipboardCheck,
  Plus,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileWarning,
  IdCard,
} from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { obtenerPermisosUsuario } from "@/lib/server/permisos"
import { Badge } from "@/components/ui/badge"
import { formatearFechaCorta } from "@/lib/parqueadero/utils"
import { getNowDateColombia } from "@/lib/utils/date"
import { capitalizeName } from "@/lib/utils/capitalize"

export default async function ParqueaderoDashboard() {
  const supabase = await createClient()
  const { parqueadero: permisos } = await obtenerPermisosUsuario()

  const hoy = getNowDateColombia()

  // Estadísticas
  const [
    { count: totalVehiculos },
    { count: inspeccionesHoy },
    { data: inspeccionesResumen },
  ] = await Promise.all([
    supabase.from("parq_vehiculos").select("*", { count: "exact", head: true }).eq("activo", true),
    supabase.from("parq_inspecciones").select("*", { count: "exact", head: true }).eq("fecha", hoy),
    supabase.from("parq_vista_inspecciones").select("*").eq("fecha", hoy).order("creado_en", { ascending: false }).limit(10),
  ])

  // Contar aptos y no aptos de hoy
  const inspeccionesAptas = inspeccionesResumen?.filter(i => i.es_apto).length || 0
  const inspeccionesNoAptas = inspeccionesResumen?.filter(i => !i.es_apto).length || 0

  // Últimas inspecciones
  const { data: ultimasInspecciones } = await supabase
    .from("parq_vista_inspecciones")
    .select("*")
    .order("creado_en", { ascending: false })
    .limit(5)

  // Alertas de vencimientos (vehículos y licencias)
  const { data: alertasVencimientos } = await supabase
    .from("parq_vista_alertas_vencimientos")
    .select("*")
    .order("fecha_vencimiento", { ascending: true })
    .limit(10)

  // Contador de alertas por tipo
  const alertasVehiculos = alertasVencimientos?.filter(a => a.tipo === 'vehiculo') || []
  const alertasConductores = alertasVencimientos?.filter(a => a.tipo === 'conductor') || []
  const totalAlertas = (alertasVencimientos?.length || 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Inspecciones de grúas de plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          {permisos.crear_inspecciones && (
            <Button asChild>
              <Link href="/parqueadero/inspecciones/nueva">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Inspección
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Vehículos"
          value={totalVehiculos || 0}
          iconName="truck"
          color="cyan"
        />
        <StatCard
          title="Inspecciones Hoy"
          value={inspeccionesHoy || 0}
          iconName="clipboard-check"
          color="blue"
        />
        <StatCard
          title="Aptos"
          value={inspeccionesAptas}
          iconName="check-circle"
          color="green"
        />
        <StatCard
          title="No Aptos"
          value={inspeccionesNoAptas}
          iconName="x-circle"
          color="red"
        />
        <StatCard
          title="Alertas Vencimiento"
          value={totalAlertas}
          iconName="alert-triangle"
          color={totalAlertas > 0 ? "orange" : "blue"}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
        <Link href="/parqueadero/inspecciones" className="group">
          <Card className="transition-all hover:shadow-md hover:border-blue-300">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <ClipboardCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Inspecciones</p>
                <p className="text-xs text-muted-foreground">Ver todas las inspecciones</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/parqueadero/vehiculos" className="group">
          <Card className="transition-all hover:shadow-md hover:border-cyan-300">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-cyan-100 p-2">
                <Truck className="h-5 w-5 text-cyan-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Vehículos</p>
                <p className="text-xs text-muted-foreground">Gestionar grúas de plataforma</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-cyan-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Últimas inspecciones */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Últimas Inspecciones</h3>
            {ultimasInspecciones && ultimasInspecciones.length > 0 ? (
              <div className="space-y-3">
                {ultimasInspecciones.map((inspeccion) => (
                  <Link
                    key={inspeccion.id}
                    href={`/parqueadero/inspecciones/${inspeccion.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-1 ${inspeccion.es_apto ? 'bg-green-100' : 'bg-red-100'}`}>
                        {inspeccion.es_apto ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{inspeccion.placa}</p>
                        <p className="text-xs text-muted-foreground">
                          {capitalizeName(inspeccion.operador_nombre)} - {inspeccion.hora}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Mostrar alertas de documentación del operador */}
                      {inspeccion.operador_estado_licencia === 'vencido' && (
                        <Badge variant="destructive" className="text-xs">
                          Lic. vencida
                        </Badge>
                      )}
                      {inspeccion.operador_estado_licencia === 'por_vencer' && (
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                          Lic. por vencer
                        </Badge>
                      )}
                      <Badge variant={inspeccion.es_apto ? "default" : "destructive"} className="text-xs">
                        {inspeccion.es_apto ? 'Apto' : 'No Apto'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay inspecciones recientes</p>
            )}
          </CardContent>
        </Card>

        {/* Alertas de documentación unificadas */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Alertas de Vencimientos
            </h3>
            {alertasVencimientos && alertasVencimientos.length > 0 ? (
              <div className="space-y-3">
                {alertasVencimientos.slice(0, 8).map((alerta, idx) => (
                  <div
                    key={`${alerta.tipo}-${alerta.entidad_id}-${alerta.documento}-${idx}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-1 ${alerta.estado === 'vencido' ? 'bg-red-100' : 'bg-orange-100'}`}>
                        {alerta.tipo === 'vehiculo' ? (
                          <FileWarning className={`h-4 w-4 ${alerta.estado === 'vencido' ? 'text-red-600' : 'text-orange-600'}`} />
                        ) : (
                          <IdCard className={`h-4 w-4 ${alerta.estado === 'vencido' ? 'text-red-600' : 'text-orange-600'}`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{alerta.identificador}</p>
                        <p className="text-xs text-muted-foreground">
                          {alerta.documento} - Vence: {formatearFechaCorta(alerta.fecha_vencimiento)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={alerta.estado === 'vencido' ? 'destructive' : 'outline'}
                      className={`text-xs ${alerta.estado === 'por_vencer' ? 'text-orange-600 border-orange-300' : ''}`}
                    >
                      {alerta.estado === 'vencido' ? 'Vencido' : 'Por vencer'}
                    </Badge>
                  </div>
                ))}

                {/* Resumen de alertas */}
                <div className="border-t pt-3 mt-3 flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    {alertasVehiculos.length} vehículos
                  </span>
                  <span className="flex items-center gap-1">
                    <IdCard className="h-3 w-3" />
                    {alertasConductores.length} licencias
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">No hay alertas de documentación</p>
                <p className="text-xs text-muted-foreground">Todos los documentos están vigentes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
