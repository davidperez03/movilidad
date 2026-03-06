-- ============================================================
-- Migración 003: Auditoría individual en cierre de sesiones
--                + configuración pg_cron
-- ============================================================
-- Problemas que corrige:
--   1. cerrar_sesiones_inactivas() cerraba sesiones sin dejar
--      ningún registro en sys_auditoria (imposible rastrear
--      qué usuarios fueron desconectados por inactividad).
--   2. No existía proceso automático que limpiara sesiones con
--      token JWT expirado ni sesiones inactivas — quedaban
--      activas en BD indefinidamente.
-- ============================================================

-- ============================================================
-- 1. FUNCIÓN MEJORADA: cerrar_sesiones_inactivas
--    Ahora audita INDIVIDUALMENTE cada sesión cerrada.
-- ============================================================
CREATE OR REPLACE FUNCTION cerrar_sesiones_inactivas(
  p_minutos_inactividad INTEGER DEFAULT 60
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sesion RECORD;
  sesiones_cerradas INTEGER := 0;
BEGIN
  FOR v_sesion IN
    UPDATE public.sys_sesiones
    SET
      estado = 'expirada',
      fin_sesion = now(),
      actualizado_en = now()
    WHERE estado = 'activa'
      AND ultima_actividad < (now() - (p_minutos_inactividad || ' minutes')::INTERVAL)
    RETURNING id, usuario_id
  LOOP
    PERFORM registrar_auditoria_sistema(
      'sesion_expirada',
      'sesion',
      v_sesion.id,
      jsonb_build_object(
        'usuario_id', v_sesion.usuario_id,
        'motivo', 'inactividad_automatica',
        'minutos_inactividad', p_minutos_inactividad
      )
    );

    sesiones_cerradas := sesiones_cerradas + 1;
  END LOOP;

  RETURN sesiones_cerradas;
END;
$$;

-- ============================================================
-- 2. pg_cron: limpieza automática cada hora
--
-- REQUISITO PREVIO (hacer UNA sola vez en Supabase Dashboard):
--   Dashboard → Database → Extensions → pg_cron → Enable
--
-- Luego ejecutar los SELECT cron.schedule() de abajo.
-- Si pg_cron no está habilitado, estos SELECT fallarán con
-- "schema cron does not exist" — habilitar la extensión primero.
-- ============================================================

-- Limpiar sesiones con JWT expirado (cada hora, minuto 0)
SELECT cron.schedule(
  'cerrar-sesiones-token-expirado',
  '0 * * * *',
  'SELECT cerrar_sesiones_token_expirado()'
);

-- Limpiar sesiones inactivas > 65 min (cada hora, minuto 5)
-- 65 min = 5 min de margen sobre el timeout del cliente (60 min)
SELECT cron.schedule(
  'cerrar-sesiones-inactivas',
  '5 * * * *',
  'SELECT cerrar_sesiones_inactivas(65)'
);

-- ============================================================
-- VERIFICAR que los crons quedaron registrados:
--   SELECT jobid, jobname, schedule, command, active
--   FROM cron.job
--   WHERE jobname IN (
--     'cerrar-sesiones-token-expirado',
--     'cerrar-sesiones-inactivas'
--   );
-- ============================================================

-- ============================================================
-- ROLLBACK:
--   SELECT cron.unschedule('cerrar-sesiones-token-expirado');
--   SELECT cron.unschedule('cerrar-sesiones-inactivas');
--
--   -- Restaurar función original sin auditoría:
--   CREATE OR REPLACE FUNCTION cerrar_sesiones_inactivas(
--     p_minutos_inactividad INTEGER DEFAULT 60
--   )
--   RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER
--   SET search_path = public AS $$
--   DECLARE sesiones_cerradas INTEGER;
--   BEGIN
--     WITH sesiones_a_cerrar AS (
--       UPDATE public.sys_sesiones
--       SET estado = 'expirada', fin_sesion = now(), actualizado_en = now()
--       WHERE estado = 'activa'
--         AND ultima_actividad < (now() - (p_minutos_inactividad || ' minutes')::INTERVAL)
--       RETURNING id, usuario_id
--     )
--     SELECT COUNT(*) INTO sesiones_cerradas FROM sesiones_a_cerrar;
--     RETURN sesiones_cerradas;
--   END; $$;
-- ============================================================
