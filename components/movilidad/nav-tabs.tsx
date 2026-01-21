"use client"

import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, Activity, FileText, ArrowRightLeft, ArrowDownToLine, FileBarChart } from "lucide-react"
import { NavLink } from "./nav-link"

interface NavTabsProps {
  trasladosActivos: number | null
  radicacionesActivas: number | null
  novedadesPendientes: number | null
}

export function NavTabs({ trasladosActivos, radicacionesActivas, novedadesPendientes }: NavTabsProps) {
  return (
    <nav className="flex gap-1 -mb-px" role="navigation" aria-label="Navegación principal de Movilidad">
      <NavLink href="/movilidad" exact>
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </NavLink>

      <NavLink href="/movilidad/estado">
        <Activity className="h-4 w-4" />
        Estado General
      </NavLink>

      <NavLink href="/movilidad/cuentas">
        <FileText className="h-4 w-4" />
        Cuentas
      </NavLink>

      <NavLink href="/movilidad/traslados">
        <ArrowRightLeft className="h-4 w-4" />
        Traslados
        {trasladosActivos && trasladosActivos > 0 ? (
          <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
            {trasladosActivos}
          </Badge>
        ) : null}
      </NavLink>

      <NavLink href="/movilidad/radicaciones">
        <ArrowDownToLine className="h-4 w-4" />
        Radicaciones
        {radicacionesActivas && radicacionesActivas > 0 ? (
          <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
            {radicacionesActivas}
          </Badge>
        ) : null}
      </NavLink>

      <NavLink href="/movilidad/reportes">
        <FileBarChart className="h-4 w-4" />
        Reportes
      </NavLink>

      {novedadesPendientes && novedadesPendientes > 0 ? (
        <div className="ml-auto flex items-center gap-2 px-4 py-3">
          <Badge variant="destructive" className="h-6">
            {novedadesPendientes} novedades pendientes
          </Badge>
        </div>
      ) : null}
    </nav>
  )
}
