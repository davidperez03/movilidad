import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { obtenerPermisosUsuario } from "@/lib/server/permisos"
import { FormularioInspeccion } from "@/components/parqueadero/inspecciones/formulario-inspeccion"
import type { VistaPersonal } from "@/lib/parqueadero/types"

export default async function NuevaInspeccionPage() {
  const { parqueadero: permisos } = await obtenerPermisosUsuario()

  if (!permisos.crear_inspecciones) {
    redirect("/parqueadero")
  }

  const supabase = await createClient()

  // Obtener vehículos activos con estado de documentación
  const { data: vehiculos } = await supabase
    .from("parq_vista_vehiculos")
    .select("id, placa, marca, modelo, tipo, soat_vencimiento, tecnomecanica_vencimiento, estado_soat, estado_tecnomecanica")
    .eq("activo", true)
    .order("placa")

  // Obtener catálogo de items
  const { data: itemsCatalogo } = await supabase
    .from("parq_items_catalogo")
    .select("*")
    .eq("activo", true)
    .order("orden")

  // Obtener personal de parqueadero con datos de licencia
  const { data: personalParqueadero } = await supabase
    .from("parq_vista_personal")
    .select("*")

  // Filtrar operadores (solo operarios)
  const operadores: VistaPersonal[] = (personalParqueadero || []).filter(
    (u) => u.rol_codigo === "parq_operario"
  )

  // Filtrar auxiliares (solo auxiliares)
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
      />
    </div>
  )
}
