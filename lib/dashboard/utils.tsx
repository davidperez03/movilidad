import {
  UserPlus, Edit2, CheckCircle, XCircle, Shield, LogIn, LogOut,
  Clock, FileText, Activity, Car, FileInput, ArrowRightLeft
} from 'lucide-react'
import { formatearEstadoProceso } from '@/lib/movilidad/formatters'

export interface ActividadReciente {
  id: string
  accion: string
  usuario_correo: string
  usuario_nombre: string
  detalles: Record<string, unknown>
  entidad_tipo: string | null
  creado_en: string
}

export function getIconoActividad(accion: string): React.ReactNode {
  const iconProps = "h-4 w-4"

  const iconos: Record<string, React.ReactNode> = {
    usuario_creado: <UserPlus className={`${iconProps} text-green-600`} />,
    usuario_editado: <Edit2 className={`${iconProps} text-blue-600`} />,
    usuario_activado: <CheckCircle className={`${iconProps} text-emerald-600`} />,
    usuario_desactivado: <XCircle className={`${iconProps} text-orange-600`} />,
    rol_global_cambiado: <Shield className={`${iconProps} text-purple-600`} />,
    rol_modulo_asignado: <Shield className={`${iconProps} text-indigo-600`} />,
    rol_modulo_removido: <Shield className={`${iconProps} text-amber-600`} />,
    login_exitoso: <LogIn className={`${iconProps} text-blue-600`} />,
    logout: <LogOut className={`${iconProps} text-gray-600`} />,
    sesion_expirada: <Clock className={`${iconProps} text-gray-500`} />,
    cuenta_creada: <FileText className={`${iconProps} text-teal-600`} />,
    traslado_iniciado: <Car className={`${iconProps} text-cyan-600`} />,
    radicacion_iniciada: <FileInput className={`${iconProps} text-sky-600`} />,
    estado_cambiado: <ArrowRightLeft className={`${iconProps} text-violet-600`} />,
  }

  return iconos[accion] || <Activity className={`${iconProps} text-muted-foreground`} />
}

export function formatearDescripcionActividad(item: ActividadReciente): string {
  const { accion } = item

  switch (accion) {
    case 'usuario_creado':
      return 'creó un nuevo usuario'
    case 'usuario_editado':
      return 'editó la información de un usuario'
    case 'usuario_activado':
      return 'activó un usuario'
    case 'usuario_desactivado':
      return 'desactivó un usuario'
    case 'rol_global_cambiado':
      return 'cambió el rol global de un usuario'
    case 'rol_modulo_asignado':
      return 'asignó un rol de módulo'
    case 'rol_modulo_removido':
      return 'removió un rol de módulo'
    case 'login_exitoso':
      return 'inició sesión'
    case 'logout':
      return 'cerró sesión'
    case 'sesion_expirada':
      return 'tuvo una sesión expirada por inactividad'
    case 'cuenta_creada':
      return 'creó una nueva cuenta'
    case 'traslado_iniciado':
      return 'inició un traslado'
    case 'radicacion_iniciada':
      return 'inició una radicación'
    case 'estado_cambiado':
      return 'cambió el estado de una entidad'
    default:
      return formatearEstadoProceso(accion)
  }
}

export function formatearFecha(fecha: string): string {
  const date = new Date(fecha)
  const ahora = new Date()
  const diffMs = ahora.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Justo ahora'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`

  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
  })
}
