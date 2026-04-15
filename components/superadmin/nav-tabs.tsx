"use client"

import { LayoutDashboard, Users, Activity, FileText } from "lucide-react"
import { NavLink } from "@/components/shared/nav-link"
import { ModulosDropdown } from "@/components/superadmin/modulos-dropdown"
import type { NavItem } from "@/components/shared/mobile-nav"

const tabItems = [
  { href: "/superadmin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/superadmin/usuarios", label: "Usuarios", icon: Users },
  { href: "/superadmin/sesiones", label: "Sesiones", icon: Activity },
  { href: "/superadmin/auditoria", label: "Auditoría", icon: FileText },
]

export const superAdminNavItems: NavItem[] = [
  ...tabItems.map((i) => ({ href: i.href, label: i.label, icon: i.icon, exact: i.exact })),
  { href: "/movilidad", label: "Movilidad" },
  { href: "/parqueadero", label: "Parqueadero" },
]

export function SuperAdminNavTabs() {
  return (
    <nav
      className="hidden md:flex gap-0.5 -mb-px"
      role="navigation"
      aria-label="Navegación SuperAdmin"
    >
      {tabItems.map((item) => {
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
  )
}
