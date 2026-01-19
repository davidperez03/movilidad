CREATE OR REPLACE FUNCTION actualizar_timestamp_perfiles()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION actualizar_timestamp_modulos()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION actualizar_timestamp_roles_modulo()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_actualizar_timestamp_sesiones()
RETURNS TRIGGER
LANGUAGE plpgsql
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
