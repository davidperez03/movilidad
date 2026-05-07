import { createClient } from '@/lib/supabase/client'

const SESSION_KEY = 'mov_session_id'

export class SessionManager {
  private static sessionId: string | null = null

  private static async obtenerIP(): Promise<string | null> {
    try {
      const response = await fetch('/api/client-info')
      if (!response.ok) return null
      const data = await response.json()
      return data.ip || null
    } catch {
      return null
    }
  }

  static async registrarInicio(usuarioId: string): Promise<string | null> {
    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token || null
      const userAgent = navigator.userAgent
      const dispositivo = this.detectarDispositivo()
      const ipAddress = await this.obtenerIP()

      const { data, error } = await supabase.rpc('registrar_inicio_sesion', {
        p_usuario_id: usuarioId,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_dispositivo: dispositivo,
        p_token_sesion: accessToken,
      })

      if (error) {
        console.warn('[SessionManager] registrarInicio falló:', error.message)
        return null
      }

      this.sessionId = data
      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_KEY, data)
      }
      return data
    } catch {
      return null
    }
  }

  static async actualizarActividad(): Promise<'active' | 'inactive' | 'error'> {
    try {
      const sessionId = this.getSessionId()
      if (!sessionId) return 'inactive'

      const supabase = createClient()
      const { data, error } = await supabase.rpc('actualizar_actividad_sesion', {
        p_sesion_id: sessionId,
      })

      if (error) return 'error'
      return data ? 'active' : 'inactive'
    } catch {
      return 'error'
    }
  }

  static async registrarFin(estado: 'cerrada' | 'expirada' = 'cerrada'): Promise<boolean> {
    try {
      const sessionId = this.getSessionId()
      if (!sessionId) return false

      const supabase = createClient()
      const { error } = await supabase.rpc('registrar_fin_sesion', {
        p_sesion_id: sessionId,
        p_estado: estado,
      })

      if (error) return false

      this.sessionId = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_KEY)
      }
      return true
    } catch {
      return false
    }
  }

  static clearSessionId(): void {
    this.sessionId = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY)
    }
  }

  static getSessionId(): string | null {
    if (this.sessionId) return this.sessionId
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) {
        this.sessionId = stored
        return stored
      }
    }
    return null
  }

  static detectarDispositivo(): string {
    const ua = navigator.userAgent
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet'
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'mobile'
    return 'web'
  }
}
