import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ShieldCheck } from "lucide-react"
import { BotonCerrarSesion } from "@/components/logout-button"
import { MobileNav } from "@/components/shared/mobile-nav"
import { SuperAdminNavTabs, superAdminNavItems } from "@/components/superadmin/nav-tabs"
import { capitalizeName } from "@/lib/utils/capitalize"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null
  if (!user) redirect("/auth/login")

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol_global, nombre_completo")
    .eq("id", user.id)
    .single()

  if (perfil?.rol_global !== "superadmin") redirect("/sin-acceso")

  const nombre = capitalizeName(perfil?.nombre_completo) || user.email || ""

  return (
    <div className="min-h-screen bg-muted/30">
      <header
        className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        role="banner"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-[4.5rem] items-center justify-between">
            <div className="flex items-center gap-4">
              <MobileNav
                title="SuperAdmin"
                items={superAdminNavItems}
                userInfo={{
                  nombre,
                  rol: "Super Administrador",
                  rolColor: "text-primary border-primary/30",
                }}
              />
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-none">SuperAdmin</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block mt-0.5">
                    Panel de administración
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden sm:block">
              <BotonCerrarSesion />
            </div>
          </div>

          <SuperAdminNavTabs />
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <Suspense>{children}</Suspense>
      </main>
    </div>
  )
}
