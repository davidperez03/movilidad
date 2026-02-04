-- ============================================================================
-- SCRIPT DE LIMPIEZA DE BASE DE DATOS
-- ============================================================================
-- ADVERTENCIA: Este script ELIMINA TODOS los datos y estructuras de la BD
-- SOLO debe ejecutarse en entornos de DESARROLLO
-- ============================================================================

-- ============================================================================
-- VERIFICACIÓN DE SEGURIDAD
-- ============================================================================
-- Este script SOLO se ejecutará si:
-- 1. La variable 'app.allow_db_wipe' está configurada en 'SI_ESTOY_SEGURO'
-- 2. NO existe la tabla 'perfiles' con más de 10 usuarios (indica producción)
-- ============================================================================

DO $$
DECLARE
    v_confirmacion TEXT;
    v_usuarios_count INT;
    v_es_produccion BOOLEAN := FALSE;
BEGIN
    -- Verificar confirmación explícita
    BEGIN
        v_confirmacion := current_setting('app.allow_db_wipe', true);
    EXCEPTION WHEN OTHERS THEN
        v_confirmacion := NULL;
    END;

    IF v_confirmacion IS NULL OR v_confirmacion != 'SI_ESTOY_SEGURO' THEN
        RAISE EXCEPTION '
╔══════════════════════════════════════════════════════════════════════════════╗
║                         ⚠️  OPERACIÓN BLOQUEADA  ⚠️                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Este script eliminará TODA la base de datos.                                ║
║                                                                              ║
║  Para ejecutarlo, primero configure:                                         ║
║                                                                              ║
║    SET app.allow_db_wipe = ''SI_ESTOY_SEGURO'';                                ║
║                                                                              ║
║  Y luego ejecute este script nuevamente.                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝';
    END IF;

    -- Verificar si parece ser producción (más de 10 usuarios)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'perfiles' AND table_schema = 'public') THEN
        SELECT COUNT(*) INTO v_usuarios_count FROM public.perfiles;
        IF v_usuarios_count > 10 THEN
            v_es_produccion := TRUE;
        END IF;
    END IF;

    IF v_es_produccion THEN
        RAISE EXCEPTION '
╔══════════════════════════════════════════════════════════════════════════════╗
║                      🚫  PRODUCCIÓN DETECTADA  🚫                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Se detectaron más de 10 usuarios en la tabla perfiles.                      ║
║  Esto indica que podría ser un entorno de PRODUCCIÓN.                        ║
║                                                                              ║
║  Este script NO puede ejecutarse en producción.                              ║
║                                                                              ║
║  Si realmente necesita limpiar esta BD, contacte al administrador.           ║
╚══════════════════════════════════════════════════════════════════════════════╝';
    END IF;

    RAISE NOTICE '
╔══════════════════════════════════════════════════════════════════════════════╗
║                      ✓ Verificaciones pasadas                                ║
║                      Iniciando limpieza de BD...                             ║
╚══════════════════════════════════════════════════════════════════════════════╝';
END $$;

-- ============================================================================
-- PASO 1: Deshabilitar RLS en todas las tablas
-- ============================================================================
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
    RAISE NOTICE '✓ RLS deshabilitado en todas las tablas';
END $$;

-- ============================================================================
-- PASO 2: Eliminar todas las políticas RLS
-- ============================================================================
DO $$
DECLARE
    r RECORD;
    v_count INT := 0;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) ||
                ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
        v_count := v_count + 1;
    END LOOP;
    RAISE NOTICE '✓ % políticas RLS eliminadas', v_count;
END $$;

-- ============================================================================
-- PASO 3: Eliminar todos los triggers
-- ============================================================================
DO $$
DECLARE
    r RECORD;
    v_count INT := 0;
BEGIN
    FOR r IN (
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) ||
                ' ON public.' || quote_ident(r.event_object_table) || ' CASCADE';
        v_count := v_count + 1;
    END LOOP;
    RAISE NOTICE '✓ % triggers eliminados', v_count;
