import { Badge } from '@/components/ui/badge'
import { formatearEstadoProceso, getVariantePorEstado } from '@/lib/movilidad/formatters'
import type { TipoProceso } from '@/lib/movilidad/config'

interface BadgeEstadoProcesoProps {
  estado: string
  tipoProceso?: TipoProceso
  className?: string
}

export function BadgeEstadoProceso({ estado, tipoProceso, className }: BadgeEstadoProcesoProps) {
  const variant = getVariantePorEstado(estado, tipoProceso)
  const textoFormateado = formatearEstadoProceso(estado)

  return (
    <Badge variant={variant} className={className}>
      {textoFormateado}
    </Badge>
  )
}
