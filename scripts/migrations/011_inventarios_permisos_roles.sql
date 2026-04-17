-- Agrega el permiso gestionar_inventario a los roles parq_administrador y parq_auxiliar.
-- Requerido para que estos roles puedan operar el módulo de inventarios.

UPDATE public.roles_modulo
SET permisos = permisos || '{"gestionar_inventario": true}'::jsonb
WHERE modulo_id = 'parqueadero'
  AND codigo IN ('parq_administrador', 'parq_auxiliar');

DO $$
DECLARE
  filas INTEGER;
BEGIN
  GET DIAGNOSTICS filas = ROW_COUNT;
  IF filas < 2 THEN
    RAISE WARNING 'Se esperaban 2 roles actualizados, se actualizaron: %', filas;
  ELSE
    RAISE NOTICE 'OK: % roles actualizados con gestionar_inventario', filas;
  END IF;
END $$;
