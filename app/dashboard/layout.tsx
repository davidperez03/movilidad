import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Obtener perfil de usuario para verificar rol
  const { data: profile } = await supabase.from("perfiles").select("rol").eq("id", user.id).single()

  // Redirigir según el rol - MOVILIDAD ES EL PRINCIPAL
  if (profile?.rol === "administrador" || profile?.rol === "agente") {
    redirect("/movilidad")
  }

  return <>{children}</>
}
