// =====================================================
// CARD DE TIPO DE REPORTE
// Card clicable para navegar a cada tipo de reporte
// =====================================================

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface CardTipoReporteProps {
  icono: LucideIcon
  titulo: string
  descripcion: string
  href: string
  contador?: number
  color?: 'blue' | 'green' | 'orange' | 'purple'
}

const coloresIcono = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
  purple: 'bg-purple-100 text-purple-600',
}

export function CardTipoReporte({
  icono: Icono,
  titulo,
  descripcion,
  href,
  contador,
  color = 'blue',
}: CardTipoReporteProps) {
  return (
    <Link href={href} className="block">
      <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              {/* Icono */}
              <div className={`rounded-full p-3 ${coloresIcono[color]}`}>
                <Icono className="h-6 w-6" />
              </div>

              {/* Contenido */}
              <div className="flex-1">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {titulo}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{descripcion}</p>
              </div>
            </div>

            {/* Contador */}
            {contador !== undefined && (
              <Badge variant="secondary" className="ml-2">
                {contador}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
