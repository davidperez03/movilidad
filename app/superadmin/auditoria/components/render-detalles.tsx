import { Badge } from '@/components/ui/badge'
import {
  User,
  CheckCircle,
  XCircle,
  ArrowRightLeft,
  Shield,
  LogIn,
  LogOut,
  Clock
} from 'lucide-react'

interface RegistroAuditoria {
  id: string
  modulo: string
  accion: string
  entidad_tipo: string
  entidad_id: string
  detalles: any
  valor_anterior: string | null
  valor_nuevo: string | null
  usuario_id: string
  usuario_correo: string
  usuario_nombre: string
  ip_address: string | null
  creado_en: string
}

interface RenderDetallesProps {
  registro: RegistroAuditoria
}

// Componente helper para mostrar cambios
const RenderCambio = ({ anterior, nuevo }: { anterior: string; nuevo: string }) => (
  <div className="flex items-center gap-1.5 text-sm">
    <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">{anterior}</span>
    <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
    <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">{nuevo}</span>
  </div>
)

export function RenderDetalles({ registro }: RenderDetallesProps) {
  const detalles = registro.detalles || {}

  switch (registro.accion) {
    case 'usuario_creado':
      return (
        <div className="space-y-1">
          <div className="font-medium text-sm">{detalles.correo || detalles.usuario_correo}</div>
          {detalles.nombre_completo && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {detalles.nombre_completo}
            </div>
          )}
          {detalles.rol_global && (
            <div className="text-xs">
              <Badge variant="outline" className="text-xs">Rol: {detalles.rol_global}</Badge>
            </div>
          )}
        </div>
      )

    case 'usuario_editado':
      const correoAnterior = detalles.correo_anterior
      const correoNuevo = detalles.correo_nuevo
      const nombreAnterior = detalles.nombre_anterior
      const nombreNuevo = detalles.nombre_nuevo

      return (
        <div className="space-y-1.5">
          {correoAnterior && correoNuevo && correoAnterior !== correoNuevo ? (
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Correo:</div>
              <RenderCambio anterior={correoAnterior} nuevo={correoNuevo} />
            </div>
          ) : (
            <div className="font-medium text-sm">{correoNuevo || correoAnterior}</div>
          )}
          {nombreAnterior && nombreNuevo && nombreAnterior !== nombreNuevo && (
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Nombre:</div>
              <RenderCambio anterior={nombreAnterior} nuevo={nombreNuevo} />
            </div>
          )}
        </div>
      )

    case 'usuario_activado':
      return (
        <div className="space-y-1">
          <div className="font-medium text-sm flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
            {detalles.correo}
          </div>
          <div className="text-xs text-muted-foreground">Usuario activado y habilitado</div>
        </div>
      )

    case 'usuario_desactivado':
      return (
        <div className="space-y-1">
          <div className="font-medium text-sm flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5 text-orange-600" />
            {detalles.correo}
          </div>
          {detalles.razon_suspension && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Razón:</span> {detalles.razon_suspension}
            </div>
          )}
        </div>
      )

    case 'rol_global_cambiado':
      const rolAnterior = registro.valor_anterior || detalles.rol_anterior
      const rolNuevo = registro.valor_nuevo || detalles.rol_nuevo || detalles.nuevo_rol

      return (
        <div className="space-y-1.5">
          <div className="font-medium text-sm">{detalles.correo}</div>
          {rolAnterior && rolNuevo && (
            <RenderCambio anterior={rolAnterior} nuevo={rolNuevo} />
          )}
        </div>
      )

    case 'rol_modulo_asignado':
      return (
        <div className="space-y-1">
          <div className="font-medium text-sm">{detalles.usuario_correo || detalles.correo}</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              {detalles.rol_nombre || detalles.rol_codigo}
            </Badge>
            <span className="text-xs text-muted-foreground">en</span>
            <Badge variant="outline" className="text-xs">
              {detalles.modulo_id || detalles.modulo}
            </Badge>
          </div>
        </div>
      )

    case 'rol_modulo_removido':
      return (
        <div className="space-y-1">
          <div className="font-medium text-sm">{detalles.usuario_correo || detalles.correo}</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground">Removido:</span>
            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
              {detalles.rol_nombre || detalles.rol_codigo}
            </Badge>
            <span className="text-xs text-muted-foreground">de</span>
            <Badge variant="outline" className="text-xs">
              {detalles.modulo_id || detalles.modulo}
            </Badge>
          </div>
        </div>
      )

    case 'login_exitoso':
      return (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <LogIn className="h-3.5 w-3.5" />
          Inicio de sesión exitoso
          {detalles.dispositivo && (
            <Badge variant="outline" className="text-xs ml-1">
              {detalles.dispositivo}
            </Badge>
          )}
        </div>
      )

    case 'login_fallido':
      return (
        <div className="space-y-1">
          <div className="text-sm text-red-600 flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5" />
            Intento fallido de inicio de sesión
          </div>
          {detalles.razon && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Razón:</span> {detalles.razon}
            </div>
          )}
        </div>
      )

    case 'logout':
      return (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <LogOut className="h-3.5 w-3.5" />
          Cierre de sesión normal
        </div>
      )

    case 'sesion_expirada':
      return (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Sesión expirada por inactividad
        </div>
      )

    case 'cuenta_creada':
      return (
        <div className="space-y-1">
          <div className="font-medium text-sm">Placa: {detalles.placa}</div>
          {detalles.numero_cuenta && (
            <div className="text-xs text-muted-foreground">
              Cuenta N°: {detalles.numero_cuenta}
            </div>
          )}
        </div>
      )

    case 'traslado_iniciado':
      return (
        <div className="space-y-1">
          {detalles.placa && <div className="font-medium text-sm">Placa: {detalles.placa}</div>}
          {detalles.numero_traslado && (
            <div className="text-xs">
              <Badge variant="outline">Traslado N°: {detalles.numero_traslado}</Badge>
            </div>
          )}
          {detalles.organismo_destino && (
            <div className="text-xs text-muted-foreground">
              Destino: {detalles.organismo_destino}
            </div>
          )}
        </div>
      )

    case 'radicacion_iniciada':
      return (
        <div className="space-y-1">
          {detalles.placa && <div className="font-medium text-sm">Placa: {detalles.placa}</div>}
          {detalles.numero_radicacion && (
            <div className="text-xs">
              <Badge variant="outline">Radicación N°: {detalles.numero_radicacion}</Badge>
            </div>
          )}
          {detalles.organismo && (
            <div className="text-xs text-muted-foreground">
              Organismo: {detalles.organismo}
            </div>
          )}
        </div>
      )

    case 'estado_cambiado':
      const estadoAnterior = detalles.estado_anterior || registro.valor_anterior
      const estadoNuevo = detalles.nuevo_estado || registro.valor_nuevo

      return (
        <div className="space-y-1.5">
          {detalles.entidad && <div className="font-medium text-sm">{detalles.entidad}</div>}
          {estadoAnterior && estadoNuevo && (
            <RenderCambio anterior={estadoAnterior} nuevo={estadoNuevo} />
          )}
        </div>
      )

    case 'novedad_agregada':
      return (
        <div className="space-y-1">
          {detalles.tipo_novedad && (
            <Badge variant="outline" className="text-xs">{detalles.tipo_novedad}</Badge>
          )}
          {detalles.descripcion && (
            <div className="text-xs text-muted-foreground max-w-md">
              {detalles.descripcion.length > 100
                ? `${detalles.descripcion.substring(0, 100)}...`
                : detalles.descripcion
              }
            </div>
          )}
        </div>
      )

    default:
      // Mostrar cambio de valor si existe
      if (registro.valor_anterior && registro.valor_nuevo) {
        return <RenderCambio anterior={registro.valor_anterior} nuevo={registro.valor_nuevo} />
      }

      // Mostrar detalles como JSON si no hay caso específico
      if (Object.keys(detalles).length > 0) {
        return (
          <div className="space-y-0.5">
            {Object.entries(detalles).slice(0, 3).map(([key, val]) => (
              <div key={key} className="text-xs text-muted-foreground">
                <span className="font-medium">{key}:</span> {String(val)}
              </div>
            ))}
          </div>
        )
      }

      return <span className="text-muted-foreground">-</span>
  }
}
