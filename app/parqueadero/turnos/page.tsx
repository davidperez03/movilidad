import { createClient } from "@/lib/supabase/server"
import { obtenerPermisosUsuario } from "@/lib/server/permisos"
import { TablaTurnos } from "@/components/parqueadero/turnos/tabla-turnos"
import { ExportarTurnos } from "@/components/parqueadero/turnos/exportar-turnos"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function TurnosPage() {
  const supabase = await createClient()
  const { parqueadero: permisos } = await obtenerPermisosUsuario()

  const { data: turnos } = await supabase
    .from("parq_vista_turnos")
    .select("*")
    .order("fecha", { ascending: false })
    .order("hora_inicio", { ascending: false })
    .limit(200)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Turnos</h1>
          <p className="text-muted-foreground text-sm">Control operativo de turnos de grúas</p>
        </div>
        <div className="flex gap-2">
          <ExportarTurnos />
          {permisos.gestionar_vehiculos && (
            <Button asChild>
              <Link href="/parqueadero/turnos/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Abrir turno
              </Link>
            </Button>
          )}
        </div>
      </div>

      <TablaTurnos turnos={turnos ?? []} />
    </div>
  )
}
