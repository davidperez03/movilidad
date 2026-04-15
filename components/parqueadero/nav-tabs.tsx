"use client"

import { LayoutDashboard, ClipboardCheck, Truck, Users } from "lucide-react"
import { NavTabsGeneric } from "@/components/shared/nav-tabs-generic"
import type { NavItem } from "@/components/shared/mobile-nav"
import type { NavTabItem } from "@/components/shared/nav-tabs-generic"

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
  const items: NavTabItem[] = [
    { href: "/parqueadero", label: "Dashboard", icon: LayoutDashboard, exact: true },
    {
      href: "/parqueadero/inspecciones",
      label: "Inspecciones",
      icon: ClipboardCheck,
      badge: inspeccionesHoy,
      badgeSuffix: "hoy",
    },
    { href: "/parqueadero/vehiculos", label: "Vehículos", icon: Truck, badge: vehiculosActivos },
    {
      href: "/parqueadero/personal",
      label: "Personal",
      icon: Users,
      badge: alertasLicencias,
      badgeVariant: "destructive",
    },
  ]

  return (
    <NavTabsGeneric
      items={items}
      ariaLabel="Navegación principal de Parqueadero"
      activeClass="border-cyan-600 text-foreground"
      inactiveHoverClass="hover:border-cyan-600/50"
    />
  )
}
