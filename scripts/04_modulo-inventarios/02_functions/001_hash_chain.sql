-- Funciones de hash chain para inv_movimientos

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

CREATE OR REPLACE FUNCTION _inv_movimientos_inmutable()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'AUDIT_IMMUTABLE: inv_movimientos es inmutable. Operación % denegada.', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END; $$;
