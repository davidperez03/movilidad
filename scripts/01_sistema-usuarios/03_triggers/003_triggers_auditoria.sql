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

-- Hash chain: asigna hash_anterior y hash_registro en cada INSERT
DROP TRIGGER IF EXISTS trg_auditoria_hash_chain ON public.sys_auditoria;
CREATE TRIGGER trg_auditoria_hash_chain
  BEFORE INSERT ON public.sys_auditoria
  FOR EACH ROW EXECUTE FUNCTION _auditoria_asignar_hash();

-- Inmutabilidad: bloquea UPDATE y DELETE en registros de auditoría
DROP TRIGGER IF EXISTS trg_no_update_auditoria ON public.sys_auditoria;
CREATE TRIGGER trg_no_update_auditoria
  BEFORE UPDATE ON public.sys_auditoria
  FOR EACH ROW EXECUTE FUNCTION _auditoria_inmutable();

DROP TRIGGER IF EXISTS trg_no_delete_auditoria ON public.sys_auditoria;
CREATE TRIGGER trg_no_delete_auditoria
  BEFORE DELETE ON public.sys_auditoria
  FOR EACH ROW EXECUTE FUNCTION _auditoria_inmutable();
