import Link from 'next/link'
import { ChevronRight, LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CardTipoReporteProps {
  icono: LucideIcon
  titulo: string
  descripcion: string
  href: string
  contador?: number
  color?: 'blue' | 'green' | 'orange' | 'purple'
}

const colorConfig = {
  blue: {
    bg: 'bg-blue-100',
    icon: 'text-blue-600',
    border: 'hover:border-blue-300',
    badge: 'bg-blue-100 text-blue-700',
  },
  green: {
    bg: 'bg-green-100',
    icon: 'text-green-600',
    border: 'hover:border-green-300',
    badge: 'bg-green-100 text-green-700',
  },
  orange: {
    bg: 'bg-orange-100',
    icon: 'text-orange-600',
    border: 'hover:border-orange-300',
    badge: 'bg-orange-100 text-orange-700',
  },
  purple: {
    bg: 'bg-purple-100',
    icon: 'text-purple-600',
    border: 'hover:border-purple-300',
    badge: 'bg-purple-100 text-purple-700',
  },
}

export function CardTipoReporte({
  icono: Icono,
  titulo,
  descripcion,
  href,
  contador,
  color = 'blue',
}: CardTipoReporteProps) {
  const colors = colorConfig[color]

  return (
    <Link href={href} className="group block">
      <Card className={cn("transition-all hover:shadow-md", colors.border)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn("rounded-lg p-2", colors.bg)}>
              <Icono className={cn("h-5 w-5", colors.icon)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{titulo}</p>
                {contador !== undefined && (
                  <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", colors.badge)}>
                    {contador}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{descripcion}</p>
            </div>
            <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-colors", `group-hover:${colors.icon}`)} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
