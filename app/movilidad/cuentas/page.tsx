import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { BotonNuevaCuenta } from "@/components/movilidad/procesos/cuentas-acciones"
import { obtenerPermisosUsuario } from "@/lib/server/permisos"
import { CuentasTable } from "@/components/movilidad/cuentas/cuentas-table"
import { AlertCircle } from "lucide-react"
import { logger } from "@/lib/logger"

interface ProcesoCompletado {
  cuenta_id: string
  tipo: string
  fecha_completado: string
}

export default async function CuentasPage() {
  const supabase = await createClient()

  const { movilidad: permisos } = await obtenerPermisosUsuario()

  const { data: cuentas, error: errorCuentas } = await supabase
    .from("mov_cuentas_vehiculos")
    .select(`
      *,
      creador:perfiles!creado_por (
        nombre_completo,
        correo
      )
    `)
    .order("creado_en", { ascending: false })

  if (errorCuentas) {
    logger.error("Error al cargar cuentas", errorCuentas)
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Cuentas</h1>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Error al cargar las cuentas. Por favor, intenta nuevamente.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: procesosActivos, error: errorProcesos } = await supabase
    .from("mov_vista_proceso_activo")
    .select("*")

  if (errorProcesos) {
    logger.error("Error al cargar procesos activos", errorProcesos)
  }

  const { data: ultimosCompletados, error: errorCompletados } = await supabase.rpc('obtener_ultimos_procesos_completados')

  if (errorCompletados) {
    logger.error("Error al cargar procesos completados", errorCompletados)
  }

  const procesosActivosMap = new Map(
    procesosActivos?.map(p => [p.cuenta_id, p]) || []
  )

  const ultimosCompletadosMap = new Map(
    (ultimosCompletados as ProcesoCompletado[] | null)?.map(uc => [uc.cuenta_id, uc]) || []
  )

  // Enriquecer cuentas con procesos en memoria
  const cuentasConProcesos = (cuentas || []).map((cuenta) => ({
    ...cuenta,
    procesoActivo: procesosActivosMap.get(cuenta.id) || null,
    ultimo_proceso_completado: ultimosCompletadosMap.get(cuenta.id) || null,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cuentas</h1>
          <p className="text-muted-foreground">Gestión de cuentas</p>
        </div>
        <BotonNuevaCuenta permisos={permisos} />
      </div>

      {/* Tabla de cuentas */}
      <Card>
        <CardContent className="pt-6">
          <CuentasTable cuentas={cuentasConProcesos || []} permisos={permisos} />
        </CardContent>
      </Card>
    </div>
  )
}
