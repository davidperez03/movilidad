
DO $$
BEGIN
  RAISE NOTICE '⚠️  ADVERTENCIA: Este script eliminará TODOS los datos de movilidad';
  RAISE NOTICE '⚠️  Asegúrate de tener un backup antes de continuar';
END $$;

TRUNCATE TABLE public.mov_historial_acciones CASCADE;

DO $$
BEGIN
  RAISE NOTICE '✓ Historial de acciones eliminado';
END $$;

TRUNCATE TABLE public.mov_novedades CASCADE;

DO $$
BEGIN
  RAISE NOTICE '✓ Novedades eliminadas';
END $$;

TRUNCATE TABLE public.mov_traslados CASCADE;

DO $$
BEGIN
  RAISE NOTICE '✓ Traslados eliminados';
END $$;

TRUNCATE TABLE public.mov_radicaciones CASCADE;

DO $$
BEGIN
  RAISE NOTICE '✓ Radicaciones eliminadas';
END $$;

TRUNCATE TABLE public.mov_cuentas_vehiculos CASCADE;

DO $$
BEGIN
  RAISE NOTICE '✓ Cuentas de vehículos eliminadas';
END $$;

-- ALTER SEQUENCE mov_cuentas_vehiculos_id_seq RESTART WITH 1;
-- ALTER SEQUENCE mov_traslados_id_seq RESTART WITH 1;
-- ALTER SEQUENCE mov_radicaciones_id_seq RESTART WITH 1;
-- ALTER SEQUENCE mov_novedades_id_seq RESTART WITH 1;
-- ALTER SEQUENCE mov_historial_acciones_id_seq RESTART WITH 1;

DO $$
DECLARE
  count_cuentas INTEGER;
  count_traslados INTEGER;
  count_radicaciones INTEGER;
  count_novedades INTEGER;
  count_historial INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_cuentas FROM public.mov_cuentas_vehiculos;
  SELECT COUNT(*) INTO count_traslados FROM public.mov_traslados;
  SELECT COUNT(*) INTO count_radicaciones FROM public.mov_radicaciones;
  SELECT COUNT(*) INTO count_novedades FROM public.mov_novedades;
  SELECT COUNT(*) INTO count_historial FROM public.mov_historial_acciones;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ LIMPIEZA COMPLETADA';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Registros restantes:';
  RAISE NOTICE '  - Cuentas de vehículos: %', count_cuentas;
  RAISE NOTICE '  - Traslados: %', count_traslados;
  RAISE NOTICE '  - Radicaciones: %', count_radicaciones;
  RAISE NOTICE '  - Novedades: %', count_novedades;
  RAISE NOTICE '  - Historial: %', count_historial;
  RAISE NOTICE '';
  RAISE NOTICE 'Las tablas, vistas y funciones permanecen intactas.';
  RAISE NOTICE '========================================';
END $$;
