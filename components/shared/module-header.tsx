import { User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BotonCerrarSesion } from "@/components/logout-button"
import { MobileNav } from "@/components/shared/mobile-nav"
import { SkipLink } from "@/components/ui/skip-link"
import { ModuleSwitcher } from "@/components/shared/module-switcher"
import type { NavItem, MobileUserInfo } from "@/components/shared/mobile-nav"
import type { RolModulo } from "@/lib/types/layout"
import type { SwitcherModulo } from "@/components/shared/module-switcher"

export type { SwitcherModulo }

interface ModuleHeaderProps {
  title: string
  subtitle: string
  iconName: string
  iconBgClass: string
  iconColorClass: string
  nombreCapitalizado: string
  rolModulo: RolModulo
  rolColors: Record<string, string>
  esSuperAdmin: boolean
  otrosModulos: SwitcherModulo[]
  mobileNavItems: NavItem[]
  mobileUserInfo: MobileUserInfo
  children: React.ReactNode
}

export function ModuleHeader({
  title,
  subtitle,
  iconName,
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
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-[4.5rem] items-center justify-between">
            <div className="flex items-center gap-4">
              <MobileNav
                title={title}
                items={mobileNavItems}
                userInfo={mobileUserInfo}
              />
              <ModuleSwitcher
                title={title}
                subtitle={subtitle}
                iconName={iconName}
                iconBgClass={iconBgClass}
                iconColorClass={iconColorClass}
                otrosModulos={otrosModulos}
                esSuperAdmin={esSuperAdmin}
              />
            </div>

            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="text-right">
                  <p className="text-sm font-medium leading-none">{nombreCapitalizado}</p>
                  <Badge variant="outline" className={`mt-1.5 text-xs ${rolColorClass}`}>
                    {rolModulo.nombre}
                  </Badge>
                </div>
              </div>

              <div className="h-8 w-px bg-border" />
              <BotonCerrarSesion />
            </div>
          </div>

          {children}
        </div>
      </header>
    </>
  )
}
