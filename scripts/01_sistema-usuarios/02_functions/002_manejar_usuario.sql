CREATE OR REPLACE FUNCTION public.manejar_nuevo_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (id, correo, nombre_completo, rol_global)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'nombre_completo', ''),
    COALESCE(new.raw_user_meta_data ->> 'rol_global', 'usuario')
  );
  RETURN new;
END;
$$;
