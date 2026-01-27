import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { VehicleTable } from "@/components/dashboard/vehicle-table"

export default async function EstadoVehiculosPage() {
  const supabase = await createClient()

  // Obtener todos los vehículos con su proceso activo (si tienen)
  // Ordenar por fecha de creación del proceso (más reciente primero), luego por placa
  const { data: vehiculosActivos } = await supabase
    .from("mov_vista_proceso_activo")
    .select("*")
    .order("proceso_creado_en", { ascending: false, nullsFirst: false })
    .order("placa", { ascending: true })

  // Obtener último proceso completado de cada vehículo
  const { data: ultimosCompletados } = await supabase.rpc('obtener_ultimos_procesos_completados')

  // Combinar datos: proceso activo + último completado
  const vehiculos = vehiculosActivos?.map(v => {
    const ultimoCompletado = (ultimosCompletados as any[] | null)?.find((uc: any) => uc.cuenta_id === v.cuenta_id)
    return {
      ...v,
      ultimo_proceso_completado: ultimoCompletado || null
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Estado General</h1>
        <p className="text-muted-foreground">Estado de vehículos y procesos</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <VehicleTable vehicles={vehiculos || []} />
        </CardContent>
      </Card>
    </div>
  )
}
