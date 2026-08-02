-- Migración 034: Corregir trigger de auditoría de inspecciones
-- Elimina referencia a NEW.turno en trigger_parq_inspeccion_creada.
-- La columna turno fue eliminada de parq_inspecciones en migración 031
-- pero el trigger no fue actualizado, causando error 400 en todos los
-- INSERTs a parq_inspecciones (SQLSTATE 42703: undefined_column).

CREATE OR REPLACE FUNCTION trigger_parq_inspeccion_creada()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_placa    TEXT;
  v_operador TEXT;
  v_inspector TEXT;
BEGIN
  SELECT placa INTO v_placa FROM public.parq_vehiculos WHERE id = NEW.vehiculo_id;
  SELECT nombre_completo INTO v_operador FROM public.perfiles WHERE id = NEW.operador_id;
  SELECT nombre_completo INTO v_inspector FROM public.perfiles WHERE id = NEW.inspector_id;

  PERFORM registrar_auditoria_parqueadero(
    NEW.vehiculo_id,
    NEW.id,
    'parq_inspeccion_creada',
    jsonb_build_object(
      'placa',        v_placa,
      'consecutivo',  NEW.consecutivo,
      'fecha',        NEW.fecha,
      'es_apto',      NEW.es_apto,
      'operador',     v_operador,
      'inspector',    v_inspector
    ),
    NULL,
    CASE WHEN NEW.es_apto THEN 'apto' ELSE 'no_apto' END,
    NEW.creado_por
  );
  RETURN NEW;
END;
$$;

-- ROLLBACK:
-- Recrear con referencia a turno solo si la columna aún existe:
-- CREATE OR REPLACE FUNCTION trigger_parq_inspeccion_creada() ... 'turno', NEW.turno ...
