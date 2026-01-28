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

  // Helper para obtener valores como string
  const str = (key: string): string => String(detalles[key] || '')
  // Helper para verificar si existe
  const has = (key: string): boolean => Boolean(detalles[key])

  switch (accion) {
    case 'usuario_creado':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {has('correo') && <Badge>{str('correo')}</Badge>}
          {has('rol_global') && <Badge variant="secondary">Rol: {str('rol_global')}</Badge>}
        </div>
      )

    case 'usuario_editado': {
      const cambios: string[] = []
      if (has('correo_anterior') && has('correo_nuevo') && detalles.correo_anterior !== detalles.correo_nuevo) {
        cambios.push(`Correo: ${str('correo_anterior')} → ${str('correo_nuevo')}`)
      }
      if (has('nombre_anterior') && has('nombre_nuevo') && detalles.nombre_anterior !== detalles.nombre_nuevo) {
        cambios.push(`Nombre: ${str('nombre_anterior')} → ${str('nombre_nuevo')}`)
      }

      return cambios.length > 0 ? (
        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
          {cambios.map((cambio, idx) => (
            <div key={idx}>{cambio}</div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {has('correo') && <Badge>{str('correo')}</Badge>}
        </div>
      )
    }

    case 'usuario_activado':
    case 'usuario_desactivado':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {has('correo') && <Badge>{str('correo')}</Badge>}
          {has('razon_suspension') && (
            <span className="text-muted-foreground">Razón: {str('razon_suspension')}</span>
          )}
        </div>
      )

    case 'rol_global_cambiado':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {has('correo') && <Badge>{str('correo')}</Badge>}
          {has('rol_anterior') && (has('rol_nuevo') || has('nuevo_rol')) && (
            <span className="text-muted-foreground">
              {str('rol_anterior')} → {has('rol_nuevo') ? str('rol_nuevo') : str('nuevo_rol')}
            </span>
          )}
        </div>
      )

    case 'rol_modulo_asignado':
    case 'rol_modulo_removido':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {(has('usuario_correo') || has('correo')) && (
            <Badge>{has('usuario_correo') ? str('usuario_correo') : str('correo')}</Badge>
          )}
          {has('rol_nombre') && (
            <Badge variant="secondary">{str('rol_nombre')}</Badge>
          )}
          {(has('modulo_id') || has('modulo')) && (
            <span className="text-muted-foreground">en {has('modulo_id') ? str('modulo_id') : str('modulo')}</span>
          )}
        </div>
      )

    case 'login_exitoso':
      return has('dispositivo') ? (
        <div className="text-xs text-muted-foreground mt-1">
          Dispositivo: {str('dispositivo')}
        </div>
      ) : null

    case 'cuenta_creada':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {has('placa') && <Badge>Placa: {str('placa')}</Badge>}
          {has('numero_cuenta') && (
            <span className="text-muted-foreground">Cuenta N°: {str('numero_cuenta')}</span>
          )}
        </div>
      )

    case 'traslado_iniciado':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {has('placa') && <Badge>Placa: {str('placa')}</Badge>}
          {has('numero_traslado') && (
            <span className="text-muted-foreground">Traslado N°: {str('numero_traslado')}</span>
          )}
          {has('organismo_destino') && (
            <span className="text-muted-foreground">→ {str('organismo_destino')}</span>
          )}
        </div>
      )

    case 'radicacion_iniciada':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {has('placa') && <Badge>Placa: {str('placa')}</Badge>}
          {has('numero_radicacion') && (
            <span className="text-muted-foreground">Radicación N°: {str('numero_radicacion')}</span>
          )}
          {has('organismo') && (
            <span className="text-muted-foreground">en {str('organismo')}</span>
          )}
        </div>
      )

    case 'estado_cambiado':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {has('entidad') && <Badge>{str('entidad')}</Badge>}
          {has('estado_anterior') && has('nuevo_estado') && (
            <span className="text-muted-foreground">
              {str('estado_anterior')} → {str('nuevo_estado')}
            </span>
          )}
        </div>
      )

    default: {
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
