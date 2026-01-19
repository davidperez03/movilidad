DROP TRIGGER IF EXISTS trigger_actualizar_perfiles ON public.perfiles;
CREATE TRIGGER trigger_actualizar_perfiles
  BEFORE UPDATE ON public.perfiles
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp_perfiles();

DROP TRIGGER IF EXISTS trigger_actualizar_modulos ON public.modulos;
CREATE TRIGGER trigger_actualizar_modulos
  BEFORE UPDATE ON public.modulos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp_modulos();

DROP TRIGGER IF EXISTS trigger_actualizar_roles_modulo ON public.roles_modulo;
CREATE TRIGGER trigger_actualizar_roles_modulo
  BEFORE UPDATE ON public.roles_modulo
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp_roles_modulo();

DROP TRIGGER IF EXISTS trigger_actualizar_sesiones ON public.sys_sesiones;
CREATE TRIGGER trigger_actualizar_sesiones
  BEFORE UPDATE ON public.sys_sesiones
  FOR EACH ROW
  EXECUTE FUNCTION trigger_actualizar_timestamp_sesiones();
