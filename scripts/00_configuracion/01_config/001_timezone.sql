ALTER DATABASE postgres SET timezone TO 'America/Bogota';

SET timezone TO 'America/Bogota';

DO $$
BEGIN
  RAISE NOTICE 'Zona horaria configurada correctamente';
  RAISE NOTICE 'Timezone actual: %', current_setting('timezone');
END $$;

SELECT
  'Verificación de zona horaria' as descripcion,
  now() as hora_actual_colombia,
  current_setting('timezone') as timezone_configurado;
