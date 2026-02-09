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
}

const FILTROS_INITIAL: FiltrosAuditoria = {
  tipo: 'todos',
  usuario: 'todos',
  fechaInicio: '',
  fechaFin: '',
}

export function getTipoAccion(accion: string): string {
  if (accion.startsWith('usuario_')) return 'usuario'
  if (accion.startsWith('rol_')) return 'rol'
  if (accion.includes('login') || accion.includes('logout') || accion.includes('sesion') || accion.includes('token')) return 'sesion'
  if (accion.includes('inspeccion') || accion.includes('parq_') || accion.includes('vehiculo_parq') || accion.includes('personal_')) return 'parqueadero'
  return 'movilidad'
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
        .limit(500),
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
    return registros.filter((r) => {
      if (filtros.tipo !== 'todos' && getTipoAccion(r.accion) !== filtros.tipo) return false
      if (filtros.usuario !== 'todos' && r.usuario_id !== filtros.usuario) return false
      if (filtros.fechaInicio && r.creado_en < filtros.fechaInicio) return false
      if (filtros.fechaFin && r.creado_en.split('T')[0] > filtros.fechaFin) return false
      return true
    })
  }, [registros, filtros])

  const hayFiltros = filtros.tipo !== 'todos' || filtros.usuario !== 'todos' || filtros.fechaInicio || filtros.fechaFin

  const limpiarFiltros = useCallback(() => {
    setFiltros(FILTROS_INITIAL)
  }, [])

  const exportarCSV = useCallback(() => {
    const csv = [
      ['Fecha', 'Responsable', 'Tipo', 'Afectado', 'Acción', 'IP'].join(','),
      ...registrosFiltrados.map((r) => [
        `"${new Date(r.creado_en).toLocaleString('es-CO')}"`,
        `"${r.usuario_nombre}"`,
        `"${getTipoAccion(r.accion)}"`,
        `"${r.placa || ''}"`,
        `"${r.accion.replace(/_/g, ' ')}"`,
        `"${r.ip_address || ''}"`,
      ].join(',')),
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }, [registrosFiltrados])

  return {
    registros: registrosFiltrados,
    totalRegistros: registros.length,
    loading,
    usuarios,
    filtros,
    setFiltros,
    hayFiltros,
    limpiarFiltros,
    cargarDatos,
    exportarCSV,
  }
}
