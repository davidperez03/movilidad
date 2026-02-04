import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { obtenerPermisosUsuario } from "@/lib/server/permisos"
import { TablaVehiculos } from "@/components/parqueadero/vehiculos/tabla-vehiculos"
import { ModalNuevoVehiculo } from "@/components/parqueadero/vehiculos/modal-nuevo-vehiculo"

export default async function VehiculosPage() {
  const supabase = await createClient()
  const { parqueadero: permisos } = await obtenerPermisosUsuario()

  const { data: vehiculos } = await supabase
    .from("parq_vista_vehiculos")
    .select("*")
    .order("placa", { ascending: true })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehículos</h1>
          <p className="text-muted-foreground">Gestión de grúas y vehículos del parqueadero</p>
        </div>
        {permisos.gestionar_vehiculos && (
          <ModalNuevoVehiculo />
        )}
      </div>

      {/* Tabla */}
      <TablaVehiculos
        vehiculos={vehiculos || []}
        permisos={permisos}
      />
    </div>
  )
}
