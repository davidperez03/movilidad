-- Funciones de hash chain para parq_historial_acciones

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

CREATE OR REPLACE FUNCTION _parq_historial_inmutable()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Permitir SET NULL en inspeccion_id cuando se elimina una inspeccion (ON DELETE SET NULL)
  IF TG_OP = 'UPDATE'
     AND OLD.inspeccion_id IS NOT NULL
     AND NEW.inspeccion_id IS NULL
     AND OLD.accion = NEW.accion
     AND COALESCE(OLD.vehiculo_id::text,'') = COALESCE(NEW.vehiculo_id::text,'') THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'AUDIT_IMMUTABLE: parq_historial_acciones es inmutable. Operacion % denegada.', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END; $$;
