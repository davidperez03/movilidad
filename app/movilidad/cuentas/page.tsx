import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { BotonNuevaCuenta } from "@/components/movilidad/procesos/cuentas-acciones"
import { obtenerPermisosUsuario } from "@/lib/server/permisos"
import { CuentasTable } from "@/components/movilidad/cuentas/cuentas-table"

export default async function CuentasPage() {
  const supabase = await createClient()

  // Obtener permisos del usuario en el servidor
  const { movilidad: permisos } = await obtenerPermisosUsuario()

  // Obtener todas las cuentas
  const { data: cuentas, error } = await supabase
    .from("mov_cuentas_vehiculos")
    .select(`
      *,
      creador:perfiles!creado_por (
        nombre_completo,
        correo
      )
    `)
    .order("creado_en", { ascending: false })

  if (error) {
  }

  // Obtener procesos activos de todas las cuentas en una sola query
  const { data: procesosActivos } = await supabase
    .from("mov_vista_proceso_activo")
    .select("*")

  // Obtener últimos procesos completados en una sola query
  const { data: ultimosCompletados } = await supabase.rpc('obtener_ultimos_procesos_completados')

  // Crear Maps para búsqueda O(1)
  const procesosActivosMap = new Map(
    procesosActivos?.map(p => [p.cuenta_id, p]) || []
  )

  const ultimosCompletadosMap = new Map(
    (ultimosCompletados as any[] | null)?.map(uc => [uc.cuenta_id, uc]) || []
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
          <h1 className="text-3xl font-bold">Cuentas de Vehículos</h1>
          <p className="text-muted-foreground">
            Gestiona todas las cuentas de vehículos registradas
          </p>
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
