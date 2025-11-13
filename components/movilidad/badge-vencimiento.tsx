import { Badge } from '@/components/ui/badge'
import {
  calcularDiasRestantes,
  getVariantePorVencimiento,
  formatearDiasRestantes
} from '@/lib/movilidad/formatters'

interface BadgeVencimientoProps {
  fechaVencimiento: string
  mostrarSiMayorA?: number
  className?: string
}

export function BadgeVencimiento({
  fechaVencimiento,
  mostrarSiMayorA = 7,
  className
}: BadgeVencimientoProps) {
  const diasRestantes = calcularDiasRestantes(fechaVencimiento)

  // No mostrar si faltan muchos días y se especificó umbral
  if (diasRestantes > mostrarSiMayorA) {
    return null
  }

  const variant = getVariantePorVencimiento(diasRestantes)
  const texto = formatearDiasRestantes(diasRestantes)

  return (
    <Badge variant={variant} className={className}>
      {texto}
    </Badge>
  )
}
