import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Clock, CheckCircle2, Activity } from "lucide-react"
import { TablaProcesosActivos } from "@/components/movilidad/estado/tabla-procesos-activos"

export default async function EstadoGeneralPage() {
  const supabase = await createClient()

  const { data: procesosActivos } = await supabase
    .from("mov_vista_proceso_activo")
    .select("*")
    .not("proceso_tipo", "is", null)
    .order("numero_cuenta", { ascending: false })

  const procesos = procesosActivos || []
  const total = procesos.length
  const vencidos = procesos.filter(p => p.dias_restantes !== null && p.dias_restantes < 0).length
  const porVencer = procesos.filter(p => p.dias_restantes !== null && p.dias_restantes >= 0 && p.dias_restantes <= 7).length
  const enProceso = procesos.filter(p => p.dias_restantes === null || p.dias_restantes > 7).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Estado General</h1>
        <p className="text-muted-foreground">Procesos activos ordenados por urgencia</p>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg p-2 bg-blue-100">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600">{total}</span>
              <span className="text-sm text-muted-foreground">Activos</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg p-2 bg-red-100">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-red-600">{vencidos}</span>
              <span className="text-sm text-muted-foreground">Vencidos</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg p-2 bg-orange-100">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-orange-600">{porVencer}</span>
              <span className="text-sm text-muted-foreground">Por vencer</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg p-2 bg-green-100">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-600">{enProceso}</span>
              <span className="text-sm text-muted-foreground">En proceso</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <TablaProcesosActivos procesos={procesos} />
        </CardContent>
      </Card>
    </div>
  )
}
