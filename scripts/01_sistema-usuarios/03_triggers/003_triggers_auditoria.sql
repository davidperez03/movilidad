DROP TRIGGER IF EXISTS trigger_auditoria_perfiles ON public.perfiles;

CREATE TRIGGER trigger_auditoria_perfiles
  AFTER INSERT OR UPDATE OR DELETE ON public.perfiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auditoria_perfiles();

DROP TRIGGER IF EXISTS trigger_auditoria_usuarios_roles ON public.usuarios_roles;

CREATE TRIGGER trigger_auditoria_usuarios_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.usuarios_roles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auditoria_usuarios_roles();

DROP TRIGGER IF EXISTS trigger_auditoria_modulos ON public.modulos;

CREATE TRIGGER trigger_auditoria_modulos
  AFTER UPDATE ON public.modulos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_fn_auditoria_modulos();
