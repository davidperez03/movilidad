"use client"

import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, ClipboardCheck, Truck, Users } from "lucide-react"
import { NavLink } from "@/components/shared/nav-link"
import type { NavItem } from "@/components/shared/mobile-nav"

export const parqueaderoNavItems: NavItem[] = [
  { href: "/parqueadero", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/parqueadero/inspecciones", label: "Inspecciones", icon: ClipboardCheck },
  { href: "/parqueadero/vehiculos", label: "Vehículos", icon: Truck },
  { href: "/parqueadero/personal", label: "Personal", icon: Users },
]

interface NavTabsProps {
  inspeccionesHoy: number | null
  vehiculosActivos: number | null
  alertasLicencias?: number | null
}

export function NavTabsParqueadero({ inspeccionesHoy, vehiculosActivos, alertasLicencias }: NavTabsProps) {
  return (
    <nav className="hidden md:flex gap-1 -mb-px" role="navigation" aria-label="Navegación principal de Parqueadero">
      <NavLink href="/parqueadero" exact activeClass="border-cyan-600 text-foreground" inactiveHoverClass="hover:border-cyan-600/50">
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </NavLink>

      <NavLink href="/parqueadero/inspecciones" activeClass="border-cyan-600 text-foreground" inactiveHoverClass="hover:border-cyan-600/50">
        <ClipboardCheck className="h-4 w-4" />
        Inspecciones
        {inspeccionesHoy && inspeccionesHoy > 0 ? (
          <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
            {inspeccionesHoy} hoy
          </Badge>
        ) : null}
      </NavLink>

      <NavLink href="/parqueadero/vehiculos" activeClass="border-cyan-600 text-foreground" inactiveHoverClass="hover:border-cyan-600/50">
        <Truck className="h-4 w-4" />
        Vehículos
        {vehiculosActivos && vehiculosActivos > 0 ? (
          <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
            {vehiculosActivos}
          </Badge>
        ) : null}
      </NavLink>

      <NavLink href="/parqueadero/personal" activeClass="border-cyan-600 text-foreground" inactiveHoverClass="hover:border-cyan-600/50">
        <Users className="h-4 w-4" />
        Personal
        {alertasLicencias && alertasLicencias > 0 ? (
          <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-xs">
            {alertasLicencias}
          </Badge>
        ) : null}
      </NavLink>
    </nav>
  )
}
