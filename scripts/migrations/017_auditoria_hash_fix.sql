-- Migración 017: Corrige consistencia del hash chain en sys_auditoria
-- Problema: el backfill (012) ordenó los registros por creado_en ASC,
-- pero el trigger y la verificación usaban ORDER BY secuencia ASC.
-- Como secuencia se asigna en orden físico de heap (no cronológico),
-- los hashes no coincidían para registros pre-migración.
-- Solución: alinear trigger + verificación + re-backfill a creado_en ASC.
--
-- Versión: v1.21.0

BEGIN;

-- =========================================================================
-- 1. Deshabilitar triggers de inmutabilidad para el re-backfill
-- =========================================================================
ALTER TABLE public.sys_auditoria DISABLE TRIGGER trg_no_update_auditoria;
ALTER TABLE public.sys_auditoria DISABLE TRIGGER trg_no_delete_auditoria;

-- =========================================================================
-- 2. Re-backfill completo en orden creado_en ASC, id ASC (determinístico)
-- =========================================================================
DO $$
DECLARE
  rec        RECORD;
  v_prev     TEXT := 'GENESIS';
  v_hash_reg TEXT;
BEGIN
  -- Limpiar todos los hashes primero
  UPDATE public.sys_auditoria SET hash_anterior = NULL, hash_registro = NULL;

  FOR rec IN
    SELECT * FROM public.sys_auditoria
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
-- 3. Re-habilitar triggers de inmutabilidad
-- =========================================================================
ALTER TABLE public.sys_auditoria ENABLE TRIGGER trg_no_update_auditoria;
ALTER TABLE public.sys_auditoria ENABLE TRIGGER trg_no_delete_auditoria;

-- =========================================================================
-- 4. Corregir trigger: usar creado_en DESC, id DESC en lugar de secuencia DESC
--    para que nuevos registros sigan el mismo orden que el backfill y verificación.
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
  ORDER  BY creado_en DESC, id DESC
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

-- =========================================================================
-- 5. Corregir función de verificación: misma clave de orden que el backfill
--    y devolver detalle del primer registro corrupto para la UI.
-- =========================================================================
DROP FUNCTION IF EXISTS verificar_integridad_auditoria(TIMESTAMPTZ, TIMESTAMPTZ);

CREATE OR REPLACE FUNCTION verificar_integridad_auditoria(
  p_desde TIMESTAMPTZ DEFAULT NULL,
  p_hasta TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE(
  total_registros           BIGINT,
  registros_integros        BIGINT,
  registros_corruptos       BIGINT,
  cadena_integra            BOOLEAN,
  primer_secuencia_corrupta BIGINT,
  primer_accion_corrupta    TEXT,
  primer_fecha_corrupta     TIMESTAMPTZ,
  primer_usuario_corrupto   UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total     BIGINT := 0;
  v_integros  BIGINT := 0;
  v_corruptos BIGINT := 0;
  v_primer_seq  BIGINT := NULL;
  v_primer_acc  TEXT   := NULL;
  v_primer_fec  TIMESTAMPTZ := NULL;
  v_primer_usr  UUID   := NULL;
  v_prev_hash TEXT := 'GENESIS';
  rec         RECORD;
  v_hash_esp  TEXT;
BEGIN
  FOR rec IN
    SELECT * FROM public.sys_auditoria
    WHERE (p_desde IS NULL OR creado_en >= p_desde)
      AND (p_hasta IS NULL OR creado_en <= p_hasta)
    ORDER BY creado_en ASC, id ASC
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
      IF v_primer_seq IS NULL THEN
        v_primer_seq := rec.secuencia;
        v_primer_acc := rec.accion;
        v_primer_fec := rec.creado_en;
        v_primer_usr := rec.realizado_por;
      END IF;
    END IF;

    v_prev_hash := COALESCE(rec.hash_registro, v_prev_hash);
  END LOOP;

  RETURN QUERY SELECT
    v_total, v_integros, v_corruptos,
    (v_corruptos = 0),
    v_primer_seq, v_primer_acc, v_primer_fec, v_primer_usr;
END;
$$;

GRANT EXECUTE ON FUNCTION verificar_integridad_auditoria(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

COMMIT;

-- ROLLBACK: no aplica — el re-backfill sobreescribe los hashes anteriores (incorrectos).
