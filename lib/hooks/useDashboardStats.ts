'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ActividadReciente } from '@/lib/dashboard/utils'

export interface DashboardStats {
  totalUsuarios: number
  totalSuperadmins: number
  usuariosActivos: number
  usuariosInactivos: number
  sesionesActivas: number
  totalAccionesHoy: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [actividadReciente, setActividadReciente] = useState<ActividadReciente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()

    // Auto-refresh cada 60 segundos
    const intervalo = setInterval(() => {
      cargarDatosEnTiempoReal()
    }, 60000)

    return () => clearInterval(intervalo)
  }, [])

  async function cargarDatosEnTiempoReal() {
    try {
      const supabase = createClient()

      if (stats) {
        // Obtener sesiones activas
        let sesionesActivas = 0
        try {
          const { count, error: errorSesiones } = await supabase
            .from('sys_sesiones')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'activa')

          if (!errorSesiones && count !== null) {
            sesionesActivas = count
          }
        } catch {
          // Ignorar error
        }

        // Obtener acciones de hoy
        let totalAccionesHoy = 0
        try {
          const hoy = new Date()
          hoy.setHours(0, 0, 0, 0)

          const { count, error: errorAuditoria } = await supabase
            .from('sys_auditoria')
            .select('*', { count: 'exact', head: true })
            .gte('creado_en', hoy.toISOString())

          if (!errorAuditoria && count !== null) {
            totalAccionesHoy = count
          }
        } catch {
          // Ignorar error
        }

        setStats({
          ...stats,
          sesionesActivas,
          totalAccionesHoy,
        })
      }

      // Actualizar actividad reciente
      await cargarActividadReciente()
    } catch (error) {
      // Error ya manejado
    }
  }

  async function cargarActividadReciente() {
    try {
      const supabase = createClient()

      const { data: actividad, error: errorActividad } = await supabase
        .from('sys_vista_auditoria_completa')
        .select('*')
        .order('creado_en', { ascending: false })
        .limit(10)

      if (!errorActividad && actividad) {
        const actividadFormateada = actividad.map((item: any) => {
          const detalles = item.detalles || {}
          const usuarioCorreo = item.usuario_correo || detalles.usuario_correo || 'Sistema'
          const usuarioNombre = item.usuario_nombre || detalles.usuario_nombre || 'Sistema'

          return {
            id: item.id,
            accion: item.accion,
            detalles,
            entidad_tipo: item.entidad_tipo,
            usuario_correo: usuarioCorreo,
            usuario_nombre: usuarioNombre,
            creado_en: item.creado_en,
          }
        })
        setActividadReciente(actividadFormateada)
      }
    } catch {
      // Ignorar error
    }
  }

  async function cargarDatos() {
    try {
      const supabase = createClient()

      // Obtener estadísticas de usuarios
      const { data: usuarios, error: errorUsuarios } = await supabase
        .from('perfiles')
        .select('rol_global, activo')

      if (errorUsuarios) throw errorUsuarios

      const totalUsuarios = usuarios?.length || 0
      const totalSuperadmins = usuarios?.filter((u) => u.rol_global === 'superadmin').length || 0
      const usuariosActivos = usuarios?.filter((u) => u.activo === true).length || 0
      const usuariosInactivos = usuarios?.filter((u) => u.activo === false).length || 0

      // Obtener sesiones activas
      let sesionesActivas = 0
      try {
        const { count, error: errorSesiones } = await supabase
          .from('sys_sesiones')
          .select('*', { count: 'exact', head: true })
          .eq('estado', 'activa')

        if (!errorSesiones && count !== null) {
          sesionesActivas = count
        }
      } catch {
        // Ignorar error
      }

      // Obtener acciones de hoy
      let totalAccionesHoy = 0
      try {
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)

        const { count, error: errorAuditoria } = await supabase
          .from('sys_auditoria')
          .select('*', { count: 'exact', head: true })
          .gte('creado_en', hoy.toISOString())

        if (!errorAuditoria && count !== null) {
          totalAccionesHoy = count
        }
      } catch {
        // Ignorar error
      }

      setStats({
        totalUsuarios,
        totalSuperadmins,
        usuariosActivos,
        usuariosInactivos,
        sesionesActivas,
        totalAccionesHoy,
      })

      // Cargar actividad reciente
      await cargarActividadReciente()
    } catch (error) {
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
