"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, User, ShieldCheck, Car, Truck, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { BotonCerrarSesion } from "@/components/logout-button"
import type { LucideIcon } from "lucide-react"

const iconMap: Record<string, LucideIcon> = { Car, Truck, Scale }

export interface NavItem {
  href: string
  label: string
  icon?: LucideIcon
  badge?: string | number
  exact?: boolean
}

export interface MobileUserInfo {
  nombre: string
  rol: string
  rolColor: string
  otrosModulos?: { href: string; label: string; iconName?: string }[]
  esSuperAdmin?: boolean
}

interface MobileNavProps {
  title: string
  items: NavItem[]
  userInfo?: MobileUserInfo
}

export function MobileNav({ title, items, userInfo }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[18rem] flex flex-col">
          <SheetHeader className="pb-2">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <nav className="mt-2 flex flex-col gap-1.5">
            {items.map((item) => {
              const Icon = item.icon
              const active = isActive(item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {userInfo && (
            <div className="mt-auto border-t pt-5 pb-3 space-y-4">
              {userInfo.otrosModulos && userInfo.otrosModulos.length > 0 && (
                <div>
                  <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ir a</p>
                  {userInfo.otrosModulos.map((m) => {
                    const Icon = m.iconName ? iconMap[m.iconName] : null
                    return (
                      <Link
                        key={m.href}
                        href={m.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        {m.label}
                      </Link>
                    )
                  })}
                </div>
              )}

              {userInfo.esSuperAdmin && (
                <Link
                  href="/superadmin/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Panel Admin
                </Link>
              )}

              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/50">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{userInfo.nombre}</p>
                  <Badge variant="outline" className={`mt-1 text-xs ${userInfo.rolColor}`}>
                    {userInfo.rol}
                  </Badge>
                </div>
              </div>

              <div className="px-3">
                <BotonCerrarSesion className="w-full" />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
