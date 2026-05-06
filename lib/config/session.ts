export const SESSION_CONFIG = {
  INACTIVITY_TIMEOUT_WEB: 300000,
  INACTIVITY_TIMEOUT_MOBILE: 3600000,  // 1 hora
  INACTIVITY_TIMEOUT_TABLET: 3600000,  // 1 hora

  /** @deprecated usar INACTIVITY_TIMEOUT_WEB / MOBILE / TABLET */
  INACTIVITY_TIMEOUT: 300000,

  WARNING_BEFORE_TIMEOUT: 60000, // 1 min de advertencia
  TOKEN_REFRESH_INTERVAL: 30000,
  ENABLE_INACTIVITY_TIMEOUT: true,
  ACTIVITY_THROTTLE: 15000,

  ACTIVITY_EVENTS: [
    'mousedown',
    'keydown',
    'touchstart',
    'click',
  ] as const,

  TIMEOUT_MESSAGE: 'Tu sesión se cerró por inactividad. Por favor, inicia sesión nuevamente.',
}
