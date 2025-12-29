import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { BotonNuevaCuenta } from "@/components/movilidad/cuentas-acciones"
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

  // Obtener último proceso completado de todas las cuentas
  const { data: ultimosCompletados } = await supabase.rpc('obtener_ultimos_procesos_completados')

  // Obtener procesos activos para cada cuenta
  const cuentasConProcesos = await Promise.all(
    (cuentas || []).map(async (cuenta) => {
      const { data: procesoActivo } = await supabase
        .from("mov_vista_proceso_activo")
        .select("*")
        .eq("cuenta_id", cuenta.id)
        .single()

      const ultimoCompletado = (ultimosCompletados as any[] | null)?.find((uc: any) => uc.cuenta_id === cuenta.id)

      return {
        ...cuenta,
        procesoActivo,
        ultimo_proceso_completado: ultimoCompletado || null,
      }
    })
  )

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
