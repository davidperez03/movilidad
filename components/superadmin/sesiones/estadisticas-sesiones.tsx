import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Users, Clock, AlertCircle } from 'lucide-react'
import type { Sesion } from '@/lib/hooks/useSesiones'

interface EstadisticasSesionesProps {
  sesiones: Sesion[]
}

export function EstadisticasSesiones({ sesiones }: EstadisticasSesionesProps) {
  const ahora = new Date()

  const stats = {
    total: sesiones.length,
    usuarios_unicos: new Set(sesiones.map(s => s.usuario_id)).size,
    promedio_inactividad: sesiones.length > 0
      ? Math.round(sesiones.reduce((sum, s) => sum + s.minutos_inactivo, 0) / sesiones.length)
      : 0,
    token_expirados: sesiones.filter(s =>
      s.token_expira_en && new Date(s.token_expira_en) < ahora
    ).length
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            Total de sesiones abiertas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuarios Conectados</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.usuarios_unicos}</div>
          <p className="text-xs text-muted-foreground">
            Usuarios únicos activos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactividad Promedio</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.promedio_inactividad} min</div>
          <p className="text-xs text-muted-foreground">
            Tiempo promedio sin actividad
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tokens Expirados</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{stats.token_expirados}</div>
          <p className="text-xs text-muted-foreground">
            Sesiones huérfanas
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
