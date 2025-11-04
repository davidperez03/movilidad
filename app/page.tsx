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

  // Si hay usuario, obtener su perfil para redirigir según rol
  const { data: profile } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single()

  // Redirigir según rol
  if (profile?.rol === "administrador" || profile?.rol === "agente") {
    redirect("/movilidad")
  } else {
    redirect("/tickets")
  }
}
