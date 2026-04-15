import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ShieldCheck, LayoutDashboard, Users, FileText, Activity } from "lucide-react"
import { BotonCerrarSesion } from "@/components/logout-button"
import { MobileNav } from "@/components/shared/mobile-nav"
import { NavLink } from "@/components/shared/nav-link"
import { ModulosDropdown } from "@/components/superadmin/modulos-dropdown"
import type { NavItem } from "@/components/shared/mobile-nav"

export const dynamic = "force-dynamic"

const navItems = [
  { href: "/superadmin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/superadmin/usuarios", label: "Usuarios", icon: Users },
  { href: "/superadmin/sesiones", label: "Sesiones", icon: Activity },
  { href: "/superadmin/auditoria", label: "Auditoría", icon: FileText },
]

const mobileItems: NavItem[] = [
  ...navItems.map((i) => ({ href: i.href, label: i.label, icon: i.icon, exact: i.exact })),
  { href: "/movilidad", label: "Movilidad" },
  { href: "/parqueadero", label: "Parqueadero" },
]

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol_global")
    .eq("id", user.id)
    .single()

  if (perfil?.rol_global !== "superadmin") redirect("/sin-acceso")

  return (
    <div className="min-h-screen bg-muted/30">
      <header
        className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        role="banner"
      >
        <div className="container mx-auto px-4 sm:px-6">
          {/* Top bar */}
          <div className="flex h-[4.5rem] items-center justify-between">
            <div className="flex items-center gap-4">
              <MobileNav title="SuperAdmin" items={mobileItems} />
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
            <BotonCerrarSesion />
          </div>

          {/* Navigation tabs */}
          <nav className="hidden md:flex gap-0.5 -mb-px" role="navigation" aria-label="Navegación SuperAdmin">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink key={item.href} href={item.href} exact={item.exact}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
            <ModulosDropdown />
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
