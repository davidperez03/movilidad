'use client'

import { usePermisos } from '@/lib/hooks/use-permisos'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PermisosWrapperProps {
  children: React.ReactNode
  requierePermiso: 'crear_cuentas' | 'editar_cuentas' | 'eliminar_cuentas' | 'crear_traslados' | 'editar_traslados' | 'eliminar_traslados' | 'crear_radicaciones' | 'editar_radicaciones' | 'eliminar_radicaciones' | 'gestionar_novedades'
  fallback?: React.ReactNode
  mostrarAlerta?: boolean
}

export function PermisosWrapper({
  children,
  requierePermiso,
  fallback = null,
  mostrarAlerta = false,
}: PermisosWrapperProps) {
  const permisos = usePermisos()

  // DEBUG
  console.log('PermisosWrapper:', {
    requierePermiso,
    cargando: permisos.cargando,
    esSuperadmin: permisos.esSuperadmin,
    movilidad: permisos.movilidad,
    valorPermiso: permisos.movilidad?.[requierePermiso],
    tienePermiso: permisos.movilidad?.[requierePermiso] || false
  })

  // Mientras carga, mostrar loading
  if (permisos.cargando) {
    return fallback || <Loader2 className="h-4 w-4 animate-spin" />
  }

  // Si es superadmin, mostrar todo
  if (permisos.esSuperadmin) {
    return <>{children}</>
  }

  // Verificar permisos de movilidad
  const tienePermiso = permisos.movilidad?.[requierePermiso] || false

  if (!tienePermiso) {
    console.log('❌ Sin permisos para:', requierePermiso)
    if (mostrarAlerta) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para realizar esta acción
          </AlertDescription>
        </Alert>
      )
    }
    return null // Cambié de <>{fallback}</> a null directo
  }

  console.log('✅ Con permisos para:', requierePermiso)
  return <>{children}</>
}
