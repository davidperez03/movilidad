import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/consulta")

  const { data: profile } = await supabase
    .from("perfiles")
    .select("rol_global")
    .eq("id", user.id)
    .single()

  if (profile?.rol_global === "superadmin") redirect("/superadmin/dashboard")

  const { data: rolMovilidad } = await supabase
    .from("usuarios_roles")
    .select("id")
    .eq("usuario_id", user.id)
    .eq("modulo_id", "movilidad")
    .single()

  if (rolMovilidad) redirect("/movilidad")

  redirect("/sin-acceso")
}
