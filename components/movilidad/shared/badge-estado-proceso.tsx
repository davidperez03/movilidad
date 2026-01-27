import { memo } from 'react'
import { ESTADOS_CONFIG } from '@/lib/movilidad/config'
import { cn } from '@/lib/utils'

interface BadgeEstadoProcesoProps {
  estado: string
  className?: string
}

export const BadgeEstadoProceso = memo(function BadgeEstadoProceso({
  estado,
  className,
}: BadgeEstadoProcesoProps) {
  const config = ESTADOS_CONFIG[estado]

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
      config?.color || "bg-gray-100 text-gray-700 border-gray-300",
      className
    )}>
      {config?.label || estado}
    </span>
  )
})
