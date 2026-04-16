-- Migración 007: Agregar trigger de auditoría para tabla modulos
-- Los eventos 'modulo_activado' y 'modulo_desactivado' existían en el enum de sys_auditoria
-- pero nunca se disparaban porque no había trigger en la tabla modulos.
--
-- Versión: v1.16.0
-- Fecha: 2026-04-16

BEGIN;

CREATE OR REPLACE FUNCTION public.trigger_fn_auditoria_modulos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.activo IS DISTINCT FROM NEW.activo) THEN
    PERFORM public.registrar_auditoria_sistema(
      CASE WHEN NEW.activo THEN 'modulo_activado' ELSE 'modulo_desactivado' END,
      'modulo',
      NULL, -- modulos.id es TEXT, no UUID — se registra en detalles
      jsonb_build_object(
        'modulo_id', NEW.id,
        'nombre', NEW.nombre,
        'activo_anterior', OLD.activo,
        'activo_nuevo', NEW.activo
      ),
      OLD.activo::text,
      NEW.activo::text
    );
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.trigger_fn_auditoria_modulos IS
  'Registra en auditoría cuando un módulo es activado o desactivado.';

DROP TRIGGER IF EXISTS trigger_auditoria_modulos ON public.modulos;

CREATE TRIGGER trigger_auditoria_modulos
  AFTER UPDATE ON public.modulos
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_fn_auditoria_modulos();

COMMIT;

-- ROLLBACK:
-- BEGIN;
-- DROP TRIGGER IF EXISTS trigger_auditoria_modulos ON public.modulos;
-- DROP FUNCTION IF EXISTS public.trigger_fn_auditoria_modulos();
-- COMMIT;
