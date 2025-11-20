/**
 * Configuración de Sesiones y Seguridad
 *
 * Aquí puedes ajustar fácilmente los tiempos de sesión e inactividad
 */

export const SESSION_CONFIG = {
  /**
   * Tiempo de inactividad antes de cerrar sesión automáticamente
   * Valores sugeridos:
   * - 60000 = 1 minuto (desarrollo/testing)
   * - 300000 = 5 minutos (recomendado para producción)
   * - 600000 = 10 minutos
   * - 900000 = 15 minutos
   */
  INACTIVITY_TIMEOUT: 300000, // 5 minutos

  /**
   * Tiempo de advertencia antes del cierre de sesión
   * Se mostrará un modal N segundos antes de cerrar sesión
   * null = sin advertencia
   */
  WARNING_BEFORE_TIMEOUT: 30000, // 30 segundos de advertencia

  /**
   * Intervalo para refrescar el token de Supabase cuando hay actividad
   * El token se refresca automáticamente, pero podemos forzarlo
   */
  TOKEN_REFRESH_INTERVAL: 30000, // 30 segundos

  /**
   * Habilitar/deshabilitar el timeout de inactividad
   * Útil para desarrollo o para deshabilitarlo temporalmente
   */
  ENABLE_INACTIVITY_TIMEOUT: true,

  /**
   * Throttle para actualización de actividad
   * Solo resetea los timers si han pasado al menos N ms desde la última vez
   * Esto evita que mousemove resetee el timer constantemente
   */
  ACTIVITY_THROTTLE: 5000, // 5 segundos

  /**
   * Eventos que se consideran "actividad del usuario"
   * y resetean el timer de inactividad
   */
  ACTIVITY_EVENTS: [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
  ] as const,

  /**
   * Mensaje que se muestra al usuario cuando se cierra por inactividad
   */
  TIMEOUT_MESSAGE: 'Tu sesión se cerró por inactividad. Por favor, inicia sesión nuevamente.',
}

/**
 * Helper para convertir minutos a milisegundos
 */
export const minutesToMs = (minutes: number) => minutes * 60 * 1000

/**
 * Helper para convertir milisegundos a texto legible
 */
export const msToReadable = (ms: number): string => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)

  if (minutes > 0) {
    return seconds > 0 ? `${minutes} min ${seconds} seg` : `${minutes} min`
  }
  return `${seconds} seg`
}
