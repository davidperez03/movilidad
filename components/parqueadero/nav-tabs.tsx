"use client"

import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, ClipboardCheck, Truck, Users } from "lucide-react"
import { NavLink } from "./nav-link"

interface NavTabsProps {
  inspeccionesHoy: number | null
  vehiculosActivos: number | null
  alertasLicencias?: number | null
}

export function NavTabsParqueadero({ inspeccionesHoy, vehiculosActivos, alertasLicencias }: NavTabsProps) {
  return (
    <nav className="flex gap-1 -mb-px" role="navigation" aria-label="Navegación principal de Parqueadero">
      <NavLink href="/parqueadero" exact>
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </NavLink>

      <NavLink href="/parqueadero/inspecciones">
        <ClipboardCheck className="h-4 w-4" />
        Inspecciones
        {inspeccionesHoy && inspeccionesHoy > 0 ? (
          <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
            {inspeccionesHoy} hoy
          </Badge>
        ) : null}
      </NavLink>

      <NavLink href="/parqueadero/vehiculos">
        <Truck className="h-4 w-4" />
        Vehículos
        {vehiculosActivos && vehiculosActivos > 0 ? (
          <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
            {vehiculosActivos}
          </Badge>
        ) : null}
      </NavLink>

      <NavLink href="/parqueadero/personal">
        <Users className="h-4 w-4" />
        Personal
        {alertasLicencias && alertasLicencias > 0 ? (
          <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-xs">
            {alertasLicencias}
          </Badge>
        ) : null}
      </NavLink>
    </nav>
  )
}
