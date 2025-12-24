"use client"

import { RequirePermission } from "@/components/auth/RequirePermission"
import { FormularioProceso } from "@/components/movilidad/formulario-proceso"

export default function NuevaRadicacionPage() {
  return (
    <RequirePermission modulo="movilidad" permiso="crear_radicaciones">
      <FormularioProceso tipo="radicacion" />
    </RequirePermission>
  )
}
