'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { ESTADOS_CONFIG } from '@/lib/movilidad/config'

export interface RegistroAuditoria {
  id: string
  modulo: string
  accion: string
  entidad_tipo: string
  entidad_id: string
  detalles: Record<string, unknown>
  valor_anterior: string | null
  valor_nuevo: string | null
  usuario_id: string
  usuario_correo: string
  usuario_nombre: string
  ip_address: string | null
  creado_en: string
  cuenta_id: string | null
  proceso_tipo: string | null
  placa: string | null
}

// Helper
function s(r: RegistroAuditoria, key: string): string {
  const val = r.detalles?.[key]
  return val !== undefined && val !== null ? String(val) : ''
}

// Formatear estado
function fmt(estado: string): string {
  if (!estado) return ''
  const config = ESTADOS_CONFIG[estado]
  if (config) return config.label
  return estado.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

// Categoría y color
function getCat(accion: string): { label: string; color: string } {
  // Usuarios
  if (accion.startsWith('usuario_')) return { label: 'Usuario', color: 'bg-blue-100 text-blue-800' }
  // Roles
  if (accion.startsWith('rol_')) return { label: 'Rol', color: 'bg-purple-100 text-purple-800' }
  // Sesiones (incluyendo token_expirado y similares)
  if (accion.includes('login') || accion.includes('logout') || accion.includes('sesion') || accion.includes('token')) {
    return { label: 'Sesión', color: 'bg-slate-100 text-slate-700' }
  }
  // Movilidad
  if (accion === 'cuenta_creada') return { label: 'Cuenta', color: 'bg-teal-100 text-teal-800' }
  if (accion.includes('traslado')) return { label: 'Traslado', color: 'bg-cyan-100 text-cyan-800' }
  if (accion.includes('radicacion')) return { label: 'Radicación', color: 'bg-sky-100 text-sky-800' }
  if (accion.includes('proceso') || accion === 'estado_cambiado') return { label: 'Proceso', color: 'bg-violet-100 text-violet-800' }
  if (accion === 'novedad_agregada') return { label: 'Novedad', color: 'bg-pink-100 text-pink-800' }
  return { label: 'Sistema', color: 'bg-gray-100 text-gray-700' }
}

// Obtener afectado
function getAfectado(r: RegistroAuditoria): string {
  // Para movilidad, usar la placa
  if (r.placa) return r.placa

  // Para usuarios y roles
  const correo = s(r, 'correo') || s(r, 'correo_nuevo') || s(r, 'usuario_correo')
  const nombre = s(r, 'nombre_completo') || s(r, 'nombre_nuevo') || s(r, 'usuario_nombre')

  if (r.accion.startsWith('usuario_') || r.accion.startsWith('rol_')) {
    if (nombre && correo) return `${nombre} (${correo})`
    return correo || nombre || ''
  }

  // Sesiones
  if (r.accion === 'login_fallido') return s(r, 'correo') || ''
  if (r.accion.includes('login') || r.accion.includes('logout') || r.accion.includes('sesion') || r.accion.includes('token')) {
    return r.usuario_correo || ''
  }

  return ''
}

// Descripción de la acción
function getDescripcion(r: RegistroAuditoria): string {
  switch (r.accion) {
    // === USUARIOS ===
    case 'usuario_creado': {
      const rol = s(r, 'rol_global')
      return rol ? `Creado con rol ${fmt(rol)}` : 'Creado'
    }
    case 'usuario_editado': {
      const ca = s(r, 'correo_anterior'), cn = s(r, 'correo_nuevo')
      const na = s(r, 'nombre_anterior'), nn = s(r, 'nombre_nuevo')
      if (ca && cn && ca !== cn) return `Correo: ${ca} → ${cn}`
      if (na && nn && na !== nn) return `Nombre: ${na} → ${nn}`
      return 'Datos actualizados'
    }
    case 'usuario_activado': return 'Reactivado'
    case 'usuario_desactivado': {
      const razon = s(r, 'razon_suspension')
      return razon ? `Suspendido: ${razon}` : 'Suspendido'
    }
    case 'usuario_eliminado': return 'Eliminado'

    // === ROLES ===
    case 'rol_global_cambiado': {
      const ant = fmt(s(r, 'rol_anterior') || r.valor_anterior || '')
      const nue = fmt(s(r, 'rol_nuevo') || r.valor_nuevo || '')
      return ant && nue ? `${ant} → ${nue}` : nue || 'Rol cambiado'
    }
    case 'rol_modulo_asignado': {
      const rol = s(r, 'rol_nombre'), mod = s(r, 'modulo_id')
      return rol && mod ? `Asignado: ${rol} en ${mod}` : `Asignado: ${rol}` || 'Rol asignado'
    }
    case 'rol_modulo_removido': {
      const rol = s(r, 'rol_nombre'), mod = s(r, 'modulo_id')
      return rol && mod ? `Removido: ${rol} de ${mod}` : `Removido: ${rol}` || 'Rol removido'
    }
    case 'rol_modulo_cambiado': {
      const ant = s(r, 'rol_anterior_nombre') || r.valor_anterior || ''
      const nue = s(r, 'rol_nuevo_nombre') || r.valor_nuevo || ''
      return ant && nue ? `Cambiado: ${ant} → ${nue}` : 'Rol cambiado'
    }

    // === SESIONES ===
    case 'login_exitoso': return 'Inició sesión'
    case 'login_fallido': return s(r, 'razon') || 'Credenciales inválidas'
    case 'logout': return 'Cerró sesión'
    case 'sesion_expirada': return 'Sesión expirada por inactividad'

    // === MOVILIDAD - CUENTAS ===
    case 'cuenta_creada': {
      const num = s(r, 'numero_cuenta'), tipo = s(r, 'tipo_servicio')
      if (num && tipo) return `Creada: Cuenta #${num} (${fmt(tipo)})`
      return num ? `Creada: Cuenta #${num}` : 'Cuenta creada'
    }

    // === MOVILIDAD - TRASLADOS ===
    case 'traslado_iniciado': {
      const fecha = s(r, 'fecha_tramite')
      return fecha ? `Iniciado - Fecha trámite: ${fecha}` : 'Iniciado'
    }

    // === MOVILIDAD - RADICACIONES ===
    case 'radicacion_iniciada': {
      const fecha = s(r, 'fecha_tramite')
      return fecha ? `Iniciada - Fecha trámite: ${fecha}` : 'Iniciada'
    }

    // === MOVILIDAD - PROCESOS ===
    case 'proceso_completado': {
      const nue = fmt(r.valor_nuevo || '')
      return nue ? `Completado → ${nue}` : 'Completado'
    }
    case 'proceso_devuelto': {
      const obs = s(r, 'observaciones')
      return obs ? `Devuelto: ${obs}` : 'Devuelto'
    }
    case 'estado_cambiado': {
      const ant = fmt(s(r, 'estado_anterior') || r.valor_anterior || '')
      const nue = fmt(s(r, 'nuevo_estado') || r.valor_nuevo || '')
      return ant && nue ? `${ant} → ${nue}` : nue || 'Estado cambiado'
    }
    case 'novedad_agregada': {
      const tipo = s(r, 'tipo_novedad'), desc = s(r, 'descripcion')
      if (tipo && desc) return `${tipo}: ${desc.substring(0, 40)}${desc.length > 40 ? '...' : ''}`
      return tipo || 'Novedad agregada'
    }

    // === DEFAULT ===
    default:
      // Limpiar el nombre de la acción
      return r.accion
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase())
  }
}

