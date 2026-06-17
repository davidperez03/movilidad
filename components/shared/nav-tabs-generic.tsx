"use client"

import { Badge } from "@/components/ui/badge"
import { NavLink } from "@/components/shared/nav-link"
import type { LucideIcon } from "lucide-react"

export interface NavTabItem {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
  badge?: number | null
  badgeVariant?: "secondary" | "destructive"
  badgeSuffix?: string
}

interface NavTabsGenericProps {
  items: NavTabItem[]
  ariaLabel?: string
  globalBadge?: { count: number; label: string } | null
  activeClass?: string
  inactiveHoverClass?: string
  /** En md muestra solo íconos, en lg muestra ícono + texto. Default: true */
  compact?: boolean
}

export function NavTabsGeneric({
  items,
  ariaLabel = "Navegación principal",
  globalBadge,
  activeClass,
  inactiveHoverClass,
  compact = true,
}: NavTabsGenericProps) {
  return (
    <nav
      className="hidden md:flex gap-0.5 -mb-px"
      role="navigation"
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.href}
            href={item.href}
            exact={item.exact}
            {...(activeClass ? { activeClass } : {})}
            {...(inactiveHoverClass ? { inactiveHoverClass } : {})}
            {...(compact ? { compact: true } : {})}
          >
            {/* Ícono con badge numérico pequeño en md, badge completo en lg */}
            <span className="relative">
              <Icon className="h-4 w-4" />
              {compact && item.badge != null && item.badge > 0 && (
                <span className="lg:hidden absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </span>
            <span className={compact ? "hidden lg:inline" : undefined}>{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <Badge
                variant={item.badgeVariant ?? "secondary"}
                className={`ml-1 h-5 min-w-5 px-1 text-xs ${compact ? "hidden lg:inline-flex" : ""}`}
              >
                {item.badge}
                {item.badgeSuffix ? ` ${item.badgeSuffix}` : ""}
              </Badge>
            )}
          </NavLink>
        )
      })}

      {globalBadge && globalBadge.count > 0 && (
        <div className="ml-auto flex items-center gap-2 px-4 py-3">
          <Badge variant="destructive" className="h-6">
            {globalBadge.count} {globalBadge.label}
          </Badge>
        </div>
      )}
    </nav>
  )
}
