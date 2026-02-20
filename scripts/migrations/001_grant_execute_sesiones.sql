-- ============================================================
-- Migración 001: GRANT EXECUTE en funciones de sesiones
-- ============================================================
-- Las funciones de sys_sesiones se crearon sin GRANT EXECUTE
-- explícito, dejando al rol 'authenticated' sin permiso de
-- llamarlas via REST API → 401 Unauthorized en el cliente.
-- ============================================================

GRANT EXECUTE ON FUNCTION registrar_inicio_sesion    TO authenticated;
GRANT EXECUTE ON FUNCTION registrar_fin_sesion       TO authenticated;
GRANT EXECUTE ON FUNCTION actualizar_actividad_sesion TO authenticated;
GRANT EXECUTE ON FUNCTION obtener_sesion_activa      TO authenticated;
GRANT EXECUTE ON FUNCTION cerrar_sesiones_inactivas  TO authenticated;

-- ROLLBACK:
-- REVOKE EXECUTE ON FUNCTION registrar_inicio_sesion     FROM authenticated;
-- REVOKE EXECUTE ON FUNCTION registrar_fin_sesion        FROM authenticated;
-- REVOKE EXECUTE ON FUNCTION actualizar_actividad_sesion  FROM authenticated;
-- REVOKE EXECUTE ON FUNCTION obtener_sesion_activa       FROM authenticated;
-- REVOKE EXECUTE ON FUNCTION cerrar_sesiones_inactivas   FROM authenticated;
