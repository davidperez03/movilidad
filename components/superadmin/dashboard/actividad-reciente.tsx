'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity } from 'lucide-react'
import type { ActividadReciente as ActividadRecienteType } from '@/lib/dashboard/utils'
import { ItemActividad } from './item-actividad'

interface ActividadRecienteProps {
  actividades: ActividadRecienteType[]
}

export function ActividadReciente({ actividades }: ActividadRecienteProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/superadmin/auditoria">
              Ver todo
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {actividades.length === 0 ? (
          <div className="py-8 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay actividad reciente registrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {actividades.map((item) => (
              <ItemActividad key={item.id} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
