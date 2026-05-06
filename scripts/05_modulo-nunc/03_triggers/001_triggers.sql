-- Hash chain e inmutabilidad
DROP TRIGGER IF EXISTS trg_nunc_historial_hash ON public.nunc_historial_acciones;
CREATE TRIGGER trg_nunc_historial_hash
  BEFORE INSERT ON public.nunc_historial_acciones
  FOR EACH ROW EXECUTE FUNCTION _nunc_historial_asignar_hash();

DROP TRIGGER IF EXISTS trg_no_update_nunc_historial ON public.nunc_historial_acciones;
CREATE TRIGGER trg_no_update_nunc_historial
  BEFORE UPDATE ON public.nunc_historial_acciones
  FOR EACH ROW EXECUTE FUNCTION _nunc_historial_inmutable();

DROP TRIGGER IF EXISTS trg_no_delete_nunc_historial ON public.nunc_historial_acciones;
CREATE TRIGGER trg_no_delete_nunc_historial
  BEFORE DELETE ON public.nunc_historial_acciones
  FOR EACH ROW EXECUTE FUNCTION _nunc_historial_inmutable();

-- Auditoría de sesiones y registros
DROP TRIGGER IF EXISTS trg_nunc_sesion_creada ON public.nunc_sesiones;
CREATE TRIGGER trg_nunc_sesion_creada
  AFTER INSERT ON public.nunc_sesiones
  FOR EACH ROW EXECUTE FUNCTION trigger_nunc_sesion_creada();

DROP TRIGGER IF EXISTS trg_nunc_sesion_estado ON public.nunc_sesiones;
CREATE TRIGGER trg_nunc_sesion_estado
  AFTER UPDATE ON public.nunc_sesiones
  FOR EACH ROW EXECUTE FUNCTION trigger_nunc_sesion_estado();

DROP TRIGGER IF EXISTS trg_nunc_registro_creado ON public.nunc_registros;
CREATE TRIGGER trg_nunc_registro_creado
  AFTER INSERT ON public.nunc_registros
  FOR EACH ROW EXECUTE FUNCTION trigger_nunc_registro_creado();

DROP TRIGGER IF EXISTS trg_nunc_registro_editado ON public.nunc_registros;
CREATE TRIGGER trg_nunc_registro_editado
  AFTER UPDATE ON public.nunc_registros
  FOR EACH ROW EXECUTE FUNCTION trigger_nunc_registro_editado();

DROP TRIGGER IF EXISTS trg_nunc_registro_eliminado ON public.nunc_registros;
CREATE TRIGGER trg_nunc_registro_eliminado
  AFTER DELETE ON public.nunc_registros
  FOR EACH ROW EXECUTE FUNCTION trigger_nunc_registro_eliminado();