END $$;

-- ============================================================================
-- PASO 4: Eliminar todas las funciones
-- ============================================================================
DO $$
DECLARE
    r RECORD;
    v_count INT := 0;
BEGIN
    FOR r IN (
        SELECT p.proname, oidvectortypes(p.proargtypes) as argtypes
        FROM pg_proc p
        INNER JOIN pg_namespace n ON p.pronamespace = n.oid
        LEFT JOIN pg_depend d ON d.objid = p.oid AND d.deptype = 'e'
        WHERE n.nspname = 'public'
        AND d.objid IS NULL
    ) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) ||
                '(' || r.argtypes || ') CASCADE';
        v_count := v_count + 1;
    END LOOP;
    RAISE NOTICE '✓ % funciones eliminadas', v_count;
END $$;

-- ============================================================================
-- PASO 5: Eliminar todas las vistas
-- ============================================================================
DO $$
DECLARE
    r RECORD;
    v_count INT := 0;
BEGIN
    FOR r IN (
        SELECT table_name
        FROM information_schema.views
        WHERE table_schema = 'public'
    ) LOOP
        EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.table_name) || ' CASCADE';
        v_count := v_count + 1;
    END LOOP;
    RAISE NOTICE '✓ % vistas eliminadas', v_count;
END $$;

-- ============================================================================
-- PASO 6: Eliminar todas las tablas
-- ============================================================================
DO $$
DECLARE
    r RECORD;
    v_count INT := 0;
BEGIN
    FOR r IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
        v_count := v_count + 1;
    END LOOP;
    RAISE NOTICE '✓ % tablas eliminadas', v_count;
END $$;

-- ============================================================================
-- PASO 7: Eliminar todos los tipos ENUM
-- ============================================================================
DO $$
DECLARE
    r RECORD;
    v_count INT := 0;
BEGIN
    FOR r IN (
        SELECT t.typname
        FROM pg_type t
        INNER JOIN pg_namespace n ON t.typnamespace = n.oid
        LEFT JOIN pg_depend d ON d.objid = t.oid AND d.deptype = 'e'
        WHERE n.nspname = 'public'
        AND t.typtype = 'e'
        AND d.objid IS NULL
    ) LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
        v_count := v_count + 1;
    END LOOP;
    RAISE NOTICE '✓ % tipos ENUM eliminados', v_count;
END $$;

-- ============================================================================
-- PASO 8: Eliminar todas las secuencias
-- ============================================================================
DO $$
DECLARE
    r RECORD;
    v_count INT := 0;
BEGIN
    FOR r IN (
        SELECT sequence_name
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
    ) LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequence_name) || ' CASCADE';
        v_count := v_count + 1;
    END LOOP;
    RAISE NOTICE '✓ % secuencias eliminadas', v_count;
END $$;

-- ============================================================================
-- PASO 9: Limpiar la variable de confirmación
-- ============================================================================
RESET app.allow_db_wipe;

-- ============================================================================
-- RESUMEN FINAL
-- ============================================================================
DO $$
DECLARE
    v_tablas INT;
    v_funciones INT;
    v_vistas INT;
BEGIN
    SELECT COUNT(*) INTO v_tablas
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

    SELECT COUNT(*) INTO v_funciones
    FROM pg_proc
    INNER JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
    WHERE pg_namespace.nspname = 'public';

    SELECT COUNT(*) INTO v_vistas
    FROM information_schema.views
    WHERE table_schema = 'public';

    RAISE NOTICE '
╔══════════════════════════════════════════════════════════════════════════════╗
║                      ✓ LIMPIEZA COMPLETADA                                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Tablas restantes:    %                                                      ║
║  Funciones restantes: %                                                      ║
║  Vistas restantes:    %                                                      ║
╚══════════════════════════════════════════════════════════════════════════════╝',
    v_tablas, v_funciones, v_vistas;
END $$;
