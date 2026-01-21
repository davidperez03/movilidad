CREATE OR REPLACE FUNCTION actualizar_timestamp_perfiles()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION actualizar_timestamp_modulos()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION actualizar_timestamp_roles_modulo()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_actualizar_timestamp_sesiones()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION actualizar_timestamp_perfiles() IS
  'Trigger function que actualiza automáticamente el campo actualizado_en al modificar un perfil';

COMMENT ON FUNCTION actualizar_timestamp_modulos() IS
  'Trigger function que actualiza automáticamente el campo actualizado_en al modificar un módulo';

COMMENT ON FUNCTION actualizar_timestamp_roles_modulo() IS
  'Trigger function que actualiza automáticamente el campo actualizado_en al modificar un rol';

COMMENT ON FUNCTION trigger_actualizar_timestamp_sesiones() IS
  'Trigger function que actualiza automáticamente el campo actualizado_en al modificar una sesión';
