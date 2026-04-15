/**
 * Configuración de Sesiones y Seguridad
 *
 * Aquí puedes ajustar fácilmente los tiempos de sesión e inactividad
 */

export const SESSION_CONFIG = {
  /**
   * Tiempo de inactividad por tipo de dispositivo.
   * Mobile/Tablet tienen más margen porque el usuario puede estar
   * leyendo o en uso pasivo del dispositivo.
   */
  INACTIVITY_TIMEOUT_WEB: 300000,    // 5 minutos
  INACTIVITY_TIMEOUT_MOBILE: 600000, // 10 minutos
  INACTIVITY_TIMEOUT_TABLET: 600000, // 10 minutos

  /**
   * Tiempo de inactividad antes de cerrar sesión automáticamente.
   * @deprecated Usar INACTIVITY_TIMEOUT_WEB / MOBILE / TABLET.
   * Conservado como fallback.
   */
  INACTIVITY_TIMEOUT: 300000, // 5 minutos (fallback web)

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
   * Esto evita reseteos demasiado frecuentes del timer
   */
  ACTIVITY_THROTTLE: 2000, // 2 segundos

  /**
   * Eventos que se consideran "actividad del usuario"
   * y resetean el timer de inactividad
   * Solo eventos INTENCIONALES (no pasivos como mousemove o scroll)
   */
  ACTIVITY_EVENTS: [
    'mousedown',
    'keydown',
    'touchstart',
    'click',
  ] as const,

  /**
   * Mensaje que se muestra al usuario cuando se cierra por inactividad
   */
  TIMEOUT_MESSAGE: 'Tu sesión se cerró por inactividad. Por favor, inicia sesión nuevamente.',
}
