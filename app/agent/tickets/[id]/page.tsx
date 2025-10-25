import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TicketDetailsAgent } from "@/components/detalles-ticket-agente"

export default async function AgentTicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Verificar si el usuario es agente o administrador
  if (profile?.rol !== "agente" && profile?.rol !== "administrador") {
    redirect("/dashboard")
  }

  // Obtener detalles del ticket
  const { data: ticket } = await supabase
    .from("tickets")
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
    redirect("/agent")
  }

  // Obtener todos los agentes para asignación
  const { data: agents } = await supabase.from("perfiles").select("id, nombre_completo, correo").in("rol", ["agente", "administrador"])

  return <TicketDetailsAgent ticket={ticket} agents={agents || []} currentUserId={user.id} />
}
