-- ============================================================================
-- CONFIGURAR ZONA HORARIA DE COLOMBIA (America/Bogota)
-- ⚠️ IMPORTANTE: Este script DEBE ejecutarse PRIMERO antes que cualquier otro
-- ============================================================================

-- 1. Cambiar zona horaria por defecto de la base de datos
ALTER DATABASE postgres SET timezone TO 'America/Bogota';

-- 2. Cambiar zona horaria de la sesión actual
SET timezone TO 'America/Bogota';

-- 3. Verificar el cambio
DO $$
BEGIN
  RAISE NOTICE 'Zona horaria configurada correctamente';
  RAISE NOTICE 'Timezone actual: %', current_setting('timezone');
END $$;

-- 4. Verificar que now() devuelve hora de Colombia
SELECT
  'Verificación de zona horaria' as descripcion,
  now() as hora_actual_colombia,
  current_setting('timezone') as timezone_configurado;

-- ============================================================================
-- RESULTADO ESPERADO:
-- - timezone_configurado debe ser: America/Bogota
-- - hora_actual_colombia debe mostrar la hora de Colombia (UTC-5)
--
-- SIGUIENTE PASO:
-- Ahora puedes ejecutar los demás scripts de creación de tablas.
-- Todas las columnas con "default now()" usarán automáticamente la hora de Colombia.
-- ============================================================================
