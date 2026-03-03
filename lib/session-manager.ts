/**
 * Gestor de Sesiones en Base de Datos
 *
 * Maneja el registro y actualización de sesiones en la tabla sys_sesiones
 */

import { createClient } from '@/lib/supabase/client'

export class SessionManager {
  private static sessionId: string | null = null

  /**
   * Obtiene la IP del cliente desde el servidor
   */
  private static async obtenerIP(): Promise<string | null> {
    try {
      const response = await fetch('/api/client-info')
      if (!response.ok) return null

      const data = await response.json()
      return data.ip || null
    } catch (error) {
      return null
    }
  }

  /**
   * Registra inicio de sesión en la base de datos
   */
  static async registrarInicio(usuarioId: string): Promise<string | null> {
    try {
      const supabase = createClient()

      // Obtener sesión actual de Supabase para el token
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token || null

      // Obtener información del cliente
      const userAgent = navigator.userAgent
      const dispositivo = this.detectarDispositivo()
      const ipAddress = await this.obtenerIP()

      // Llamar función RPC para registrar inicio
      const { data, error } = await supabase.rpc('registrar_inicio_sesion', {
        p_usuario_id: usuarioId,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_dispositivo: dispositivo,
        p_token_sesion: accessToken
      })

      if (error) {
        return null
      }

      // Guardar ID de sesión en memoria
      this.sessionId = data

      // Guardar también en sessionStorage para persistencia
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('current_session_id', data)
      }

      return data

    } catch (error) {
      return null
    }
  }

  /**
   * Actualiza la última actividad de la sesión
   */
  static async actualizarActividad(): Promise<boolean> {
    try {
      const sessionId = this.getSessionId()
      if (!sessionId) return false

      const supabase = createClient()

      const { error } = await supabase.rpc('actualizar_actividad_sesion', {
        p_sesion_id: sessionId
      })

      if (error) {
        return false
      }

      return true

    } catch (error) {
      return false
    }
  }

  /**
   * Registra el fin de sesión
   */
  static async registrarFin(estado: 'cerrada' | 'expirada' = 'cerrada'): Promise<boolean> {
    try {
      const sessionId = this.getSessionId()
      if (!sessionId) return false

      const supabase = createClient()

      const { error } = await supabase.rpc('registrar_fin_sesion', {
        p_sesion_id: sessionId,
        p_estado: estado
      })

      if (error) {
        return false
      }

      // Limpiar ID de sesión
      this.sessionId = null
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('current_session_id')
      }

      return true

    } catch (error) {
      return false
    }
  }

  /**
   * Obtiene el ID de sesión actual
   */
  static getSessionId(): string | null {
    // Primero intentar de memoria
    if (this.sessionId) return this.sessionId

    // Si no, intentar de sessionStorage
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('current_session_id')
      if (stored) {
        this.sessionId = stored
        return stored
      }
    }

    return null
  }

  /**
   * Detecta el tipo de dispositivo
   */
  private static detectarDispositivo(): string {
    const ua = navigator.userAgent

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet'
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile'
    }
    return 'web'
  }
}
