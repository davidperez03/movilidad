"use client"

import { LayoutDashboard, ClipboardCheck, Truck, Users, Package, CalendarCheck, Timer, ArrowUpFromLine } from "lucide-react"
import { NavTabsGeneric } from "@/components/shared/nav-tabs-generic"
import type { NavItem } from "@/components/shared/mobile-nav"
import type { NavTabItem } from "@/components/shared/nav-tabs-generic"

export const parqueaderoNavItems: NavItem[] = [
  { href: "/parqueadero",             label: "Dashboard",    icon: LayoutDashboard, exact: true },
  { href: "/parqueadero/turnos",      label: "Turnos",       icon: Timer },
  { href: "/parqueadero/inspecciones",label: "Inspecciones", icon: ClipboardCheck },
  { href: "/parqueadero/vehiculos",   label: "Vehículos",    icon: Truck },
  { href: "/parqueadero/personal",    label: "Personal",     icon: Users },
  { href: "/parqueadero/inventarios", label: "Inventarios",  icon: Package },
  { href: "/parqueadero/asistencia",  label: "Asistencia",   icon: CalendarCheck },
  { href: "/parqueadero/salidas-grua", label: "Salidas",     icon: ArrowUpFromLine },
]

interface NavTabsProps {
  inspeccionesHoy: number | null
  vehiculosActivos: number | null
  alertasLicencias?: number | null
}

export function NavTabsParqueadero({ inspeccionesHoy, vehiculosActivos, alertasLicencias }: NavTabsProps) {
  const items: NavTabItem[] = [
    { href: "/parqueadero",              label: "Dashboard",    icon: LayoutDashboard, exact: true },
    { href: "/parqueadero/turnos",       label: "Turnos",       icon: Timer },
    {
      href: "/parqueadero/inspecciones",
      label: "Inspecciones",
      icon: ClipboardCheck,
      badge: inspeccionesHoy,
      badgeSuffix: "hoy",
    },
    { href: "/parqueadero/vehiculos",    label: "Vehículos",    icon: Truck, badge: vehiculosActivos },
    {
      href: "/parqueadero/personal",
      label: "Personal",
      icon: Users,
      badge: alertasLicencias,
      badgeVariant: "destructive",
    },
    { href: "/parqueadero/inventarios",  label: "Inventarios",  icon: Package },
    { href: "/parqueadero/asistencia",    label: "Asistencia",   icon: CalendarCheck },
    { href: "/parqueadero/salidas-grua",  label: "Salidas",      icon: ArrowUpFromLine },
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
