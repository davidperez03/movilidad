import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TicketDetailsAdmin } from "@/components/detalles-ticket-administrador"

export default async function AdminTicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Obtener perfil de usuario
  const { data: profile } = await supabase.from("perfiles").select("*").eq("id", user.id).single()

  // Verificar si el usuario es administrador
  if (profile?.rol !== "administrador") {
    redirect("/dashboard")
  }

  // Obtener detalles del ticket
  const { data: ticket } = await supabase
    .from("tks_tickets")
    .select(
      `
      *,
      perfil_creador:perfiles!tickets_creado_por_fkey(id, nombre_completo, correo),
      perfil_asignado:perfiles!tickets_asignado_a_fkey(id, nombre_completo, correo)
    `,
    )
    .eq("id", id)
    .single()

  if (!ticket) {
    redirect("/admin")
  }

  // Obtener todos los agentes para asignación
  const { data: agents } = await supabase.from("perfiles").select("id, nombre_completo, correo").in("rol", ["agente", "administrador"])

  return <TicketDetailsAdmin ticket={ticket} agents={agents || []} />
}
