'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ActividadReciente } from '@/lib/dashboard/utils'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface DashboardStats {
  totalUsuarios: number
  totalSuperadmins: number
  usuariosActivos: number
  usuariosInactivos: number
  sesionesActivas: number
  totalAccionesHoy: number
}

interface AuditoriaItem {
  id: string
  accion: string
  detalles: Record<string, unknown> | null
  entidad_tipo: string
  usuario_correo: string | null
  usuario_nombre: string | null
  creado_en: string
}

async function obtenerSesionesActivas(supabase: SupabaseClient): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('sys_sesiones')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'activa')

    if (!error && count !== null) {
      return count
    }
  } catch {
    // Error de conexión
  }
  return 0
}

async function obtenerAccionesHoy(supabase: SupabaseClient): Promise<number> {
  try {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const { count, error } = await supabase
      .from('sys_auditoria')
      .select('*', { count: 'exact', head: true })
      .gte('creado_en', hoy.toISOString())

    if (!error && count !== null) {
      return count
    }
  } catch {
    // Error de conexión
  }
  return 0
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [actividadReciente, setActividadReciente] = useState<ActividadReciente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()

    const intervalo = setInterval(() => {
      cargarDatosEnTiempoReal()
    }, 60000)

    return () => clearInterval(intervalo)
  }, [])

  async function cargarDatosEnTiempoReal() {
    if (!stats) return

    const supabase = createClient()
    const [sesionesActivas, totalAccionesHoy] = await Promise.all([
      obtenerSesionesActivas(supabase),
      obtenerAccionesHoy(supabase)
    ])

    setStats({
      ...stats,
      sesionesActivas,
      totalAccionesHoy,
    })

    await cargarActividadReciente()
  }

  async function cargarActividadReciente() {
    try {
      const supabase = createClient()

      const { data: actividad, error } = await supabase
        .from('sys_vista_auditoria_completa')
        .select('*')
        .order('creado_en', { ascending: false })
        .limit(10)

      if (!error && actividad) {
        const actividadFormateada = (actividad as AuditoriaItem[]).map((item) => {
          const detalles = item.detalles || {}
          const detailsRecord = detalles as Record<string, string>

          return {
            id: item.id,
            accion: item.accion,
            detalles,
            entidad_tipo: item.entidad_tipo,
            usuario_correo: item.usuario_correo || detailsRecord.usuario_correo || 'Sistema',
            usuario_nombre: item.usuario_nombre || detailsRecord.usuario_nombre || 'Sistema',
            creado_en: item.creado_en,
          }
        })
        setActividadReciente(actividadFormateada)
      }
    } catch {
      // Error de conexión
    }
  }

  async function cargarDatos() {
    try {
      const supabase = createClient()

      const { data: usuarios, error: errorUsuarios } = await supabase
        .from('perfiles')
        .select('rol_global, activo')

      if (errorUsuarios) throw errorUsuarios

      const totalUsuarios = usuarios?.length || 0
      const totalSuperadmins = usuarios?.filter((u) => u.rol_global === 'superadmin').length || 0
      const usuariosActivos = usuarios?.filter((u) => u.activo === true).length || 0
      const usuariosInactivos = usuarios?.filter((u) => u.activo === false).length || 0

      const [sesionesActivas, totalAccionesHoy] = await Promise.all([
        obtenerSesionesActivas(supabase),
        obtenerAccionesHoy(supabase)
      ])

      setStats({
        totalUsuarios,
        totalSuperadmins,
        usuariosActivos,
        usuariosInactivos,
        sesionesActivas,
        totalAccionesHoy,
      })

      await cargarActividadReciente()
    } catch {
      // Error ya manejado
    } finally {
      setLoading(false)
    }
  }

  return {
    stats,
    actividadReciente,
    loading,
  }
}
