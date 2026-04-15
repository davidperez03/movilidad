"use client"

import { LayoutDashboard, Activity, FileText, ArrowRightLeft, ArrowDownToLine, FileBarChart } from "lucide-react"
import { NavTabsGeneric } from "@/components/shared/nav-tabs-generic"
import type { NavItem } from "@/components/shared/mobile-nav"
import type { NavTabItem } from "@/components/shared/nav-tabs-generic"

export const movilidadNavItems: NavItem[] = [
  { href: "/movilidad", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/movilidad/estado", label: "Estado General", icon: Activity },
  { href: "/movilidad/cuentas", label: "Cuentas", icon: FileText },
  { href: "/movilidad/traslados", label: "Traslados", icon: ArrowRightLeft },
  { href: "/movilidad/radicaciones", label: "Radicaciones", icon: ArrowDownToLine },
  { href: "/movilidad/reportes", label: "Reportes", icon: FileBarChart },
]

interface NavTabsProps {
  trasladosActivos: number | null
  radicacionesActivas: number | null
  novedadesPendientes: number | null
}

export function NavTabs({ trasladosActivos, radicacionesActivas, novedadesPendientes }: NavTabsProps) {
  const items: NavTabItem[] = [
    { href: "/movilidad", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/movilidad/estado", label: "Estado General", icon: Activity },
    { href: "/movilidad/cuentas", label: "Cuentas", icon: FileText },
    { href: "/movilidad/traslados", label: "Traslados", icon: ArrowRightLeft, badge: trasladosActivos },
    { href: "/movilidad/radicaciones", label: "Radicaciones", icon: ArrowDownToLine, badge: radicacionesActivas },
    { href: "/movilidad/reportes", label: "Reportes", icon: FileBarChart },
  ]

  return (
    <NavTabsGeneric
      items={items}
      ariaLabel="Navegación principal de Movilidad"
      globalBadge={
        novedadesPendientes && novedadesPendientes > 0
          ? { count: novedadesPendientes, label: "novedades pendientes" }
          : null
      }
    />
  )
}
