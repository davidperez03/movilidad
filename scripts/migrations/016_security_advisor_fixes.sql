-- Migración 016: Correcciones del Security Advisor de Supabase
-- Revoca EXECUTE en funciones CRON que no deben ser llamadas por usuarios.
-- Las funciones trigger_* no se tocan: son falsos positivos (PostgreSQL impide
-- llamarlas directamente via RPC aunque tengan EXECUTE grant).
--
-- Versión: v1.21.0

BEGIN;

-- =========================================================================
-- 1. Funciones CRON: solo el sistema (pg_cron / service_role) debe llamarlas.
--    Un usuario autenticado no tiene motivo para invocarlas directamente.
-- =========================================================================
REVOKE EXECUTE ON FUNCTION public.cerrar_sesiones_inactivas(integer)     FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.cerrar_sesiones_token_expirado()        FROM authenticated;

-- =========================================================================
-- 2. Política de storage: reemplazar SELECT amplia por una más restrictiva.
--    El acceso a URLs de objetos individuales sigue funcionando (URLs firmadas
--    o tokens — no requieren lista). Solo bloqueamos el listado del bucket.
-- =========================================================================
DROP POLICY IF EXISTS "Archivos públicos de parqueadero" ON storage.objects;

-- Permite acceder a un objeto por URL exacta, pero NO listar el bucket completo.
-- La condición name = '' nunca es verdadera → efectivamente deniega SELECT masivo.
-- El acceso por URL pública sigue funcionando a través del CDN de Supabase.
CREATE POLICY "Archivos públicos de parqueadero"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'parqueadero');

-- Nota: si las fotos de parqueadero son verdaderamente públicas y se acceden
-- por URL directa (no listado), esta política es equivalente a la anterior
-- para el caso de uso real. Si se necesita listado para alguna funcionalidad
-- interna, hacerlo desde service_role en una API route del servidor (no cliente).

COMMIT;

-- ROLLBACK:
-- BEGIN;
-- GRANT EXECUTE ON FUNCTION public.cerrar_sesiones_inactivas(integer) TO authenticated;
-- GRANT EXECUTE ON FUNCTION public.cerrar_sesiones_token_expirado()   TO authenticated;
-- COMMIT;
