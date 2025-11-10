-- ============================================================================
-- CAMBIAR ZONA HORARIA DE UTC A COLOMBIA (America/Bogota)
-- ============================================================================

-- 1. Cambiar zona horaria por defecto de la base de datos
ALTER DATABASE postgres SET timezone TO 'America/Bogota';

-- 2. Cambiar zona horaria de la sesión actual
SET timezone TO 'America/Bogota';

-- 3. Verificar el cambio
SHOW timezone;

-- ============================================================================
-- NOTA: Después de ejecutar esto, reinicia la conexión de Supabase
-- para que los cambios surtan efecto en todas las sesiones nuevas.
-- ============================================================================

-- 4. Si ya tienes datos con timestamps, NO necesitas convertirlos.
-- PostgreSQL automáticamente los mostrará en la nueva zona horaria.
-- Los timestamps WITH TIME ZONE se almacenan internamente en UTC
-- y se convierten automáticamente según la zona horaria de la sesión.

-- 5. OPCIONAL: Para verificar que funciona correctamente:
SELECT
  now() as hora_actual_colombia,
  now() AT TIME ZONE 'UTC' as hora_utc,
  now() AT TIME ZONE 'America/Bogota' as hora_colombia;
