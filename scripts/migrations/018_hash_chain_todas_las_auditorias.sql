-- Migración 018: Hash chain + inmutabilidad en mov_historial_acciones,
-- parq_historial_acciones e inv_movimientos.
-- Sin esto las tres tablas son inmutables "por convención" pero no por
-- protección criptográfica — cualquiera con acceso directo podría borrar
-- registros sin que se detecte.
--
-- Versión: v1.21.0

BEGIN;

-- =========================================================================
-- 0. Función genérica de hash (reutilizada por los tres triggers)
--    Recibe el contenido ya serializado + hash anterior.
-- =========================================================================
CREATE OR REPLACE FUNCTION _compute_chain_hash(p_content TEXT, p_hash_ant TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE PARALLEL SAFE
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog
AS $$
  SELECT encode(
    digest(p_content || '|' || COALESCE(p_hash_ant, 'GENESIS'), 'sha256'),
    'hex'
  );
$$;

-- =========================================================================
-- 1. mov_historial_acciones
-- =========================================================================
ALTER TABLE public.mov_historial_acciones
  ADD COLUMN IF NOT EXISTS hash_anterior TEXT,
  ADD COLUMN IF NOT EXISTS hash_registro TEXT;

-- Backfill pre-migración
DO $$
DECLARE
  rec    RECORD;
  v_prev TEXT := 'GENESIS';
  v_hash TEXT;
BEGIN
  FOR rec IN
    SELECT * FROM public.mov_historial_acciones
    WHERE hash_registro IS NULL
    ORDER BY creado_en ASC, id ASC
  LOOP
    v_hash := _compute_chain_hash(
      rec.id::text || '|' ||
      rec.cuenta_id::text || '|' ||
      rec.accion || '|' ||
      COALESCE(rec.detalles::text, '{}') || '|' ||
      COALESCE(rec.estado_anterior, '') || '|' ||
      COALESCE(rec.estado_nuevo, '') || '|' ||
      rec.realizado_por::text || '|' ||
      rec.creado_en::text,
      v_prev
    );
    UPDATE public.mov_historial_acciones
    SET hash_anterior = v_prev, hash_registro = v_hash
    WHERE id = rec.id;
    v_prev := v_hash;
  END LOOP;
END;
$$;

-- Trigger hash chain
CREATE OR REPLACE FUNCTION _mov_historial_asignar_hash()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_prev TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('mov_historial_chain'));
  SELECT hash_registro INTO v_prev FROM public.mov_historial_acciones
  ORDER BY creado_en DESC, id DESC LIMIT 1;
  NEW.hash_anterior := COALESCE(v_prev, 'GENESIS');
  NEW.hash_registro := _compute_chain_hash(
    NEW.id::text || '|' || NEW.cuenta_id::text || '|' || NEW.accion || '|' ||
    COALESCE(NEW.detalles::text,'{}') || '|' ||
    COALESCE(NEW.estado_anterior,'') || '|' || COALESCE(NEW.estado_nuevo,'') || '|' ||
    NEW.realizado_por::text || '|' || COALESCE(NEW.creado_en, now())::text,
    NEW.hash_anterior
  );
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_mov_historial_hash ON public.mov_historial_acciones;
CREATE TRIGGER trg_mov_historial_hash
  BEFORE INSERT ON public.mov_historial_acciones
  FOR EACH ROW EXECUTE FUNCTION _mov_historial_asignar_hash();

-- Inmutabilidad
CREATE OR REPLACE FUNCTION _mov_historial_inmutable()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'AUDIT_IMMUTABLE: mov_historial_acciones es inmutable. Operación % denegada.', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END; $$;

DROP TRIGGER IF EXISTS trg_no_update_mov_historial ON public.mov_historial_acciones;
CREATE TRIGGER trg_no_update_mov_historial
  BEFORE UPDATE ON public.mov_historial_acciones
  FOR EACH ROW EXECUTE FUNCTION _mov_historial_inmutable();

DROP TRIGGER IF EXISTS trg_no_delete_mov_historial ON public.mov_historial_acciones;
CREATE TRIGGER trg_no_delete_mov_historial
  BEFORE DELETE ON public.mov_historial_acciones
  FOR EACH ROW EXECUTE FUNCTION _mov_historial_inmutable();

-- =========================================================================
-- 2. parq_historial_acciones
-- =========================================================================
ALTER TABLE public.parq_historial_acciones
  ADD COLUMN IF NOT EXISTS hash_anterior TEXT,
  ADD COLUMN IF NOT EXISTS hash_registro TEXT;

