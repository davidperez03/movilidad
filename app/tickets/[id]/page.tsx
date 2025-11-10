import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TicketDetailsUser } from "@/components/tickets/detalles-ticket-usuario"
import { TicketDetailsAgent } from "@/components/tickets/detalles-ticket-agente"
import { TicketDetailsAdmin } from "@/components/tickets/detalles-ticket-administrador"

export default async function DetalleTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Obtener perfil de usuario
  const { data: profile } = await supabase.from("perfiles").select("rol_global").eq("id", user.id).single()

  // Verificar si es superadmin
  const isSuperAdmin = profile?.rol_global === "superadmin"

  // Obtener rol en módulo tickets
  const { data: rolTicketsData } = await supabase
    .from("usuarios_roles")
    .select(`
      roles_modulo (
        codigo,
        permisos
      )
    `)
    .eq("usuario_id", user.id)
    .eq("modulo_id", "tickets")
    .single()

  const rolTickets = rolTicketsData?.roles_modulo as any
  const codigoRol = isSuperAdmin ? "tks_administrador" : rolTickets?.codigo || "tks_usuario"
  const permisos = isSuperAdmin
    ? { ver_todos: true, editar_todos: true }
    : (rolTickets?.permisos || {})

  const isAdmin = isSuperAdmin || codigoRol === "tks_administrador"
  const isAgent = isSuperAdmin || codigoRol === "tks_agente" || isAdmin
  const canViewAll = isSuperAdmin || permisos.ver_todos === true

  // Obtener detalles del ticket
  const { data: ticket } = await supabase
    .from("tks_tickets")
    .select(
      `
      *,
      perfil_creador:perfiles!tks_tickets_creado_por_fkey(id, nombre_completo, correo),
      perfil_asignado:perfiles!tks_tickets_asignado_a_fkey(id, nombre_completo, correo)
    `,
    )
    .eq("id", id)
    .single()

  if (!ticket) {
    redirect("/tickets")
  }

  // Verificar permisos: usuarios solo pueden ver sus propios tickets
  if (!isAgent && ticket.creado_por !== user.id) {
    redirect("/tickets")
  }

  // Obtener comentarios
  const { data: comments } = await supabase
    .from("tks_comentarios")
    .select(
      `
      *,
      usuario:perfiles!tks_comentarios_usuario_id_fkey(id, nombre_completo, correo)
    `,
    )
    .eq("ticket_id", id)
    .order("creado_en", { ascending: true })

  // Para agentes y admins: obtener lista de agentes para asignación
  const { data: agentsData } = isAgent
    ? await supabase
        .from("usuarios_roles")
        .select(`
          perfiles (
            id,
            nombre_completo,
            correo
          ),
          roles_modulo (
            codigo
          )
        `)
        .eq("modulo_id", "tickets")
        .in("roles_modulo.codigo", ["tks_agente", "tks_administrador"])
    : { data: null }

  const agents = isAgent
    ? (agentsData?.map((a: any) => a.perfiles) || [])
    : null

  // Renderizar componente según rol
  if (isAdmin) {
    return <TicketDetailsAdmin ticket={ticket} agents={agents || []} />
  }

  if (isAgent) {
    return <TicketDetailsAgent ticket={ticket} agents={agents || []} currentUserId={user.id} />
  }

  // Usuario normal
  return <TicketDetailsUser ticket={ticket} comments={comments || []} currentUserId={user.id} />
}
