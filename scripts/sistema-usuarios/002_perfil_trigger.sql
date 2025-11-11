-- ============================================================================
-- SISTEMA DE USUARIOS - TRIGGER DE CREACIÓN DE PERFIL
-- Trigger automático al registrarse un nuevo usuario en Supabase Auth
-- ============================================================================

-- Función para manejar la creación de nuevos usuarios
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

-- Trigger para crear automáticamente el perfil al registrarse un usuario
DROP TRIGGER IF EXISTS al_crear_usuario_auth ON auth.users;

CREATE TRIGGER al_crear_usuario_auth
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.manejar_nuevo_usuario();

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
