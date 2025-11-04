import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function TicketsLayout({
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

  // Los tickets ahora son accesibles para todos los roles
  // La vista se adapta según el rol en page.tsx
  return <>{children}</>
}
