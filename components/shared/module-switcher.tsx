"use client"

import { useState } from "react"
import Link from "next/link"
import { Car, Truck, ShieldCheck, ChevronDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const iconMap: Record<string, LucideIcon> = { Car, Truck, ShieldCheck }

export interface SwitcherModulo {
  href: string
  label: string
  descripcion: string
  iconName: string
}

interface ModuleSwitcherProps {
  title: string
  subtitle: string
  iconBgClass: string
  iconColorClass: string
  iconName: string
  otrosModulos: SwitcherModulo[]
  esSuperAdmin: boolean
}

export function ModuleSwitcher({
  title,
  subtitle,
  iconBgClass,
  iconColorClass,
  iconName,
  otrosModulos,
  esSuperAdmin,
}: ModuleSwitcherProps) {
  const [open, setOpen] = useState(false)

  const Icon = iconMap[iconName]
  const hasSwitchOptions = otrosModulos.length > 0 || esSuperAdmin

  if (!hasSwitchOptions) {
    return (
      <div className="flex items-center gap-3">
        <div className={`rounded-xl p-2.5 ${iconBgClass}`}>
          {Icon && <Icon className={`h-5 w-5 ${iconColorClass}`} />}
        </div>
        <div>
          <h1 className="text-lg font-bold leading-none">{title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-xl px-2 py-1.5 -ml-2 hover:bg-muted/60 transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className={`rounded-xl p-2.5 ${iconBgClass}`}>
          {Icon && <Icon className={`h-5 w-5 ${iconColorClass}`} />}
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-bold leading-none">{title}</h1>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{subtitle}</p>
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute top-full left-0 mt-2 w-60 rounded-xl border bg-popover shadow-lg z-20 overflow-hidden">
            <div className="px-3 py-2.5 border-b">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Cambiar módulo
              </p>
            </div>

            <div className="p-1.5 flex flex-col gap-0.5">
              {otrosModulos.map((modulo) => {
                const ModuloIcon = iconMap[modulo.iconName]
                return (
                  <Link
                    key={modulo.href}
                    href={modulo.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent transition-colors"
                  >
                    {ModuloIcon && (
                      <div className="rounded-lg bg-muted p-1.5 shrink-0">
                        <ModuloIcon className="h-4 w-4 text-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-none">{modulo.label}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {modulo.descripcion}
                      </p>
                    </div>
                  </Link>
                )
              })}

              {esSuperAdmin && (
                <>
                  {otrosModulos.length > 0 && <div className="my-1 border-t" />}
                  <Link
                    href="/superadmin/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent transition-colors"
                  >
                    <div className="rounded-lg bg-muted p-1.5 shrink-0">
                      <ShieldCheck className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-none">Panel Admin</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Gestión de usuarios
                      </p>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
