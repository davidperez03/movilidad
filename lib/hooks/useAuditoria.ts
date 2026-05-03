'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { RegistroAuditoria } from '@/app/superadmin/auditoria/auditoria-columns'

export interface FiltrosAuditoria {
  tipo: string
  usuario: string
  fechaInicio: string
  fechaFin: string
  busqueda: string
  quickFilter: string
}

const FILTROS_INITIAL: FiltrosAuditoria = {
  tipo: 'todos',
  usuario: 'todos',
  fechaInicio: '',
  fechaFin: '',
  busqueda: '',
  quickFilter: 'todos',
}

export function getTipoAccion(accion: string): string {
  if (accion.startsWith('usuario_') || accion === 'password_reseteado' || accion === 'password_cambiado') return 'usuario'
  if (accion.startsWith('rol_')) return 'rol'
  if (accion.includes('login') || accion.includes('logout') || accion.includes('sesion') || accion.includes('token')) return 'sesion'
  if (accion.startsWith('parq_')) return 'parqueadero'
  if (accion.startsWith('inv_')) return 'inventarios'
  if (accion === 'modulo_activado' || accion === 'modulo_desactivado' || accion === 'configuracion_modificada') return 'sistema'
  return 'movilidad'
}

const ACCIONES_CRITICAS = new Set([
  'usuario_eliminado',
  'sesion_cerrada_por_admin',
  'login_fallido',
  'usuario_desactivado',
  'rol_global_cambiado',
  'password_reseteado',
  'password_cambiado',
  'modulo_desactivado',
])

function isCritico(accion: string): boolean {
  return ACCIONES_CRITICAS.has(accion)
}

/** Devuelve YYYY-MM-DD en hora local del navegador (no UTC) */
function fechaLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function aplicarQuickFilter(registros: RegistroAuditoria[], quickFilter: string): RegistroAuditoria[] {
  const ahora = new Date()

  switch (quickFilter) {
    case 'hoy': {
      const hoy = fechaLocal(ahora)
      return registros.filter((r) => fechaLocal(new Date(r.creado_en)) === hoy)
    }
    case 'semana': {
      const hace7 = new Date(ahora); hace7.setDate(hace7.getDate() - 7); hace7.setHours(0, 0, 0, 0)
      return registros.filter((r) => new Date(r.creado_en) >= hace7)
    }
    case 'mes': {
      const hace30 = new Date(ahora); hace30.setDate(hace30.getDate() - 30); hace30.setHours(0, 0, 0, 0)
      return registros.filter((r) => new Date(r.creado_en) >= hace30)
    }
    case 'criticos':
      return registros.filter((r) => isCritico(r.accion))
    case 'login_fallido':
      return registros.filter((r) => r.accion === 'login_fallido')
    default:
      return registros
  }
}

