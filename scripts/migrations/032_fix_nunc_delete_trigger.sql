-- Fix: trigger_nunc_registro_eliminado pasaba OLD.id como registro_id,
-- pero ese ID ya no existe en nunc_registros al momento del INSERT en
-- nunc_historial_acciones (AFTER DELETE), causando una FK violation.
-- Solución: pasar NULL como registro_id y guardar el ID en detalles.

CREATE OR REPLACE FUNCTION trigger_nunc_registro_eliminado()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_codigo TEXT;
BEGIN
  SELECT codigo INTO v_codigo FROM public.nunc_sesiones WHERE id = OLD.sesion_id;
  PERFORM registrar_auditoria_nunc(
    OLD.sesion_id,
    NULL,  -- NULL: el registro ya no existe, no se puede referenciar por FK
    'nunc_registro_eliminado',
    jsonb_build_object(
      'registro_id',    OLD.id,
      'origen',         'EXTERNO',
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
