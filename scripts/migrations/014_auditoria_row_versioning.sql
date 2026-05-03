-- Migración 014: Row versioning (optimistic locking) en entidades críticas
-- Agrega columna `version` a tablas que reciben actualizaciones concurrentes.
-- Garantiza Data Integrity: detecta escrituras conflictivas antes de aplicarlas.
--
-- Uso desde la API: antes de UPDATE, verificar que version == version_esperada.
-- Si no coincide → 409 Conflict → el cliente debe recargar y reintentar.
--
-- Versión: v1.21.0

BEGIN;

-- =========================================================================
-- Función genérica que auto-incrementa version en cada UPDATE
-- =========================================================================
CREATE OR REPLACE FUNCTION _bump_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.version := OLD.version + 1;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION _bump_version IS
  'Incrementa automáticamente la columna version en cada UPDATE. Habilita optimistic locking.';

-- =========================================================================
-- 1. mov_traslados
-- =========================================================================
ALTER TABLE public.mov_traslados
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

DROP TRIGGER IF EXISTS trg_version_traslados ON public.mov_traslados;
CREATE TRIGGER trg_version_traslados
  BEFORE UPDATE ON public.mov_traslados
  FOR EACH ROW EXECUTE FUNCTION _bump_version();

COMMENT ON COLUMN public.mov_traslados.version IS
  'Versión del registro para optimistic locking. Incrementa en cada UPDATE.';

-- =========================================================================
-- 2. mov_radicaciones
-- =========================================================================
ALTER TABLE public.mov_radicaciones
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

DROP TRIGGER IF EXISTS trg_version_radicaciones ON public.mov_radicaciones;
CREATE TRIGGER trg_version_radicaciones
  BEFORE UPDATE ON public.mov_radicaciones
  FOR EACH ROW EXECUTE FUNCTION _bump_version();

COMMENT ON COLUMN public.mov_radicaciones.version IS
  'Versión del registro para optimistic locking. Incrementa en cada UPDATE.';

-- =========================================================================
-- 3. mov_cuentas_vehiculos (datos maestros de la cuenta)
-- =========================================================================
ALTER TABLE public.mov_cuentas_vehiculos
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

DROP TRIGGER IF EXISTS trg_version_cuentas ON public.mov_cuentas_vehiculos;
CREATE TRIGGER trg_version_cuentas
  BEFORE UPDATE ON public.mov_cuentas_vehiculos
  FOR EACH ROW EXECUTE FUNCTION _bump_version();

COMMENT ON COLUMN public.mov_cuentas_vehiculos.version IS
  'Versión del registro para optimistic locking.';

-- =========================================================================
-- 4. parq_inspecciones
-- =========================================================================
ALTER TABLE public.parq_inspecciones
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

DROP TRIGGER IF EXISTS trg_version_inspecciones ON public.parq_inspecciones;
CREATE TRIGGER trg_version_inspecciones
  BEFORE UPDATE ON public.parq_inspecciones
  FOR EACH ROW EXECUTE FUNCTION _bump_version();

COMMENT ON COLUMN public.parq_inspecciones.version IS
  'Versión del registro para optimistic locking.';

-- =========================================================================
-- 5. parq_vehiculos
-- =========================================================================
ALTER TABLE public.parq_vehiculos
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

DROP TRIGGER IF EXISTS trg_version_vehiculos_parq ON public.parq_vehiculos;
CREATE TRIGGER trg_version_vehiculos_parq
  BEFORE UPDATE ON public.parq_vehiculos
  FOR EACH ROW EXECUTE FUNCTION _bump_version();

COMMENT ON COLUMN public.parq_vehiculos.version IS
  'Versión del registro para optimistic locking.';

-- =========================================================================
-- 6. Función helper: verificar_version(tabla, id, version_esperada)
--    Retorna TRUE si la versión coincide, FALSE si hay conflicto.
--    Uso desde API: SELECT verificar_version('mov_traslados', $id, $v)
-- =========================================================================
CREATE OR REPLACE FUNCTION verificar_version(
  p_tabla    TEXT,
  p_id       UUID,
  p_version  INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actual INTEGER;
BEGIN
  EXECUTE format(
    'SELECT version FROM public.%I WHERE id = $1',
    p_tabla
  ) INTO v_actual USING p_id;

  RETURN v_actual = p_version;
END;
$$;

GRANT EXECUTE ON FUNCTION verificar_version TO authenticated;
COMMENT ON FUNCTION verificar_version IS
  'Verifica si la versión de un registro coincide con la esperada. Retorna FALSE en conflicto (409).';

COMMIT;

-- ROLLBACK:
-- BEGIN;
-- DROP TRIGGER IF EXISTS trg_version_traslados       ON public.mov_traslados;
-- DROP TRIGGER IF EXISTS trg_version_radicaciones    ON public.mov_radicaciones;
-- DROP TRIGGER IF EXISTS trg_version_cuentas         ON public.mov_cuentas_vehiculos;
-- DROP TRIGGER IF EXISTS trg_version_inspecciones    ON public.parq_inspecciones;
-- DROP TRIGGER IF EXISTS trg_version_vehiculos_parq  ON public.parq_vehiculos;
-- DROP FUNCTION IF EXISTS _bump_version();
-- DROP FUNCTION IF EXISTS verificar_version(TEXT, UUID, INTEGER);
-- ALTER TABLE public.mov_traslados           DROP COLUMN IF EXISTS version;
-- ALTER TABLE public.mov_radicaciones        DROP COLUMN IF EXISTS version;
-- ALTER TABLE public.mov_cuentas_vehiculos   DROP COLUMN IF EXISTS version;
-- ALTER TABLE public.parq_inspecciones       DROP COLUMN IF EXISTS version;
-- ALTER TABLE public.parq_vehiculos          DROP COLUMN IF EXISTS version;
-- COMMIT;
