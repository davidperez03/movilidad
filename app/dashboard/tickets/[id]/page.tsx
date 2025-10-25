import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TicketDetailsUser } from "@/components/detalles-ticket-usuario"

export default async function UserTicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
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
    redirect("/dashboard")
  }

  // Verificar si el usuario es dueño de este ticket
  if (ticket.creado_por !== user.id) {
    redirect("/dashboard")
  }

  // Obtener comentarios para este ticket
  const { data: comments } = await supabase
    .from("comentarios")
    .select(
      `
      *,
      usuario:perfiles!comentarios_usuario_id_fkey(id, nombre_completo, correo, rol)
    `,
    )
    .eq("ticket_id", id)
    .order("creado_en", { ascending: true })

  return <TicketDetailsUser ticket={ticket} comments={comments || []} currentUserId={user.id} />
}
