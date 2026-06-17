import { createClient } from "@/lib/supabase/server"
import { obtenerPermisosUsuario } from "@/lib/server/permisos"
import { redirect } from "next/navigation"
import { FormularioTurno } from "@/components/parqueadero/turnos/formulario-turno"

export default async function NuevoTurnoPage() {
  const { parqueadero: permisos } = await obtenerPermisosUsuario()
  if (!permisos.gestionar_vehiculos) redirect("/parqueadero/turnos")

  const supabase = await createClient()

  const { data: vehiculos } = await supabase
    .from("parq_vista_vehiculos")
    .select("id, placa, marca, modelo")
    .eq("activo", true)
    .order("placa")

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Abrir Turno</h1>
        <p className="text-muted-foreground text-sm">Registre el inicio de un turno operativo</p>
      </div>
      <FormularioTurno vehiculos={vehiculos ?? []} />
    </div>
  )
}
