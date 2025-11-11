import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()

  // Verificar si hay usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si no hay usuario, redirigir a consulta pública
  if (!user) {
    redirect("/consulta")
  }

  // Obtener perfil para verificar si es superadmin
  const { data: profile } = await supabase
    .from("perfiles")
    .select("rol_global")
    .eq("id", user.id)
    .single()

  // Si es superadmin, redirigir al panel de administración
  if (profile?.rol_global === "superadmin") {
    redirect("/superadmin/roles")
  }

  // Verificar si tiene acceso al módulo de movilidad
  const { data: rolMovilidad } = await supabase
    .from("usuarios_roles")
    .select("id")
    .eq("usuario_id", user.id)
    .eq("modulo_id", "movilidad")
    .single()

  // Si tiene acceso a movilidad, redirigir allí
  if (rolMovilidad) {
    redirect("/movilidad")
  }

  // Verificar si tiene acceso al módulo de tickets
  const { data: rolTickets } = await supabase
    .from("usuarios_roles")
    .select("id")
    .eq("usuario_id", user.id)
    .eq("modulo_id", "tickets")
    .single()

  // Si tiene acceso a tickets, redirigir allí
  if (rolTickets) {
    redirect("/tickets")
  }

  // Si no tiene acceso a ningún módulo, redirigir a página de sin acceso
  redirect("/sin-acceso")
}
