CREATE OR REPLACE FUNCTION public.manejar_nuevo_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  es_pendiente BOOLEAN;
BEGIN
  -- Si viene con pendiente_aprobacion, crear como inactivo
  es_pendiente := COALESCE((new.raw_user_meta_data ->> 'pendiente_aprobacion')::boolean, false);

  INSERT INTO public.perfiles (id, correo, nombre_completo, rol_global, activo)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'nombre_completo', ''),
    COALESCE(new.raw_user_meta_data ->> 'rol_global', 'usuario'),
    NOT es_pendiente
  );
  RETURN new;
END;
$$;
