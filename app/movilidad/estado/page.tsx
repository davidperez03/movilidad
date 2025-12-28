import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileSpreadsheet, ArrowLeft } from "lucide-react"
import { VehicleTable } from "@/components/dashboard/vehicle-table"

export default async function EstadoVehiculosPage() {
  const supabase = await createClient()

  // Obtener todos los vehículos con su proceso activo (si tienen)
  const { data: vehiculosActivos } = await supabase
    .from("mov_vista_proceso_activo")
    .select("*")
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estado de Vehículos</h1>
          <p className="text-muted-foreground">
            Vista general de todos los vehículos y sus procesos activos
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/movilidad">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Listado Completo de Vehículos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleTable vehicles={vehiculos || []} />
        </CardContent>
      </Card>
    </div>
  )
}
