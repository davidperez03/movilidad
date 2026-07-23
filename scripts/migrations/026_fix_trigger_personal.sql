-- Fix: orden de parámetros y nombres de acción incorrectos en trigger_parq_personal_actualizado
-- Aplica este script si la migración 026 ya fue ejecutada.

-- 1. Agregar 'parq_personal_creado' al check constraint
ALTER TABLE public.parq_historial_acciones
  DROP CONSTRAINT IF EXISTS parq_historial_acciones_accion_check;

ALTER TABLE public.parq_historial_acciones
  ADD CONSTRAINT parq_historial_acciones_accion_check CHECK (accion IN (
    'parq_vehiculo_creado',
    'parq_vehiculo_editado',
    'parq_vehiculo_activado',
    'parq_vehiculo_desactivado',
    'parq_inspeccion_creada',
    'parq_novedad_subsanada',
    'parq_personal_actualizado',
    'parq_personal_creado'
  ));

-- 2. Recrear el trigger con parámetros y nombres de acción correctos
CREATE OR REPLACE FUNCTION public.trigger_parq_personal_actualizado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nombre text;
  v_correo text;
  v_detalles jsonb := '{}'::jsonb;
BEGIN
  SELECT nombre_completo, correo INTO v_nombre, v_correo
  FROM public.perfiles WHERE id = new.perfil_id;

  IF (TG_OP = 'INSERT') THEN
    v_detalles := jsonb_build_object(
      'nombre',                v_nombre,
      'correo',                v_correo,
      'licencia_numero',       new.licencia_numero,
      'licencia_categoria',    new.licencia_categoria,
      'licencia_vencimiento',  new.licencia_vencimiento
    );
  ELSE
    v_detalles := jsonb_build_object('nombre', v_nombre, 'correo', v_correo);

    IF old.licencia_numero IS DISTINCT FROM new.licencia_numero THEN
      v_detalles := v_detalles || jsonb_build_object('licencia_numero_anterior', old.licencia_numero, 'licencia_numero_nueva', new.licencia_numero);
    END IF;
    IF old.licencia_categoria IS DISTINCT FROM new.licencia_categoria THEN
      v_detalles := v_detalles || jsonb_build_object('licencia_categoria_anterior', old.licencia_categoria, 'licencia_categoria_nueva', new.licencia_categoria);
    END IF;
    IF old.licencia_vencimiento IS DISTINCT FROM new.licencia_vencimiento THEN
      v_detalles := v_detalles || jsonb_build_object('licencia_vencimiento_anterior', old.licencia_vencimiento, 'licencia_vencimiento_nueva', new.licencia_vencimiento);
    END IF;
  END IF;

  PERFORM registrar_auditoria_parqueadero(
    NULL,          -- p_vehiculo_id
    NULL,          -- p_inspeccion_id
    CASE WHEN TG_OP = 'INSERT' THEN 'parq_personal_creado' ELSE 'parq_personal_actualizado' END,
    v_detalles,    -- p_detalles
    NULL,          -- p_valor_anterior
    NULL,          -- p_valor_nuevo
    new.perfil_id  -- p_realizado_por
  );

  RETURN new;
END;
$$;

-- 3. Crear el trigger en la tabla si no existe
DROP TRIGGER IF EXISTS trg_parq_personal_actualizado ON public.parq_datos_personal;

CREATE TRIGGER trg_parq_personal_actualizado
  AFTER INSERT OR UPDATE ON public.parq_datos_personal
  FOR EACH ROW
  EXECUTE FUNCTION trigger_parq_personal_actualizado();
