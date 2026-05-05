export const SESSION_CONFIG = {
  INACTIVITY_TIMEOUT_WEB: 300000,
  INACTIVITY_TIMEOUT_MOBILE: 600000,
  INACTIVITY_TIMEOUT_TABLET: 600000,

  /** @deprecated usar INACTIVITY_TIMEOUT_WEB / MOBILE / TABLET */
  INACTIVITY_TIMEOUT: 300000,

  WARNING_BEFORE_TIMEOUT: 30000,
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
