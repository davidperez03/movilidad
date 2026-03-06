-- =============================================================================
-- CRON DE LIMPIEZA AUTOMÁTICA DE SESIONES
-- =============================================================================
-- Requiere la extensión pg_cron habilitada en Supabase:
-- Dashboard → Database → Extensions → pg_cron → Enable
--
-- Ejecutar este script UNA vez después de habilitar pg_cron.
-- =============================================================================

-- Limpiar sesiones por token JWT expirado (cada hora, minuto 0)
SELECT cron.schedule(
  'cerrar-sesiones-token-expirado',
  '0 * * * *',
  'SELECT cerrar_sesiones_token_expirado()'
);

-- Limpiar sesiones inactivas > 65 min (cada hora, minuto 5)
-- 65 min = 5 min de margen sobre el timeout de inactividad del cliente (60 min)
SELECT cron.schedule(
  'cerrar-sesiones-inactivas',
  '5 * * * *',
  'SELECT cerrar_sesiones_inactivas(65)'
);

-- =============================================================================
-- CONSULTAR CRONS ACTIVOS
-- =============================================================================
-- SELECT * FROM cron.job;

-- =============================================================================
-- ELIMINAR CRONS (si necesita reconfigurar)
-- =============================================================================
-- SELECT cron.unschedule('cerrar-sesiones-token-expirado');
-- SELECT cron.unschedule('cerrar-sesiones-inactivas');
