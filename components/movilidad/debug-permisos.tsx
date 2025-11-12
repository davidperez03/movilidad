'use client'

import { usePermisos } from '@/lib/hooks/use-permisos'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export function DebugPermisos() {
  const permisos = usePermisos()

  if (permisos.cargando) {
    return (
      <Card className="border-yellow-500">
        <CardHeader>
          <CardTitle>🔍 Debug - Permisos del Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Cargando permisos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-yellow-500">
      <CardHeader>
        <CardTitle>🔍 Debug - Permisos del Usuario</CardTitle>
        <CardDescription>
          Este componente es temporal para verificar permisos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Estado General:</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {permisos.esSuperadmin ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Superadmin: {permisos.esSuperadmin ? 'SÍ' : 'NO'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Rol Global: <Badge>{permisos.rolGlobal || 'ninguno'}</Badge></span>
            </div>
          </div>
        </div>

        {permisos.movilidad && (
          <div>
            <p className="text-sm font-medium mb-2">Permisos de Movilidad:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(permisos.movilidad).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  {value ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span className={value ? 'text-green-700' : 'text-red-700'}>
                    {key.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!permisos.movilidad && !permisos.esSuperadmin && (
          <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ No se detectaron permisos de movilidad. El usuario no tiene rol asignado en este módulo.
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p>Datos raw:</p>
          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(permisos, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
