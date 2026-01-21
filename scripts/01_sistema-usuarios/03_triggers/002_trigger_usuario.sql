DROP TRIGGER IF EXISTS al_crear_usuario_auth ON auth.users;

CREATE TRIGGER al_crear_usuario_auth
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.manejar_nuevo_usuario();
