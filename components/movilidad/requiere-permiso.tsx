'use client'

import { usePermisos } from '@/lib/hooks/use-permisos'
import { AlertCircle, Loader2, ShieldOff } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { PermisosModulo } from '@/lib/hooks/use-permisos'

type PermisoRequerido = keyof PermisosModulo

interface RequierePermisoProps {
  children: React.ReactNode
  permiso: PermisoRequerido
  fallback?: React.ReactNode
}

export function RequierePermiso({ children, permiso, fallback }: RequierePermisoProps) {
  const permisos = usePermisos()

  // Mientras carga, mostrar loading
  if (permisos.cargando) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Si es superadmin, mostrar todo
  if (permisos.esSuperadmin) {
    return <>{children}</>
  }

  // Verificar permisos de movilidad
  const tienePermiso = permisos.movilidad?.[permiso] || false

  if (!tienePermiso) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldOff className="h-6 w-6 text-destructive" />
              <div>
                <CardTitle>Acceso Denegado</CardTitle>
                <CardDescription>No tienes permisos para acceder a esta página</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-3 bg-muted rounded-md">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Permiso requerido</p>
                  <p className="text-muted-foreground">
                    {formatearNombrePermiso(permiso)}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Si crees que deberías tener acceso a esta página, contacta a tu administrador
                para que revise tus permisos en el módulo de movilidad.
              </p>

              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/movilidad">
                    Volver al Dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/">
                    Ir al Inicio
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

function formatearNombrePermiso(permiso: PermisoRequerido): string {
  const nombres: Record<PermisoRequerido, string> = {
    ver: 'Visualizar información del módulo',
    crear_cuentas: 'Crear cuentas de vehículos',
    editar_cuentas: 'Editar cuentas de vehículos',
    eliminar_cuentas: 'Eliminar cuentas de vehículos',
    crear_traslados: 'Crear procesos de traslado',
    editar_traslados: 'Editar procesos de traslado',
    eliminar_traslados: 'Eliminar procesos de traslado',
    crear_radicaciones: 'Crear procesos de radicación',
    editar_radicaciones: 'Editar procesos de radicación',
    eliminar_radicaciones: 'Eliminar procesos de radicación',
    gestionar_novedades: 'Gestionar novedades',
    configurar: 'Configurar el módulo',
  }

  return nombres[permiso] || permiso
}