export function useAuditoria() {
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([])
  const [loading, setLoading] = useState(true)
  const [usuarios, setUsuarios] = useState<{ id: string; label: string }[]>([])
  const [filtros, setFiltros] = useState<FiltrosAuditoria>(FILTROS_INITIAL)

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const [auditoriaRes, usuariosRes] = await Promise.all([
      supabase
        .from('sys_vista_auditoria_completa')
        .select('*')
        .order('creado_en', { ascending: false })
        .limit(1000),
      supabase
        .from('perfiles')
        .select('id, nombre_completo, correo')
        .order('nombre_completo'),
    ])

    if (auditoriaRes.error) {
      toast.error('Error al cargar auditoría')
      setLoading(false)
      return
    }

    const data: RegistroAuditoria[] = (auditoriaRes.data || []).map((item: Record<string, unknown>) => ({
      id: String(item.id || ''),
      modulo: String(item.modulo || 'sistema'),
      accion: String(item.accion || ''),
      entidad_tipo: String(item.entidad_tipo || ''),
      entidad_id: String(item.entidad_id || ''),
      detalles: (item.detalles as Record<string, unknown>) || {},
      valor_anterior: item.valor_anterior ? String(item.valor_anterior) : null,
      valor_nuevo: item.valor_nuevo ? String(item.valor_nuevo) : null,
      usuario_id: String(item.usuario_id || ''),
      usuario_correo: String(item.usuario_correo || ''),
      usuario_nombre: String(item.usuario_nombre || 'Sistema'),
      ip_address: item.ip_address ? String(item.ip_address) : null,
      user_agent: item.user_agent ? String(item.user_agent) : null,
      creado_en: String(item.creado_en || ''),
      cuenta_id: item.cuenta_id ? String(item.cuenta_id) : null,
      proceso_tipo: item.proceso_tipo ? String(item.proceso_tipo) : null,
      placa: item.placa ? String(item.placa) : null,
    }))

    setRegistros(data)
    setUsuarios(
      (usuariosRes.data || []).map((u: { id: string; nombre_completo: string | null; correo: string }) => ({
        id: u.id,
        label: u.nombre_completo || u.correo,
      }))
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const registrosFiltrados = useMemo(() => {
    const busquedaLower = filtros.busqueda.toLowerCase()

    let resultado = registros

    // Quick filter (temporal)
    if (filtros.quickFilter !== 'todos') {
      resultado = aplicarQuickFilter(resultado, filtros.quickFilter)
    }

    resultado = resultado.filter((r) => {
      if (filtros.tipo !== 'todos') {
        const tipo = getTipoAccion(r.accion)
        if (filtros.tipo === 'usuario') {
          if (tipo !== 'usuario' && tipo !== 'rol') return false
        } else if (tipo !== filtros.tipo) return false
      }
      if (filtros.usuario !== 'todos' && r.usuario_id !== filtros.usuario) return false
      if (filtros.fechaInicio && r.creado_en < filtros.fechaInicio) return false
      if (filtros.fechaFin && r.creado_en.split('T')[0] > filtros.fechaFin) return false

      if (busquedaLower) {
        const textos = [
          r.accion,
          r.usuario_nombre,
          r.usuario_correo,
          r.placa,
          r.ip_address,
          r.entidad_tipo,
          r.valor_anterior,
          r.valor_nuevo,
          JSON.stringify(r.detalles),
        ].filter(Boolean).join(' ').toLowerCase()

        if (!textos.includes(busquedaLower)) return false
      }

      return true
    })

    return resultado
  }, [registros, filtros])

  const hayFiltros = filtros.tipo !== 'todos' || filtros.usuario !== 'todos' || !!filtros.fechaInicio || !!filtros.fechaFin || !!filtros.busqueda || filtros.quickFilter !== 'todos'

  const limpiarFiltros = useCallback(() => {
    setFiltros(FILTROS_INITIAL)
  }, [])

  const exportarCSV = useCallback(() => {
    const headers = ['Fecha', 'Responsable', 'Correo', 'Severidad', 'Tipo', 'Acción', 'Descripción', 'Afectado/Placa', 'Estado Anterior', 'Estado Nuevo', 'IP', 'Módulo']
    const rows = registrosFiltrados.map((r) => {
      const sev = ACCIONES_CRITICAS.has(r.accion) ? 'Crítico/Alto' : 'Normal'
      const desc = r.accion.replace(/_/g, ' ')
      return [
        `"${new Date(r.creado_en).toLocaleString('es-CO')}"`,
        `"${r.usuario_nombre}"`,
        `"${r.usuario_correo}"`,
        `"${sev}"`,
        `"${getTipoAccion(r.accion)}"`,
        `"${desc}"`,
        `"${r.placa || ''}"`,
        `"${r.valor_anterior || ''}"`,
        `"${r.valor_nuevo || ''}"`,
        `"${r.ip_address || ''}"`,
        `"${r.modulo}"`,
      ].join(',')
    })

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }, [registrosFiltrados])

  // Alertas basadas en los últimos 1000 registros cargados
  const alertas = useMemo(() => {
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recientes = registros.filter((r) => new Date(r.creado_en) >= hace24h)
    return {
      loginsFallidos: recientes.filter((r) => r.accion === 'login_fallido').length,
      usuariosEliminados: recientes.filter((r) => r.accion === 'usuario_eliminado').length,
      sesionesCerradasAdmin: recientes.filter((r) => r.accion === 'sesion_cerrada_por_admin').length,
    }
  }, [registros])

  return {
    registros: registrosFiltrados,
    registrosTodos: registros,
    totalRegistros: registros.length,
    loading,
    usuarios,
    filtros,
    setFiltros,
    hayFiltros,
    limpiarFiltros,
    cargarDatos,
    exportarCSV,
    alertas,
  }
}
