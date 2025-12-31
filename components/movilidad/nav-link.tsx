"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavLinkProps {
  href: string
  children: React.ReactNode
  exact?: boolean
}

export function NavLink({ href, children, exact = false }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
        isActive
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground"
      )}
    >
      {children}
    </Link>
  )
}