DO $$
DECLARE
  rec    RECORD;
  v_prev TEXT := 'GENESIS';
  v_hash TEXT;
BEGIN
  FOR rec IN
    SELECT * FROM public.parq_historial_acciones
    WHERE hash_registro IS NULL
    ORDER BY creado_en ASC, id ASC
  LOOP
    v_hash := _compute_chain_hash(
      rec.id::text || '|' ||
      COALESCE(rec.vehiculo_id::text, '') || '|' ||
      COALESCE(rec.inspeccion_id::text, '') || '|' ||
      rec.accion || '|' ||
      COALESCE(rec.detalles::text, '{}') || '|' ||
      COALESCE(rec.valor_anterior, '') || '|' ||
      COALESCE(rec.valor_nuevo, '') || '|' ||
      COALESCE(rec.realizado_por::text, '') || '|' ||
      rec.creado_en::text,
      v_prev
    );
    UPDATE public.parq_historial_acciones
    SET hash_anterior = v_prev, hash_registro = v_hash
    WHERE id = rec.id;
    v_prev := v_hash;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION _parq_historial_asignar_hash()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_prev TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('parq_historial_chain'));
  SELECT hash_registro INTO v_prev FROM public.parq_historial_acciones
  ORDER BY creado_en DESC, id DESC LIMIT 1;
  NEW.hash_anterior := COALESCE(v_prev, 'GENESIS');
  NEW.hash_registro := _compute_chain_hash(
    NEW.id::text || '|' ||
    COALESCE(NEW.vehiculo_id::text,'') || '|' ||
    COALESCE(NEW.inspeccion_id::text,'') || '|' ||
    NEW.accion || '|' ||
    COALESCE(NEW.detalles::text,'{}') || '|' ||
    COALESCE(NEW.valor_anterior,'') || '|' || COALESCE(NEW.valor_nuevo,'') || '|' ||
    COALESCE(NEW.realizado_por::text,'') || '|' ||
    COALESCE(NEW.creado_en, now())::text,
    NEW.hash_anterior
  );
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_parq_historial_hash ON public.parq_historial_acciones;
CREATE TRIGGER trg_parq_historial_hash
  BEFORE INSERT ON public.parq_historial_acciones
  FOR EACH ROW EXECUTE FUNCTION _parq_historial_asignar_hash();

CREATE OR REPLACE FUNCTION _parq_historial_inmutable()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'AUDIT_IMMUTABLE: parq_historial_acciones es inmutable. Operación % denegada.', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END; $$;

DROP TRIGGER IF EXISTS trg_no_update_parq_historial ON public.parq_historial_acciones;
CREATE TRIGGER trg_no_update_parq_historial
  BEFORE UPDATE ON public.parq_historial_acciones
  FOR EACH ROW EXECUTE FUNCTION _parq_historial_inmutable();

DROP TRIGGER IF EXISTS trg_no_delete_parq_historial ON public.parq_historial_acciones;
CREATE TRIGGER trg_no_delete_parq_historial
  BEFORE DELETE ON public.parq_historial_acciones
  FOR EACH ROW EXECUTE FUNCTION _parq_historial_inmutable();

-- =========================================================================
-- 3. inv_movimientos
-- =========================================================================
ALTER TABLE public.inv_movimientos
  ADD COLUMN IF NOT EXISTS hash_anterior TEXT,
  ADD COLUMN IF NOT EXISTS hash_registro TEXT;

DO $$
DECLARE
  rec    RECORD;
  v_prev TEXT := 'GENESIS';
  v_hash TEXT;
