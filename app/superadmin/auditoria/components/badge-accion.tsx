import { Badge } from '@/components/ui/badge'
import { formatearEstadoProceso } from '@/lib/movilidad/formatters'

interface BadgeAccionProps {
  accion: string
}

export function BadgeAccion({ accion }: BadgeAccionProps) {
  const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
    usuario_creado: { label: 'Usuario creado', variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' },
    usuario_editado: { label: 'Usuario editado', variant: 'outline', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    usuario_eliminado: { label: 'Usuario eliminado', variant: 'destructive' },
    usuario_activado: { label: 'Usuario activado', variant: 'default', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    usuario_desactivado: { label: 'Usuario desactivado', variant: 'outline', className: 'bg-orange-50 text-orange-700 border-orange-200' },
    rol_global_cambiado: { label: 'Rol global cambiado', variant: 'outline', className: 'bg-purple-50 text-purple-700 border-purple-200' },
    rol_modulo_asignado: { label: 'Rol asignado', variant: 'outline', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    rol_modulo_removido: { label: 'Rol removido', variant: 'outline', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    login_exitoso: { label: 'Inicio de sesión', variant: 'secondary' },
    login_fallido: { label: 'Login fallido', variant: 'destructive' },
    logout: { label: 'Cierre de sesión', variant: 'secondary' },
    sesion_expirada: { label: 'Sesión expirada', variant: 'outline', className: 'bg-gray-50 text-gray-700 border-gray-200' },
    cuenta_creada: { label: 'Cuenta creada', variant: 'default', className: 'bg-teal-100 text-teal-800 border-teal-200' },
    traslado_iniciado: { label: 'Traslado iniciado', variant: 'outline', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    radicacion_iniciada: { label: 'Radicación iniciada', variant: 'outline', className: 'bg-sky-50 text-sky-700 border-sky-200' },
    estado_cambiado: { label: 'Estado cambiado', variant: 'outline', className: 'bg-violet-50 text-violet-700 border-violet-200' },
    novedad_agregada: { label: 'Novedad agregada', variant: 'outline', className: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
  }

  const config = configs[accion] || { label: formatearEstadoProceso(accion), variant: 'outline' as const }

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}
