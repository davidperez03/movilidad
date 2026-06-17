import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { obtenerPermisosUsuario } from "@/lib/server/permisos"
import { FormularioInspeccion } from "@/components/parqueadero/inspecciones/formulario-inspeccion"
import type { VistaPersonal } from "@/lib/parqueadero/types"

export default async function NuevaInspeccionPage({
  searchParams,
}: {
  searchParams: Promise<{ turno_id?: string; vehiculo_id?: string }>
}) {
  const { parqueadero: permisos } = await obtenerPermisosUsuario()
  if (!permisos.crear_inspecciones) redirect("/parqueadero")

  const { turno_id, vehiculo_id } = await searchParams
  const supabase = await createClient()

  const { data: vehiculos } = await supabase
    .from("parq_vista_vehiculos")
    .select("id, placa, marca, modelo, tipo, soat_vencimiento, tecnomecanica_vencimiento, estado_soat, estado_tecnomecanica")
    .eq("activo", true)
    .order("placa")

  const { data: itemsCatalogo } = await supabase
    .from("parq_items_catalogo")
    .select("*")
    .eq("activo", true)
    .order("orden")

  const { data: personalParqueadero } = await supabase
    .from("parq_vista_personal")
    .select("*")

  const operadores: VistaPersonal[] = (personalParqueadero || []).filter(
    (u) => u.rol_codigo === "parq_operario"
  )

  const auxiliares: VistaPersonal[] = (personalParqueadero || []).filter(
    (u) => u.rol_codigo === "parq_auxiliar"
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nueva Inspección</h1>
        <p className="text-muted-foreground">
          Registra una nueva inspección preoperacional de grúa de plataforma
        </p>
      </div>

      <FormularioInspeccion
        vehiculos={vehiculos || []}
        itemsCatalogo={itemsCatalogo || []}
        operadores={operadores}
        auxiliares={auxiliares}
        turnoId={turno_id}
        vehiculoIdInicial={vehiculo_id}
      />
    </div>
  )
}
