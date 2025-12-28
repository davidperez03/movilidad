"use client"

import { RequirePermission } from "@/components/auth/RequirePermission"
import { FormularioProceso } from "@/components/movilidad/formulario-proceso"

export default function NuevoTrasladoPage() {
  return (
    <RequirePermission modulo="movilidad" permiso="crear_traslados">
      <FormularioProceso tipo="traslado" />
    </RequirePermission>
  )
}
