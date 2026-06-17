"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavLinkProps {
  href: string
  children: React.ReactNode
  exact?: boolean
  activeClass?: string
  inactiveHoverClass?: string
  compact?: boolean
}

export function NavLink({
  href,
  children,
  exact = false,
  activeClass = "border-primary text-foreground",
  inactiveHoverClass = "hover:border-primary/50",
  compact = false,
}: NavLinkProps) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 border-b-2 py-3.5 text-sm font-medium transition-colors",
        compact ? "px-3 lg:px-5" : "px-5",
        isActive
          ? activeClass
          : cn("border-transparent text-muted-foreground hover:text-foreground", inactiveHoverClass)
      )}
    >
      {children}
    </Link>
  )
}