// Fecha formateada
function fmtFecha(iso: string): string {
  const d = new Date(iso)
  const hoy = new Date()
  const ayer = new Date(); ayer.setDate(ayer.getDate() - 1)
  const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

  if (d.toDateString() === hoy.toDateString()) return `Hoy, ${hora}`
  if (d.toDateString() === ayer.toDateString()) return `Ayer, ${hora}`
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const columnasAuditoria: ColumnDef<RegistroAuditoria>[] = [
  {
    accessorKey: 'creado_en',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" />,
    cell: ({ row }) => <span className="text-sm text-muted-foreground whitespace-nowrap">{fmtFecha(row.getValue('creado_en'))}</span>,
    sortingFn: 'datetime',
  },
  {
    id: 'responsable',
    accessorKey: 'usuario_nombre',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Responsable" />,
    cell: ({ row }) => <span className="text-sm font-medium">{row.original.usuario_nombre || 'Sistema'}</span>,
  },
  {
    id: 'tipo',
    header: 'Tipo',
    cell: ({ row }) => {
      const cat = getCat(row.original.accion)
      return <Badge className={`${cat.color} font-normal`}>{cat.label}</Badge>
    },
  },
  {
    id: 'afectado',
    header: 'Afectado',
    cell: ({ row }) => {
      const afectado = getAfectado(row.original)
      return afectado
        ? <span className="text-sm font-medium">{afectado}</span>
        : <span className="text-muted-foreground">-</span>
    },
  },
  {
    id: 'descripcion',
    header: 'Descripción',
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{getDescripcion(row.original)}</span>,
  },
]
