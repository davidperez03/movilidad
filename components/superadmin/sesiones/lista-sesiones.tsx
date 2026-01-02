import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { XCircle, Monitor, Smartphone, Tablet } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Sesion } from '@/lib/hooks/useSesiones'

interface ListaSesionesProps {
  sesiones: Sesion[]
  onCerrarSesion: (sesionId: string) => void
  procesando: boolean
}

export function ListaSesiones({ sesiones, onCerrarSesion, procesando }: ListaSesionesProps) {
  const ahora = new Date()

  const getDispositivoIcon = (dispositivo: string) => {
    switch (dispositivo) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      case 'tablet':
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const esTokenExpirado = (tokenExpira: string | null) => {
    if (!tokenExpira) return false
    return new Date(tokenExpira) < ahora
  }

  if (sesiones.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No hay sesiones activas
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todas las Sesiones ({sesiones.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sesiones.map((sesion) => {
            const tokenExpirado = esTokenExpirado(sesion.token_expira_en)

            return (
              <div
                key={sesion.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  tokenExpirado ? 'bg-destructive/5 border-destructive/20' : ''
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-muted-foreground">
                    {getDispositivoIcon(sesion.dispositivo)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{sesion.nombre_completo || 'Sin nombre'}</span>
                      {tokenExpirado && (
                        <Badge variant="destructive" className="text-xs">
                          Token expirado
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {sesion.correo}
                    </div>

                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>
                        IP: {sesion.ip_address || 'Desconocida'}
                      </span>
                      <span>
                        Inicio: {formatDistanceToNow(new Date(sesion.inicio_sesion), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                      <span>
                        Última actividad: {formatDistanceToNow(new Date(sesion.ultima_actividad), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                      <span>
                        Acciones: {sesion.acciones_realizadas}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCerrarSesion(sesion.id)}
                  disabled={procesando}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cerrar
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
