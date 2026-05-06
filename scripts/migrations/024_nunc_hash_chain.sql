-- Migración 024: Hash chain + inmutabilidad en nunc_historial_acciones
-- + agrega nunc_historial_acciones a verificar_integridad_auditoria_completa()
--
-- Versión: v1.24.1

BEGIN;

-- =========================================================================
-- 1. Trigger BEFORE INSERT: calcula hash_anterior y hash_registro
-- =========================================================================
CREATE OR REPLACE FUNCTION _nunc_historial_asignar_hash()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_prev TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('nunc_historial_chain'));
  SELECT hash_registro INTO v_prev FROM public.nunc_historial_acciones
  ORDER BY creado_en DESC, id DESC LIMIT 1;
  NEW.hash_anterior := COALESCE(v_prev, 'GENESIS');
  NEW.hash_registro := _compute_chain_hash(
    NEW.id::text || '|' ||
    COALESCE(NEW.sesion_id::text,  '') || '|' ||
    COALESCE(NEW.registro_id::text,'') || '|' ||
    NEW.accion || '|' ||
    COALESCE(NEW.detalles::text,'{}') || '|' ||
    COALESCE(NEW.valor_anterior,'') || '|' ||
    COALESCE(NEW.valor_nuevo,   '') || '|' ||
    COALESCE(NEW.realizado_por::text,'') || '|' ||
    COALESCE(NEW.creado_en, now())::text,
    NEW.hash_anterior
  );
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_nunc_historial_hash ON public.nunc_historial_acciones;
CREATE TRIGGER trg_nunc_historial_hash
  BEFORE INSERT ON public.nunc_historial_acciones
  FOR EACH ROW EXECUTE FUNCTION _nunc_historial_asignar_hash();

-- =========================================================================
-- 2. Inmutabilidad: bloquea UPDATE y DELETE
-- =========================================================================
CREATE OR REPLACE FUNCTION _nunc_historial_inmutable()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'AUDIT_IMMUTABLE: nunc_historial_acciones es inmutable. Operación % denegada.', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END; $$;

DROP TRIGGER IF EXISTS trg_no_update_nunc_historial ON public.nunc_historial_acciones;
CREATE TRIGGER trg_no_update_nunc_historial
  BEFORE UPDATE ON public.nunc_historial_acciones
  FOR EACH ROW EXECUTE FUNCTION _nunc_historial_inmutable();

DROP TRIGGER IF EXISTS trg_no_delete_nunc_historial ON public.nunc_historial_acciones;
CREATE TRIGGER trg_no_delete_nunc_historial
  BEFORE DELETE ON public.nunc_historial_acciones
  FOR EACH ROW EXECUTE FUNCTION _nunc_historial_inmutable();

-- =========================================================================
-- 3. Backfill registros existentes sin hash (tabla nueva — probablemente vacía)
-- =========================================================================
DO $$
DECLARE
  rec    RECORD;
  v_prev TEXT := 'GENESIS';
  v_hash TEXT;
BEGIN
  FOR rec IN
    SELECT * FROM public.nunc_historial_acciones
    WHERE hash_registro IS NULL
    ORDER BY creado_en ASC, id ASC
  LOOP
    v_hash := _compute_chain_hash(
      rec.id::text || '|' ||
      COALESCE(rec.sesion_id::text,  '') || '|' ||
      COALESCE(rec.registro_id::text,'') || '|' ||
      rec.accion || '|' ||
      COALESCE(rec.detalles::text,'{}') || '|' ||
      COALESCE(rec.valor_anterior,'') || '|' ||
      COALESCE(rec.valor_nuevo,   '') || '|' ||
      COALESCE(rec.realizado_por::text,'') || '|' ||
      rec.creado_en::text,
      v_prev
    );
    UPDATE public.nunc_historial_acciones
    SET hash_anterior = v_prev, hash_registro = v_hash
    WHERE id = rec.id;
    v_prev := v_hash;
  END LOOP;
END;
$$;

-- =========================================================================
-- 4. Agregar nunc_historial_acciones a verificar_integridad_auditoria_completa
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

  -- nunc_historial_acciones
  v_total := 0; v_integros := 0; v_corruptos := 0;
  v_prev := 'GENESIS'; v_primer_id := NULL; v_primer_fec := NULL;
  FOR rec IN SELECT * FROM nunc_historial_acciones ORDER BY creado_en ASC, id ASC LOOP
    v_total := v_total + 1;
    v_hash_esp := _compute_chain_hash(
      rec.id::text || '|' ||
      COALESCE(rec.sesion_id::text,  '') || '|' ||
      COALESCE(rec.registro_id::text,'') || '|' ||
      rec.accion || '|' ||
      COALESCE(rec.detalles::text,'{}') || '|' ||
      COALESCE(rec.valor_anterior,'') || '|' ||
      COALESCE(rec.valor_nuevo,   '') || '|' ||
      COALESCE(rec.realizado_por::text,'') || '|' ||
      rec.creado_en::text,
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
  tabla := 'nunc_historial_acciones'; total_registros := v_total; registros_integros := v_integros;
  registros_corruptos := v_corruptos; cadena_integra := (v_corruptos = 0);
  primer_id_corrupto := v_primer_id; primer_fecha_corrupta := v_primer_fec;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION verificar_integridad_auditoria_completa() TO authenticated;

COMMIT;

-- ROLLBACK:
-- BEGIN;
-- DROP TRIGGER IF EXISTS trg_nunc_historial_hash ON public.nunc_historial_acciones;
-- DROP TRIGGER IF EXISTS trg_no_update_nunc_historial ON public.nunc_historial_acciones;
-- DROP TRIGGER IF EXISTS trg_no_delete_nunc_historial ON public.nunc_historial_acciones;
-- DROP FUNCTION IF EXISTS _nunc_historial_asignar_hash();
-- DROP FUNCTION IF EXISTS _nunc_historial_inmutable();
-- -- Restaurar verificar_integridad_auditoria_completa() sin bloque nunc (ver migración 018)
-- COMMIT;
