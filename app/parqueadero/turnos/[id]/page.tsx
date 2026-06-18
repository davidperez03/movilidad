import { createClient } from "@/lib/supabase/server"
import { obtenerPermisosUsuario } from "@/lib/server/permisos"
import { notFound } from "next/navigation"
import { DetalleTurno } from "@/components/parqueadero/turnos/detalle-turno"

export default async function DetalleTurnoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { parqueadero: permisos, esSuperadmin } = await obtenerPermisosUsuario()

  const [{ data: turno }, { data: inspecciones }, { data: novedades }] = await Promise.all([
    supabase.from("parq_vista_turnos").select("*").eq("id", id).single(),
    supabase
      .from("parq_vista_inspecciones")
      .select("id, consecutivo, fecha, hora, es_apto, operador_nombre, auxiliar_nombre, km_inicio, items_buenos, items_regulares, items_malos")
      .eq("turno_id", id)
      .order("creado_en", { ascending: true }),
    supabase
      .from("parq_turno_novedades")
      .select("*")
      .eq("turno_id", id)
      .order("hora_inicio", { ascending: true }),
  ])

  if (!turno) notFound()

  // Inspecciones del mismo vehículo/fecha/tipo sin turno asignado (hechas antes de abrir el turno)
  const { data: sinTurno } = await supabase
    .from("parq_vista_inspecciones")
    .select("id, consecutivo, hora, es_apto, operador_nombre, km_inicio")
    .eq("vehiculo_id", turno.vehiculo_id)
    .eq("fecha", turno.fecha)
    .eq("turno", turno.tipo_turno)
    .is("turno_id", null)
    .order("hora", { ascending: true })

  return (
    <DetalleTurno
      turno={turno}
      inspecciones={inspecciones ?? []}
      inspeccionesSinTurno={sinTurno ?? []}
      novedades={novedades ?? []}
      permisos={permisos}
      esSuperadmin={esSuperadmin}
    />
  )
}
