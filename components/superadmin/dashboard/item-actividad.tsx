'use client'

import { Clock } from 'lucide-react'
import type { ActividadReciente } from '@/lib/dashboard/utils'
import { getIconoActividad, formatearDescripcionActividad, formatearFecha } from '@/lib/dashboard/utils'

interface ItemActividadProps {
  item: ActividadReciente
}

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: string }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
    variant === 'secondary' ? 'bg-secondary text-secondary-foreground' : 'bg-primary/10 text-primary'
  }`}>
    {children}
  </span>
)

function renderDetallesActividad(item: ActividadReciente): React.ReactNode {
  const { accion, detalles } = item

  if (!detalles || Object.keys(detalles).length === 0) {
    return null
  }

  switch (accion) {
    case 'usuario_creado':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {detalles.correo && <Badge>{detalles.correo}</Badge>}
          {detalles.rol_global && <Badge variant="secondary">Rol: {detalles.rol_global}</Badge>}
        </div>
      )

    case 'usuario_editado':
      const cambios: string[] = []
      if (detalles.correo_anterior && detalles.correo_nuevo && detalles.correo_anterior !== detalles.correo_nuevo) {
        cambios.push(`Correo: ${detalles.correo_anterior} → ${detalles.correo_nuevo}`)
      }
      if (detalles.nombre_anterior && detalles.nombre_nuevo && detalles.nombre_anterior !== detalles.nombre_nuevo) {
        cambios.push(`Nombre: ${detalles.nombre_anterior} → ${detalles.nombre_nuevo}`)
      }

      return cambios.length > 0 ? (
        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
          {cambios.map((cambio, idx) => (
            <div key={idx}>{cambio}</div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {detalles.correo && <Badge>{detalles.correo}</Badge>}
        </div>
      )

    case 'usuario_activado':
    case 'usuario_desactivado':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {detalles.correo && <Badge>{detalles.correo}</Badge>}
          {detalles.razon_suspension && (
            <span className="text-muted-foreground">Razón: {detalles.razon_suspension}</span>
          )}
        </div>
      )

    case 'rol_global_cambiado':
      const rolAnterior = detalles.rol_anterior
      const rolNuevo = detalles.rol_nuevo || detalles.nuevo_rol

      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {detalles.correo && <Badge>{detalles.correo}</Badge>}
          {rolAnterior && rolNuevo && (
            <span className="text-muted-foreground">
              {rolAnterior} → {rolNuevo}
            </span>
          )}
        </div>
      )

    case 'rol_modulo_asignado':
    case 'rol_modulo_removido':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {(detalles.usuario_correo || detalles.correo) && (
            <Badge>{detalles.usuario_correo || detalles.correo}</Badge>
          )}
          {detalles.rol_nombre && (
            <Badge variant="secondary">{detalles.rol_nombre}</Badge>
          )}
          {(detalles.modulo_id || detalles.modulo) && (
            <span className="text-muted-foreground">en {detalles.modulo_id || detalles.modulo}</span>
          )}
        </div>
      )

    case 'login_exitoso':
      return detalles.dispositivo ? (
        <div className="text-xs text-muted-foreground mt-1">
          Dispositivo: {detalles.dispositivo}
        </div>
      ) : null

    case 'cuenta_creada':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {detalles.placa && <Badge>Placa: {detalles.placa}</Badge>}
          {detalles.numero_cuenta && (
            <span className="text-muted-foreground">Cuenta N°: {detalles.numero_cuenta}</span>
          )}
        </div>
      )

    case 'traslado_iniciado':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {detalles.placa && <Badge>Placa: {detalles.placa}</Badge>}
          {detalles.numero_traslado && (
            <span className="text-muted-foreground">Traslado N°: {detalles.numero_traslado}</span>
          )}
          {detalles.organismo_destino && (
            <span className="text-muted-foreground">→ {detalles.organismo_destino}</span>
          )}
        </div>
      )

    case 'radicacion_iniciada':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {detalles.placa && <Badge>Placa: {detalles.placa}</Badge>}
          {detalles.numero_radicacion && (
            <span className="text-muted-foreground">Radicación N°: {detalles.numero_radicacion}</span>
          )}
          {detalles.organismo && (
            <span className="text-muted-foreground">en {detalles.organismo}</span>
          )}
        </div>
      )

    case 'estado_cambiado':
      const estadoAnterior = detalles.estado_anterior
      const estadoNuevo = detalles.nuevo_estado

      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {detalles.entidad && <Badge>{detalles.entidad}</Badge>}
          {estadoAnterior && estadoNuevo && (
            <span className="text-muted-foreground">
              {estadoAnterior} → {estadoNuevo}
            </span>
          )}
        </div>
      )

    default:
      const keys = Object.keys(detalles).filter(k =>
        !['usuario_id', 'id', 'created_at', 'updated_at'].includes(k)
      ).slice(0, 2)

      if (keys.length === 0) return null

      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {keys.map(key => (
            <span key={key} className="text-muted-foreground">
              {key}: {String(detalles[key])}
            </span>
          ))}
        </div>
      )
  }
}

export function ItemActividad({ item }: ItemActividadProps) {
  return (
    <div className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0 hover:bg-muted/30 -mx-2 px-2 py-2 rounded-md transition-colors">
      <div className="mt-0.5">
        {getIconoActividad(item.accion)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="text-sm">
            <span className="font-medium">{item.usuario_nombre || item.usuario_correo || 'Sistema'}</span>
            {' '}
            <span className="text-muted-foreground">{formatearDescripcionActividad(item)}</span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
            <Clock className="h-3 w-3" />
            {formatearFecha(item.creado_en)}
          </div>
        </div>
        {renderDetallesActividad(item)}
      </div>
    </div>
  )
}
