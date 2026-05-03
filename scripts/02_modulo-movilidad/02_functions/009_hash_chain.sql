-- Funciones de hash chain para mov_historial_acciones
-- Requiere _compute_chain_hash (definida en 018_hash_chain_todas_las_auditorias.sql
-- y en scripts/01_sistema-usuarios/02_functions/004_auditoria.sql).

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

CREATE OR REPLACE FUNCTION _mov_historial_inmutable()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'AUDIT_IMMUTABLE: mov_historial_acciones es inmutable. Operación % denegada.', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END; $$;
