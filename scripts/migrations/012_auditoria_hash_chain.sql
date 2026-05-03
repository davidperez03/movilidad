-- Migración 012: Hash chain + inmutabilidad + sesion_id en sys_auditoria
-- Implementa non-repudiation mediante hash encadenado SHA-256 (pgcrypto).
-- Agrega: secuencia global, sesion_id, hash_registro, hash_anterior.
-- Triggers de inmutabilidad: ningún registro puede modificarse ni eliminarse.
-- Función verificar_integridad_auditoria() para auditoría externa.
--
-- ORDEN CRÍTICO: backfill ANTES de crear triggers de inmutabilidad.
--
-- Versión: v1.21.0
-- Cumplimiento: ISO 27001 A.12.4 (Logging and Monitoring), A.18.1 (Legal)

BEGIN;

-- =========================================================================
-- 1. pgcrypto instalado en schema extensions (Supabase Dashboard → Extensions).
--    Se referencia agregando 'extensions' al search_path de la función.
-- =========================================================================

-- =========================================================================
-- 2. Nuevas columnas en sys_auditoria
-- =========================================================================
ALTER TABLE public.sys_auditoria
  ADD COLUMN IF NOT EXISTS secuencia   BIGINT GENERATED ALWAYS AS IDENTITY,
  ADD COLUMN IF NOT EXISTS sesion_id   UUID REFERENCES public.sys_sesiones(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS hash_anterior TEXT,
  ADD COLUMN IF NOT EXISTS hash_registro TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_sys_auditoria_secuencia
  ON public.sys_auditoria(secuencia);

CREATE INDEX IF NOT EXISTS idx_sys_auditoria_sesion_id
  ON public.sys_auditoria(sesion_id);

COMMENT ON COLUMN public.sys_auditoria.secuencia IS
  'Orden canónico autoincremental del hash chain — no editable';
COMMENT ON COLUMN public.sys_auditoria.sesion_id IS
  'Sesión activa en sys_sesiones al momento del evento (trazabilidad sesión→acción)';
COMMENT ON COLUMN public.sys_auditoria.hash_anterior IS
  'hash_registro del registro anterior en la cadena (GENESIS para el primero)';
COMMENT ON COLUMN public.sys_auditoria.hash_registro IS
  'SHA-256(id||accion||...||hash_anterior) — integridad e imposibilidad de negación';

-- =========================================================================
-- 3. Función de cómputo de hash (IMMUTABLE, determinista, reutilizable)
-- =========================================================================
CREATE OR REPLACE FUNCTION _auditoria_compute_hash(
  p_id            UUID,
  p_accion        TEXT,
  p_entidad_tipo  TEXT,
  p_entidad_id    UUID,
  p_detalles      JSONB,
  p_valor_ant     TEXT,
  p_valor_nuevo   TEXT,
  p_realizado_por UUID,
  p_ip            INET,
  p_creado_en     TIMESTAMPTZ,
  p_hash_ant      TEXT
)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog
AS $$
  SELECT encode(
    digest(
      p_id::text                          || '|' ||
      p_accion                            || '|' ||
      COALESCE(p_entidad_tipo, '')        || '|' ||
      COALESCE(p_entidad_id::text, '')    || '|' ||
      COALESCE(p_detalles::text, '{}')    || '|' ||
      COALESCE(p_valor_ant, '')           || '|' ||
      COALESCE(p_valor_nuevo, '')         || '|' ||
      COALESCE(p_realizado_por::text, '') || '|' ||
      COALESCE(p_ip::text, '')            || '|' ||
      p_creado_en::text                   || '|' ||
      COALESCE(p_hash_ant, 'GENESIS'),
      'sha256'
    ),
    'hex'
  );
$$;

-- =========================================================================
-- 4. BACKFILL: computar hashes para registros existentes
--    DEBE ejecutarse ANTES de los triggers de inmutabilidad.
-- =========================================================================
DO $$
DECLARE
  rec        RECORD;
  v_prev     TEXT := 'GENESIS';
  v_hash_reg TEXT;
BEGIN
  FOR rec IN
    SELECT * FROM public.sys_auditoria
    WHERE hash_registro IS NULL
    ORDER BY creado_en ASC, id ASC
  LOOP
    v_hash_reg := _auditoria_compute_hash(
      rec.id, rec.accion, rec.entidad_tipo, rec.entidad_id,
      rec.detalles, rec.valor_anterior, rec.valor_nuevo,
      rec.realizado_por, rec.ip_address, rec.creado_en,
      v_prev
    );

    UPDATE public.sys_auditoria
    SET hash_anterior = v_prev,
        hash_registro = v_hash_reg
    WHERE id = rec.id;

    v_prev := v_hash_reg;
  END LOOP;
END;
$$;

-- =========================================================================
-- 5. Trigger BEFORE INSERT: asigna hash_anterior y computa hash_registro
--    Usa pg_advisory_xact_lock para serializar escrituras y garantizar
--    cadena estrictamente secuencial (sin bifurcaciones concurrentes).
--    Costo aceptable: sistema de tránsito, <1 000 eventos/hora.
-- =========================================================================
CREATE OR REPLACE FUNCTION _auditoria_asignar_hash()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash_ant TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('sys_auditoria_chain'));

  SELECT hash_registro INTO v_hash_ant
  FROM   public.sys_auditoria
  ORDER  BY secuencia DESC
  LIMIT  1;

  NEW.hash_anterior := COALESCE(v_hash_ant, 'GENESIS');
  NEW.hash_registro := _auditoria_compute_hash(
    NEW.id, NEW.accion, NEW.entidad_tipo, NEW.entidad_id,
    NEW.detalles, NEW.valor_anterior, NEW.valor_nuevo,
    NEW.realizado_por, NEW.ip_address,
    COALESCE(NEW.creado_en, now()),
    NEW.hash_anterior
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auditoria_hash_chain ON public.sys_auditoria;
CREATE TRIGGER trg_auditoria_hash_chain
  BEFORE INSERT ON public.sys_auditoria
  FOR EACH ROW EXECUTE FUNCTION _auditoria_asignar_hash();

-- =========================================================================
-- 6. Triggers de INMUTABILIDAD
--    Creados DESPUÉS del backfill para no bloquear los UPDATEs de backfill.
-- =========================================================================
CREATE OR REPLACE FUNCTION _auditoria_inmutable()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION
    'AUDIT_IMMUTABLE: registro de auditoría es inmutable '
    '(accion=%, secuencia=%). Operación % denegada por política de no repudio.',
    COALESCE(OLD.accion, '?'),
    COALESCE(OLD.secuencia::text, '?'),
    TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

DROP TRIGGER IF EXISTS trg_no_update_auditoria ON public.sys_auditoria;
CREATE TRIGGER trg_no_update_auditoria
  BEFORE UPDATE ON public.sys_auditoria
  FOR EACH ROW EXECUTE FUNCTION _auditoria_inmutable();

DROP TRIGGER IF EXISTS trg_no_delete_auditoria ON public.sys_auditoria;
CREATE TRIGGER trg_no_delete_auditoria
  BEFORE DELETE ON public.sys_auditoria
  FOR EACH ROW EXECUTE FUNCTION _auditoria_inmutable();

-- =========================================================================
-- 7. Actualizar registrar_auditoria_sistema: agrega parámetro sesion_id
--    Eliminar la versión anterior (8 params) para evitar ambigüedad en
--    resolución de overloads — la nueva (9 params con DEFAULT NULL) la reemplaza.
-- =========================================================================
DROP FUNCTION IF EXISTS public.registrar_auditoria_sistema(TEXT, TEXT, UUID, JSONB, TEXT, TEXT, INET, TEXT);

CREATE OR REPLACE FUNCTION registrar_auditoria_sistema(
  p_accion         TEXT,
  p_entidad_tipo   TEXT  DEFAULT NULL,
  p_entidad_id     UUID  DEFAULT NULL,
  p_detalles       JSONB DEFAULT NULL,
  p_valor_anterior TEXT  DEFAULT NULL,
  p_valor_nuevo    TEXT  DEFAULT NULL,
  p_ip_address     INET  DEFAULT NULL,
  p_user_agent     TEXT  DEFAULT NULL,
  p_sesion_id      UUID  DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nuevo_id    UUID;
  v_sesion_id UUID;
BEGIN
  -- Prioridad: parámetro explícito > config local inyectada por la API route
  IF p_sesion_id IS NOT NULL THEN
    v_sesion_id := p_sesion_id;
  ELSE
    BEGIN
      v_sesion_id := NULLIF(current_setting('app.current_session_id', true), '')::UUID;
    EXCEPTION WHEN OTHERS THEN
      v_sesion_id := NULL;
    END;
  END IF;

  INSERT INTO public.sys_auditoria (
    accion, entidad_tipo, entidad_id, detalles,
    valor_anterior, valor_nuevo,
    realizado_por, sesion_id,
    ip_address, user_agent
  ) VALUES (
    p_accion, p_entidad_tipo, p_entidad_id, p_detalles,
    p_valor_anterior, p_valor_nuevo,
    auth.uid(), v_sesion_id,
    p_ip_address, p_user_agent
  )
  RETURNING id INTO nuevo_id;

  RETURN nuevo_id;
END;
$$;

GRANT EXECUTE ON FUNCTION registrar_auditoria_sistema(TEXT, TEXT, UUID, JSONB, TEXT, TEXT, INET, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION _auditoria_compute_hash(UUID, TEXT, TEXT, UUID, JSONB, TEXT, TEXT, UUID, INET, TIMESTAMPTZ, TEXT) TO authenticated;

-- =========================================================================
-- 8. Función de verificación de la cadena (llamada por /api/admin/auditoria/verificar)
-- =========================================================================
CREATE OR REPLACE FUNCTION verificar_integridad_auditoria(
  p_desde TIMESTAMPTZ DEFAULT NULL,
  p_hasta TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE(
  total_registros           BIGINT,
  registros_integros        BIGINT,
  registros_corruptos       BIGINT,
  cadena_integra            BOOLEAN,
  primer_secuencia_corrupta BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total    BIGINT := 0;
  v_integros BIGINT := 0;
  v_corruptos BIGINT := 0;
  v_primer   BIGINT := NULL;
  v_prev_hash TEXT  := 'GENESIS';
  rec        RECORD;
  v_hash_esp TEXT;
BEGIN
  FOR rec IN
    SELECT * FROM public.sys_auditoria
    WHERE (p_desde IS NULL OR creado_en >= p_desde)
      AND (p_hasta IS NULL OR creado_en <= p_hasta)
    ORDER BY secuencia ASC
  LOOP
    v_total := v_total + 1;

    v_hash_esp := _auditoria_compute_hash(
      rec.id, rec.accion, rec.entidad_tipo, rec.entidad_id,
      rec.detalles, rec.valor_anterior, rec.valor_nuevo,
      rec.realizado_por, rec.ip_address, rec.creado_en,
      rec.hash_anterior
    );

    IF rec.hash_registro = v_hash_esp AND rec.hash_anterior = v_prev_hash THEN
      v_integros := v_integros + 1;
    ELSE
      v_corruptos := v_corruptos + 1;
      IF v_primer IS NULL THEN v_primer := rec.secuencia; END IF;
    END IF;

    v_prev_hash := COALESCE(rec.hash_registro, v_prev_hash);
  END LOOP;

  RETURN QUERY SELECT v_total, v_integros, v_corruptos, (v_corruptos = 0), v_primer;
END;
$$;

GRANT EXECUTE ON FUNCTION verificar_integridad_auditoria(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

COMMENT ON FUNCTION verificar_integridad_auditoria IS
  'Verifica hash chain de sys_auditoria. Detecta registros corruptos o modificados post-inserción. Solo superadmin vía API.';

COMMIT;

-- ==========================================================================
-- ROLLBACK (ejecutar si la migración debe revertirse):
-- BEGIN;
-- DROP TRIGGER IF EXISTS trg_auditoria_hash_chain  ON public.sys_auditoria;
-- DROP TRIGGER IF EXISTS trg_no_update_auditoria   ON public.sys_auditoria;
-- DROP TRIGGER IF EXISTS trg_no_delete_auditoria   ON public.sys_auditoria;
-- DROP FUNCTION IF EXISTS _auditoria_asignar_hash();
-- DROP FUNCTION IF EXISTS _auditoria_inmutable();
-- DROP FUNCTION IF EXISTS _auditoria_compute_hash(UUID,TEXT,TEXT,UUID,JSONB,TEXT,TEXT,UUID,INET,TIMESTAMPTZ,TEXT);
-- DROP FUNCTION IF EXISTS verificar_integridad_auditoria(TIMESTAMPTZ,TIMESTAMPTZ);
-- ALTER TABLE public.sys_auditoria
--   DROP COLUMN IF EXISTS secuencia,
--   DROP COLUMN IF EXISTS sesion_id,
--   DROP COLUMN IF EXISTS hash_anterior,
--   DROP COLUMN IF EXISTS hash_registro;
-- COMMIT;
-- ==========================================================================
