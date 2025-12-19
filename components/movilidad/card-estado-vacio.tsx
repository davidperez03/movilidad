import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface AccionProps {
  label: string
  href: string
  mostrar?: boolean
}

interface CardEstadoVacioProps {
  icono: LucideIcon
  titulo: string
  descripcion: string
  accion?: AccionProps
  className?: string
}

export function CardEstadoVacio({
  icono: Icono,
  titulo,
  descripcion,
  accion,
  className
}: CardEstadoVacioProps) {
  // Si acción tiene mostrar=false, no renderizar el botón
  const mostrarAccion = accion && (accion.mostrar === undefined || accion.mostrar === true)

  return (
    <Card className={className}>
      <CardContent className="py-12 text-center">
        <Icono className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">{titulo}</p>
        <p className="text-muted-foreground mb-4">{descripcion}</p>
        {mostrarAccion && (
          <Button asChild>
            <Link href={accion.href}>{accion.label}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
