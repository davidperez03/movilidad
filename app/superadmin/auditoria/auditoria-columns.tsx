'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { ESTADOS_CONFIG } from '@/lib/movilidad/config'
import { capitalizeName } from '@/lib/utils/capitalize'
import { ChevronRight, AlertCircle, AlertTriangle, Info } from 'lucide-react'

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
  user_agent?: string | null
  creado_en: string
  cuenta_id: string | null
  proceso_tipo: string | null
  placa: string | null
}

// ─── Severidad ───────────────────────────────────────────────────────────────

export type Severidad = 'critica' | 'alta' | 'media' | 'baja' | 'info'

export const SEV_CONFIG: Record<Severidad, { dot: string; text: string; label: string }> = {
  critica: { dot: 'bg-red-500',    text: 'text-red-600',    label: 'Crítico'  },
  alta:    { dot: 'bg-orange-400', text: 'text-orange-500', label: 'Alto'     },
  media:   { dot: 'bg-blue-400',   text: 'text-blue-500',   label: 'Medio'    },
  baja:    { dot: 'bg-slate-300',  text: 'text-slate-400',  label: 'Bajo'     },
  info:    { dot: 'bg-gray-200',   text: 'text-gray-400',   label: 'Info'     },
}

export function getSeveridad(accion: string): Severidad {
  switch (accion) {
    case 'usuario_eliminado':
    case 'sesion_cerrada_por_admin':
      return 'critica'
    case 'login_fallido':
    case 'usuario_desactivado':
    case 'rol_global_cambiado':
    case 'password_reseteado':
    case 'password_cambiado':
    case 'modulo_desactivado':
      return 'alta'
    case 'usuario_creado':
    case 'usuario_aprobado':
    case 'usuario_activado':
    case 'rol_modulo_asignado':
    case 'rol_modulo_removido':
    case 'rol_modulo_cambiado':
    case 'modulo_activado':
    case 'configuracion_modificada':
    case 'parq_vehiculo_desactivado':
      return 'media'
    case 'usuario_editado':
    case 'parq_vehiculo_editado':
    case 'parq_personal_actualizado':
    case 'estado_cambiado':
    case 'novedad_resuelta':
    case 'parq_novedad_subsanada':
    case 'proceso_devuelto':
      return 'baja'
    default:
      return 'info'
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function s(r: RegistroAuditoria, key: string): string {
  const val = r.detalles?.[key]
  return val !== undefined && val !== null ? String(val) : ''
}

function fmt(estado: string): string {
  if (!estado) return ''
  const config = ESTADOS_CONFIG[estado]
  if (config) return config.label
  return estado.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

export function getCat(accion: string): { label: string; color: string } {
  if (accion.startsWith('usuario_') || accion === 'password_reseteado' || accion === 'password_cambiado') return { label: 'Usuario', color: 'bg-blue-100 text-blue-800' }
  if (accion.startsWith('rol_')) return { label: 'Rol', color: 'bg-purple-100 text-purple-800' }
  if (accion.includes('login') || accion.includes('logout') || accion.includes('sesion') || accion.includes('token')) {
    return { label: 'Sesión', color: 'bg-slate-100 text-slate-700' }
  }
  if (accion === 'modulo_activado' || accion === 'modulo_desactivado' || accion === 'configuracion_modificada') {
    return { label: 'Sistema', color: 'bg-orange-100 text-orange-800' }
  }
  if (accion.startsWith('parq_')) return { label: 'Parqueadero', color: 'bg-cyan-100 text-cyan-800' }
  if (accion.startsWith('inv_')) return { label: 'Inventarios', color: 'bg-amber-100 text-amber-800' }
  if (accion === 'cuenta_creada') return { label: 'Cuenta', color: 'bg-teal-100 text-teal-800' }
  if (accion.includes('traslado')) return { label: 'Traslado', color: 'bg-amber-100 text-amber-800' }
  if (accion.includes('radicacion')) return { label: 'Radicación', color: 'bg-sky-100 text-sky-800' }
  if (accion.includes('proceso') || accion === 'estado_cambiado' || accion === 'observacion_agregada') return { label: 'Proceso', color: 'bg-violet-100 text-violet-800' }
  if (accion === 'novedad_agregada' || accion === 'novedad_resuelta') return { label: 'Novedad', color: 'bg-pink-100 text-pink-800' }
  return { label: 'Sistema', color: 'bg-gray-100 text-gray-700' }
}

export function getAfectado(r: RegistroAuditoria): string {
  if (r.placa) return r.placa

  const correo = s(r, 'correo') || s(r, 'correo_nuevo') || s(r, 'usuario_correo')
  const nombre = s(r, 'nombre_completo') || s(r, 'nombre_nuevo') || s(r, 'usuario_nombre')

  if (r.accion.startsWith('usuario_') || r.accion.startsWith('rol_') || r.accion === 'password_reseteado') {
    if (nombre && correo) return `${capitalizeName(nombre)} (${correo})`
    return correo || capitalizeName(nombre) || ''
  }

  if (r.accion === 'login_fallido') return s(r, 'correo') || ''
  if (r.accion.includes('login') || r.accion.includes('logout') || r.accion.includes('sesion') || r.accion.includes('token')) {
    return r.usuario_correo || ''
  }

  if (r.accion === 'parq_personal_actualizado') {
    const n = s(r, 'nombre'), c = s(r, 'correo')
    if (n && c) return `${capitalizeName(n)} (${c})`
    return c || capitalizeName(n) || ''
  }

  if (r.accion === 'modulo_activado' || r.accion === 'modulo_desactivado') {
    return s(r, 'nombre') || s(r, 'modulo_id') || ''
  }

  return ''
}

export function getDescripcion(r: RegistroAuditoria): string {
  switch (r.accion) {
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
    case 'usuario_activado': return 'Cuenta reactivada'
    case 'usuario_aprobado': return 'Cuenta aprobada por administrador'
    case 'usuario_desactivado': {
      const razon = s(r, 'razon_suspension')
      return razon ? `Suspendido: ${razon}` : 'Cuenta suspendida'
    }
    case 'usuario_eliminado': return 'Cuenta eliminada permanentemente'
    case 'password_reseteado': return 'Contraseña restablecida por administrador'
    case 'password_cambiado': {
      const razon = s(r, 'razon')
      return razon || 'Contraseña cambiada por el usuario'
    }

    case 'rol_global_cambiado': {
      const ant = fmt(s(r, 'rol_anterior') || r.valor_anterior || '')
      const nue = fmt(s(r, 'rol_nuevo') || r.valor_nuevo || '')
      return ant && nue ? `${ant} → ${nue}` : nue || 'Rol global cambiado'
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
      return ant && nue ? `${ant} → ${nue}` : 'Rol de módulo cambiado'
    }

    case 'login_exitoso': {
      const disp = s(r, 'dispositivo')
      return disp ? `Inició sesión (${disp})` : 'Inició sesión'
    }
    case 'login_fallido': return s(r, 'razon') || 'Credenciales inválidas'
    case 'logout': return 'Cerró sesión'
    case 'sesion_expirada': return 'Sesión expirada por inactividad'
    case 'sesion_cerrada_por_admin': return 'Sesión cerrada por administrador'
    case 'sesiones_token_expirado': {
      const n = s(r, 'sesiones_cerradas')
      return n ? `${n} sesiones cerradas por token expirado` : 'Tokens expirados'
    }
    case 'modulo_activado': {
      const nombre = s(r, 'nombre') || s(r, 'modulo_id')
      return nombre ? `Módulo "${nombre}" activado` : 'Módulo activado'
    }
    case 'modulo_desactivado': {
      const nombre = s(r, 'nombre') || s(r, 'modulo_id')
      return nombre ? `Módulo "${nombre}" desactivado` : 'Módulo desactivado'
    }
    case 'configuracion_modificada': return 'Configuración del sistema modificada'

    case 'cuenta_creada': {
      const num = s(r, 'numero_cuenta'), tipo = s(r, 'tipo_servicio')
      if (num && tipo) return `Cuenta #${num} (${fmt(tipo)})`
      return num ? `Cuenta #${num}` : 'Cuenta creada'
    }
    case 'traslado_iniciado': {
      const fecha = s(r, 'fecha_tramite')
      return fecha ? `Iniciado — Trámite: ${fecha}` : 'Traslado iniciado'
    }
    case 'radicacion_iniciada': {
      const fecha = s(r, 'fecha_tramite')
      return fecha ? `Iniciada — Trámite: ${fecha}` : 'Radicación iniciada'
    }
    case 'proceso_completado': {
      const nue = fmt(r.valor_nuevo || '')
      return nue ? `Completado → ${nue}` : 'Proceso completado'
    }
    case 'proceso_devuelto': {
      const obs = s(r, 'observaciones')
      return obs ? `Devuelto: ${obs}` : 'Proceso devuelto'
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
    case 'novedad_resuelta': {
      const tipo = s(r, 'tipo_novedad')
      return tipo ? `Resuelta: ${tipo}` : 'Novedad resuelta'
    }
    case 'observacion_agregada': {
      const obs = s(r, 'observacion')
      return obs ? obs.substring(0, 60) + (obs.length > 60 ? '...' : '') : 'Observación agregada'
    }

    case 'parq_vehiculo_creado': {
      const marca = s(r, 'marca'), modelo = s(r, 'modelo')
      return marca && modelo ? `Registrado: ${marca} ${modelo}` : 'Vehículo registrado'
    }
    case 'parq_vehiculo_editado': {
      const placaAnt = s(r, 'placa_anterior'), placaNue = s(r, 'placa_nueva')
      if (placaAnt && placaNue) return `Placa: ${placaAnt} → ${placaNue}`
      if (s(r, 'soat_vencimiento_nuevo')) return `SOAT actualizado → ${s(r, 'soat_vencimiento_nuevo')}`
      if (s(r, 'tecno_vencimiento_nuevo')) return `Tecnomecánica → ${s(r, 'tecno_vencimiento_nuevo')}`
      return 'Datos del vehículo actualizados'
    }
    case 'parq_vehiculo_activado': return 'Vehículo reactivado'
    case 'parq_vehiculo_desactivado': return 'Vehículo desactivado'
    case 'parq_inspeccion_creada': {
      const consec = s(r, 'consecutivo'), turno = s(r, 'turno')
      const apto = s(r, 'es_apto') === 'true' ? 'Apto' : 'No Apto'
      if (consec && turno) return `#${consec} (${turno}) → ${apto}`
      return consec ? `#${consec} → ${apto}` : `Inspección → ${apto}`
    }
    case 'parq_novedad_subsanada': {
      const item = s(r, 'item_nombre'), obs = s(r, 'observacion_subsanacion')
      if (item && obs) return `${item}: ${obs.substring(0, 40)}${obs.length > 40 ? '...' : ''}`
      return item ? `Subsanado: ${item}` : 'Novedad subsanada'
    }
    case 'parq_personal_actualizado': {
      const licCat = s(r, 'licencia_categoria_nueva')
      if (licCat) return `Licencia: categoría ${licCat}`
      if (s(r, 'licencia_vencimiento_nueva')) return `Licencia: vence ${s(r, 'licencia_vencimiento_nueva')}`
      const licNum = s(r, 'licencia_numero')
      if (licNum) return `Datos registrados (Lic. ${licNum})`
      return 'Datos de personal actualizados'
    }

    default:
      return r.accion.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }
}

function fmtFecha(iso: string): string {
  const d = new Date(iso)
  const ahora = new Date()
  const diffMs = ahora.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)

  if (diffMin < 1) return 'Ahora mismo'
  if (diffMin < 60) return `Hace ${diffMin} min`
  if (diffH < 24) return `Hace ${diffH}h`

  const ayer = new Date(); ayer.setDate(ayer.getDate() - 1)
  const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  if (d.toDateString() === ahora.toDateString()) return `Hoy, ${hora}`
  if (d.toDateString() === ayer.toDateString()) return `Ayer, ${hora}`
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// ─── Columnas ─────────────────────────────────────────────────────────────────

export const columnasAuditoria: ColumnDef<RegistroAuditoria>[] = [
  {
    id: 'sev',
    header: '',
    cell: ({ row }) => {
      const sev = getSeveridad(row.original.accion)
      const cfg = SEV_CONFIG[sev]
      if (sev === 'critica') return <AlertCircle className={`h-4 w-4 ${cfg.text} shrink-0`} />
      if (sev === 'alta') return <AlertTriangle className={`h-4 w-4 ${cfg.text} shrink-0`} />
      if (sev === 'media') return <Info className={`h-4 w-4 ${cfg.text} shrink-0`} />
      return <span className={`inline-block h-2 w-2 rounded-full ${cfg.dot}`} />
    },
  },
  {
    id: 'evento',
    header: 'Evento',
    cell: ({ row }) => {
      const cat = getCat(row.original.accion)
      const desc = getDescripcion(row.original)
      return (
        <div className="space-y-0.5 min-w-0">
          <Badge className={`${cat.color} font-normal text-xs`}>{cat.label}</Badge>
          <p className="text-sm text-muted-foreground truncate max-w-[260px]">{desc}</p>
        </div>
      )
    },
  },
  {
    id: 'responsable',
    accessorKey: 'usuario_nombre',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Responsable" />,
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{capitalizeName(row.original.usuario_nombre) || 'Sistema'}</p>
        <p className="text-xs text-muted-foreground hidden lg:block truncate">{row.original.usuario_correo}</p>
      </div>
    ),
  },
  {
    id: 'afectado',
    header: 'Afectado',
    cell: ({ row }) => {
      const afectado = getAfectado(row.original)
      return afectado
        ? <span className="text-sm font-medium">{afectado}</span>
        : <span className="text-muted-foreground text-sm">—</span>
    },
  },
  {
    accessorKey: 'creado_en',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cuándo" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">{fmtFecha(row.getValue('creado_en'))}</span>
    ),
    sortingFn: 'datetime',
  },
  {
    id: 'ip',
    header: 'IP',
    cell: ({ row }) => (
      row.original.ip_address
        ? <span className="text-xs font-mono text-muted-foreground">{row.original.ip_address}</span>
        : <span className="text-muted-foreground text-sm">—</span>
    ),
  },
  {
    id: 'detalle',
    header: '',
    cell: () => <ChevronRight className="h-4 w-4 text-muted-foreground" />,
  },
]
