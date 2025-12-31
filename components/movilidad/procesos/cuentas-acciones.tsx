import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { PermisosModulo } from '@/lib/types/permissions'

interface BotonNuevaCuentaProps {
  permisos: PermisosModulo
}

export function BotonNuevaCuenta({ permisos }: BotonNuevaCuentaProps) {
  if (!permisos?.crear_cuentas) {
    return null
  }

  return (
    <Button asChild>
      <Link href="/movilidad/cuentas/nueva">
        <Plus className="h-4 w-4 mr-2" />
        Nueva Cuenta
      </Link>
    </Button>
  )
}

interface BotonesProcesoProps {
  placa: string
  permisos: PermisosModulo
}

export function BotonesIniciarProceso({ placa, permisos }: BotonesProcesoProps) {
  const mostrarTraslados = permisos.crear_traslados
  const mostrarRadicaciones = permisos.crear_radicaciones

  // Si no tiene ningún permiso, no mostrar nada
  if (!mostrarTraslados && !mostrarRadicaciones) {
    return null
  }

  return (
    <div className="flex gap-2">
      {mostrarTraslados && (
        <Button asChild variant="outline" size="sm">
          <Link href={`/movilidad/traslados/nuevo?placa=${placa}`}>
            Iniciar Traslado
          </Link>
        </Button>
      )}

      {mostrarRadicaciones && (
        <Button asChild variant="outline" size="sm">
          <Link href={`/movilidad/radicaciones/nueva?placa=${placa}`}>
            Iniciar Radicación
          </Link>
        </Button>
      )}
    </div>
  )
}
