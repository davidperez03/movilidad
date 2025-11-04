import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UserDetailsAdmin } from "@/components/tickets/detalles-usuario-admin"

export default async function DetalleUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
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
    redirect("/tickets")
  }

  // Obtener detalles del usuario
  const { data: userProfile } = await supabase.from("perfiles").select("*").eq("id", id).single()

  if (!userProfile) {
    redirect("/tickets")
  }

  // Obtener tickets del usuario
  const { data: userTickets } = await supabase
    .from("tks_tickets")
    .select("*")
    .eq("creado_por", id)
    .order("creado_en", { ascending: false })

  return <UserDetailsAdmin userProfile={userProfile} tickets={userTickets || []} />
}