BEGIN
  FOR rec IN
    SELECT * FROM public.inv_movimientos
    WHERE hash_registro IS NULL
    ORDER BY creado_en ASC, id ASC
  LOOP
    v_hash := _compute_chain_hash(
      rec.id::text || '|' ||
      rec.item_id::text || '|' ||
      rec.modulo || '|' ||
      rec.tipo || '|' ||
      COALESCE(rec.origen, '') || '|' ||
      rec.destino || '|' ||
      rec.cantidad::text || '|' ||
      COALESCE(rec.creado_por::text, '') || '|' ||
      rec.creado_en::text,
      v_prev
    );
    UPDATE public.inv_movimientos
    SET hash_anterior = v_prev, hash_registro = v_hash
    WHERE id = rec.id;
    v_prev := v_hash;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION _inv_movimientos_asignar_hash()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_prev TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('inv_movimientos_chain'));
  SELECT hash_registro INTO v_prev FROM public.inv_movimientos
  ORDER BY creado_en DESC, id DESC LIMIT 1;
  NEW.hash_anterior := COALESCE(v_prev, 'GENESIS');
  NEW.hash_registro := _compute_chain_hash(
    NEW.id::text || '|' || NEW.item_id::text || '|' ||
    NEW.modulo || '|' || NEW.tipo || '|' ||
    COALESCE(NEW.origen,'') || '|' || NEW.destino || '|' ||
    NEW.cantidad::text || '|' ||
    COALESCE(NEW.creado_por::text,'') || '|' ||
    COALESCE(NEW.creado_en, now())::text,
    NEW.hash_anterior
  );
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_inv_movimientos_hash ON public.inv_movimientos;
CREATE TRIGGER trg_inv_movimientos_hash
  BEFORE INSERT ON public.inv_movimientos
  FOR EACH ROW EXECUTE FUNCTION _inv_movimientos_asignar_hash();

CREATE OR REPLACE FUNCTION _inv_movimientos_inmutable()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'AUDIT_IMMUTABLE: inv_movimientos es inmutable. Operación % denegada.', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END; $$;

DROP TRIGGER IF EXISTS trg_no_update_inv_movimientos ON public.inv_movimientos;
CREATE TRIGGER trg_no_update_inv_movimientos
  BEFORE UPDATE ON public.inv_movimientos
  FOR EACH ROW EXECUTE FUNCTION _inv_movimientos_inmutable();

DROP TRIGGER IF EXISTS trg_no_delete_inv_movimientos ON public.inv_movimientos;
CREATE TRIGGER trg_no_delete_inv_movimientos
  BEFORE DELETE ON public.inv_movimientos
  FOR EACH ROW EXECUTE FUNCTION _inv_movimientos_inmutable();

