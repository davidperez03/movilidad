import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Sesion {
  id: string
  usuario_id: string
  correo: string
  nombre_completo: string
  inicio_sesion: string
  ultima_actividad: string
  minutos_inactivo: number
  ip_address: string | null
  dispositivo: string
  acciones_realizadas: number
  token_expira_en: string | null
}

export function useSesiones() {
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const cargarSesiones = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('sys_vista_sesiones_activas')
        .select('*')
        .order('ultima_actividad', { ascending: false })

      if (error) throw error
      setSesiones(data || [])
    } catch (error) {
      console.error('Error cargando sesiones:', error)
      setSesiones([])
    } finally {
      setLoading(false)
    }
  }, [])

  const cerrarSesion = async (sesionId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const response = await fetch('/api/admin/cerrar-sesion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sesion_id: sesionId,
        admin_id: user.id,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al cerrar sesión')
    }

    return response.json()
  }

  const cerrarSesionesTokenExpirado = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const response = await fetch('/api/admin/limpiar-sesiones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        admin_id: user.id,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al limpiar sesiones')
    }

    const result = await response.json()
    return result.sesiones_cerradas || 0
  }

  return {
    sesiones,
    loading,
    cargarSesiones,
    cerrarSesion,
    cerrarSesionesTokenExpirado,
  }
}
