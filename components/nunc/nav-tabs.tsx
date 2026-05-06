"use client"

import { Scale } from "lucide-react"
import { NavTabsGeneric } from "@/components/shared/nav-tabs-generic"
import type { NavItem } from "@/components/shared/mobile-nav"
import type { NavTabItem } from "@/components/shared/nav-tabs-generic"

export const nuncNavItems: NavItem[] = [
  { href: "/nunc", label: "Sesiones", icon: Scale },
]

export function NavTabsNunc() {
  const items: NavTabItem[] = [
    { href: "/nunc", label: "Sesiones", icon: Scale },
  ]

  return <NavTabsGeneric items={items} ariaLabel="Navegación principal de NUNC" />
}
