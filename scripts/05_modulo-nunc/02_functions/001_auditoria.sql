-- Hash chain: ver scripts/migrations/024_nunc_hash_chain.sql
-- (_nunc_historial_asignar_hash + _nunc_historial_inmutable)

CREATE OR REPLACE FUNCTION registrar_auditoria_nunc(
  p_sesion_id      UUID  DEFAULT NULL,
  p_registro_id    UUID  DEFAULT NULL,
  p_accion         TEXT  DEFAULT NULL,
  p_detalles       JSONB DEFAULT NULL,
  p_valor_anterior TEXT  DEFAULT NULL,
  p_valor_nuevo    TEXT  DEFAULT NULL,
  p_realizado_por  UUID  DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nuevo_id UUID;
BEGIN
  INSERT INTO public.nunc_historial_acciones (
    sesion_id, registro_id, accion, detalles,
    valor_anterior, valor_nuevo, realizado_por
  ) VALUES (
    p_sesion_id, p_registro_id, p_accion, p_detalles,
    p_valor_anterior, p_valor_nuevo,
    COALESCE(p_realizado_por, auth.uid())
  )
  RETURNING id INTO nuevo_id;
  RETURN nuevo_id;
END;
$$;

-- ============================================================
-- Trigger: sesión creada
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_nunc_sesion_creada()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM registrar_auditoria_nunc(
    NEW.id, NULL, 'nunc_sesion_creada',
    jsonb_build_object(
      'codigo',         NEW.codigo,
      'entidad_nombre', NEW.entidad_nombre,
      'nombre_peritos', NEW.nombre_peritos,
      'expira_en',      NEW.expira_en
    ),
    NULL, 'activa',
    NEW.generado_por
  );
  RETURN NEW;
END;
$$;

-- ============================================================
-- Trigger: cambio de estado de sesión
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_nunc_sesion_estado()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    PERFORM registrar_auditoria_nunc(
      NEW.id, NULL,
      CASE WHEN NEW.estado = 'cerrada' THEN 'nunc_sesion_cerrada' ELSE 'nunc_sesion_expirada' END,
      jsonb_build_object(
        'codigo',         NEW.codigo,
        'entidad_nombre', NEW.entidad_nombre
      ),
      OLD.estado, NEW.estado
    );
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================
-- Trigger: registro creado
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_nunc_registro_creado()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_codigo TEXT;
BEGIN
  SELECT codigo INTO v_codigo FROM public.nunc_sesiones WHERE id = NEW.sesion_id;
  PERFORM registrar_auditoria_nunc(
    NEW.sesion_id, NEW.id, 'nunc_registro_creado',
    jsonb_build_object(
      'origen',        'EXTERNO',
      'codigo_sesion',  v_codigo,
      'placa',          NEW.placa,
      'nunc',           NEW.nunc_dpto || '-' || NEW.nunc_municipio || '-' || NEW.nunc_entidad || '-' ||
                        NEW.nunc_unidad || '-' || NEW.nunc_anio || '-' || NEW.nunc_consecutivo
    ),
    NULL, NEW.placa
  );
  RETURN NEW;
END;
$$;

-- ============================================================
-- Trigger: registro editado
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_nunc_registro_editado()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_codigo TEXT;
BEGIN
  SELECT codigo INTO v_codigo FROM public.nunc_sesiones WHERE id = NEW.sesion_id;
  PERFORM registrar_auditoria_nunc(
    NEW.sesion_id, NEW.id, 'nunc_registro_editado',
    jsonb_build_object(
      'origen',         'EXTERNO',
      'codigo_sesion',   v_codigo,
      'placa_anterior',  OLD.placa,
      'placa_nueva',     NEW.placa,
      'nunc_anterior',   OLD.nunc_dpto || '-' || OLD.nunc_municipio || '-' || OLD.nunc_entidad || '-' ||
                         OLD.nunc_unidad || '-' || OLD.nunc_anio || '-' || OLD.nunc_consecutivo,
      'nunc_nuevo',      NEW.nunc_dpto || '-' || NEW.nunc_municipio || '-' || NEW.nunc_entidad || '-' ||
                         NEW.nunc_unidad || '-' || NEW.nunc_anio || '-' || NEW.nunc_consecutivo
    ),
    OLD.placa, NEW.placa
  );
  RETURN NEW;
END;
$$;

-- ============================================================
-- Trigger: registro eliminado
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_nunc_registro_eliminado()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_codigo TEXT;
BEGIN
  SELECT codigo INTO v_codigo FROM public.nunc_sesiones WHERE id = OLD.sesion_id;
  PERFORM registrar_auditoria_nunc(
    OLD.sesion_id, OLD.id, 'nunc_registro_eliminado',
    jsonb_build_object(
      'origen',        'EXTERNO',
      'codigo_sesion',  v_codigo,
      'placa',          OLD.placa,
      'nunc',           OLD.nunc_dpto || '-' || OLD.nunc_municipio || '-' || OLD.nunc_entidad || '-' ||
                        OLD.nunc_unidad || '-' || OLD.nunc_anio || '-' || OLD.nunc_consecutivo
    ),
    OLD.placa, NULL
  );
  RETURN OLD;
END;
$$;
