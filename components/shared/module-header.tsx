import Link from "next/link"
import { ShieldCheck, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BotonCerrarSesion } from "@/components/logout-button"
import { MobileNav } from "@/components/shared/mobile-nav"
import { SkipLink } from "@/components/ui/skip-link"
import type { LucideIcon } from "lucide-react"
import type { NavItem, MobileUserInfo } from "@/components/shared/mobile-nav"
import type { RolModulo } from "@/lib/types/layout"

export interface OtroModulo {
  href: string
  label: string
  icon: LucideIcon
}

interface ModuleHeaderProps {
  title: string
  subtitle: string
  icon: LucideIcon
  /** Clase Tailwind para el fondo del icono, ej: "bg-primary/10" */
  iconBgClass: string
  /** Clase Tailwind para el color del icono, ej: "text-primary" */
  iconColorClass: string
  nombreCapitalizado: string
  rolModulo: RolModulo
  rolColors: Record<string, string>
  esSuperAdmin: boolean
  otrosModulos: OtroModulo[]
  mobileNavItems: NavItem[]
  mobileUserInfo: MobileUserInfo
  /** NavTabs del módulo */
  children: React.ReactNode
}

export function ModuleHeader({
  title,
  subtitle,
  icon: Icon,
  iconBgClass,
  iconColorClass,
  nombreCapitalizado,
  rolModulo,
  rolColors,
  esSuperAdmin,
  otrosModulos,
  mobileNavItems,
  mobileUserInfo,
  children,
}: ModuleHeaderProps) {
  const rolColorClass = rolColors[rolModulo.codigo] ?? rolColors["sin_rol"] ?? ""

  return (
    <>
      <SkipLink href="#main-content">Saltar al contenido principal</SkipLink>

      <header
        className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        role="banner"
      >
        <div className="container mx-auto px-3 sm:px-4">
          {/* Top bar */}
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <MobileNav
                title={title}
                items={mobileNavItems}
                userInfo={mobileUserInfo}
              />
              <div className="flex items-center gap-2">
                <div className={`rounded-lg p-2 ${iconBgClass}`}>
                  <Icon className={`h-5 w-5 ${iconColorClass}`} />
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-none">{title}</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">{subtitle}</p>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="text-right">
                  <p className="text-sm font-medium leading-none">{nombreCapitalizado}</p>
                  <Badge variant="outline" className={`mt-1 text-xs ${rolColorClass}`}>
                    {rolModulo.nombre}
                  </Badge>
                </div>
              </div>

              {otrosModulos.map((modulo) => {
                const ModuloIcon = modulo.icon
                return (
                  <Link
                    key={modulo.href}
                    href={modulo.href}
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md border px-2.5 py-1.5"
                  >
                    <ModuloIcon className="h-3.5 w-3.5" />
                    {modulo.label}
                  </Link>
                )
              })}

              {esSuperAdmin && (
                <Link
                  href="/superadmin/dashboard"
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md border px-2.5 py-1.5"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Panel Admin
                </Link>
              )}

              <div className="h-8 w-px bg-border" />
              <BotonCerrarSesion />
            </div>
          </div>

          {/* NavTabs del módulo */}
          {children}
        </div>
      </header>
    </>
  )
}