-- =========================================================================
-- 4. Función de verificación completa (las 4 tablas)
-- =========================================================================
CREATE OR REPLACE FUNCTION verificar_integridad_auditoria_completa()
RETURNS TABLE(
  tabla               TEXT,
  total_registros     BIGINT,
  registros_integros  BIGINT,
  registros_corruptos BIGINT,
  cadena_integra      BOOLEAN,
  primer_id_corrupto  UUID,
  primer_fecha_corrupta TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total BIGINT; v_integros BIGINT; v_corruptos BIGINT;
  v_primer_id UUID; v_primer_fec TIMESTAMPTZ;
  v_prev TEXT; v_hash_esp TEXT;
  rec RECORD;
BEGIN
  -- sys_auditoria
  v_total := 0; v_integros := 0; v_corruptos := 0;
  v_prev := 'GENESIS'; v_primer_id := NULL; v_primer_fec := NULL;
  FOR rec IN SELECT * FROM sys_auditoria ORDER BY creado_en ASC, id ASC LOOP
    v_total := v_total + 1;
    v_hash_esp := _auditoria_compute_hash(
      rec.id, rec.accion, rec.entidad_tipo, rec.entidad_id,
      rec.detalles, rec.valor_anterior, rec.valor_nuevo,
      rec.realizado_por, rec.ip_address, rec.creado_en, rec.hash_anterior
    );
    IF rec.hash_registro = v_hash_esp AND rec.hash_anterior = v_prev
      THEN v_integros := v_integros + 1;
    ELSE
      v_corruptos := v_corruptos + 1;
      IF v_primer_id IS NULL THEN v_primer_id := rec.id; v_primer_fec := rec.creado_en; END IF;
    END IF;
    v_prev := COALESCE(rec.hash_registro, v_prev);
  END LOOP;
  tabla := 'sys_auditoria'; total_registros := v_total; registros_integros := v_integros;
  registros_corruptos := v_corruptos; cadena_integra := (v_corruptos = 0);
  primer_id_corrupto := v_primer_id; primer_fecha_corrupta := v_primer_fec;
  RETURN NEXT;

  -- mov_historial_acciones
  v_total := 0; v_integros := 0; v_corruptos := 0;
  v_prev := 'GENESIS'; v_primer_id := NULL; v_primer_fec := NULL;
  FOR rec IN SELECT * FROM mov_historial_acciones ORDER BY creado_en ASC, id ASC LOOP
    v_total := v_total + 1;
    v_hash_esp := _compute_chain_hash(
      rec.id::text || '|' || rec.cuenta_id::text || '|' || rec.accion || '|' ||
      COALESCE(rec.detalles::text,'{}') || '|' ||
      COALESCE(rec.estado_anterior,'') || '|' || COALESCE(rec.estado_nuevo,'') || '|' ||
      rec.realizado_por::text || '|' || rec.creado_en::text,
      rec.hash_anterior
    );
    IF rec.hash_registro = v_hash_esp AND rec.hash_anterior = v_prev
      THEN v_integros := v_integros + 1;
    ELSE
      v_corruptos := v_corruptos + 1;
      IF v_primer_id IS NULL THEN v_primer_id := rec.id; v_primer_fec := rec.creado_en; END IF;
    END IF;
    v_prev := COALESCE(rec.hash_registro, v_prev);
  END LOOP;
  tabla := 'mov_historial_acciones'; total_registros := v_total; registros_integros := v_integros;
  registros_corruptos := v_corruptos; cadena_integra := (v_corruptos = 0);
  primer_id_corrupto := v_primer_id; primer_fecha_corrupta := v_primer_fec;
  RETURN NEXT;

  -- parq_historial_acciones
  v_total := 0; v_integros := 0; v_corruptos := 0;
  v_prev := 'GENESIS'; v_primer_id := NULL; v_primer_fec := NULL;
  FOR rec IN SELECT * FROM parq_historial_acciones ORDER BY creado_en ASC, id ASC LOOP
    v_total := v_total + 1;
    v_hash_esp := _compute_chain_hash(
      rec.id::text || '|' ||
      COALESCE(rec.vehiculo_id::text,'') || '|' ||
      COALESCE(rec.inspeccion_id::text,'') || '|' ||
      rec.accion || '|' ||
      COALESCE(rec.detalles::text,'{}') || '|' ||
      COALESCE(rec.valor_anterior,'') || '|' || COALESCE(rec.valor_nuevo,'') || '|' ||
      COALESCE(rec.realizado_por::text,'') || '|' || rec.creado_en::text,
      rec.hash_anterior
    );
    IF rec.hash_registro = v_hash_esp AND rec.hash_anterior = v_prev
      THEN v_integros := v_integros + 1;
    ELSE
      v_corruptos := v_corruptos + 1;
      IF v_primer_id IS NULL THEN v_primer_id := rec.id; v_primer_fec := rec.creado_en; END IF;
    END IF;
    v_prev := COALESCE(rec.hash_registro, v_prev);
  END LOOP;
  tabla := 'parq_historial_acciones'; total_registros := v_total; registros_integros := v_integros;
  registros_corruptos := v_corruptos; cadena_integra := (v_corruptos = 0);
  primer_id_corrupto := v_primer_id; primer_fecha_corrupta := v_primer_fec;
  RETURN NEXT;

  -- inv_movimientos
  v_total := 0; v_integros := 0; v_corruptos := 0;
  v_prev := 'GENESIS'; v_primer_id := NULL; v_primer_fec := NULL;
  FOR rec IN SELECT * FROM inv_movimientos ORDER BY creado_en ASC, id ASC LOOP
    v_total := v_total + 1;
    v_hash_esp := _compute_chain_hash(
      rec.id::text || '|' || rec.item_id::text || '|' ||
      rec.modulo || '|' || rec.tipo || '|' ||
      COALESCE(rec.origen,'') || '|' || rec.destino || '|' ||
      rec.cantidad::text || '|' ||
      COALESCE(rec.creado_por::text,'') || '|' || rec.creado_en::text,
      rec.hash_anterior
    );
    IF rec.hash_registro = v_hash_esp AND rec.hash_anterior = v_prev
      THEN v_integros := v_integros + 1;
    ELSE
      v_corruptos := v_corruptos + 1;
      IF v_primer_id IS NULL THEN v_primer_id := rec.id; v_primer_fec := rec.creado_en; END IF;
    END IF;
    v_prev := COALESCE(rec.hash_registro, v_prev);
  END LOOP;
  tabla := 'inv_movimientos'; total_registros := v_total; registros_integros := v_integros;
  registros_corruptos := v_corruptos; cadena_integra := (v_corruptos = 0);
  primer_id_corrupto := v_primer_id; primer_fecha_corrupta := v_primer_fec;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION verificar_integridad_auditoria_completa() TO authenticated;
COMMENT ON FUNCTION verificar_integridad_auditoria_completa IS
  'Verifica el hash chain de las 4 tablas de auditoría. Retorna una fila por tabla.';

COMMIT;
