-- Hash chain e inmutabilidad para parq_historial_acciones
-- Garantiza no repudio criptográfico en el log de parqueadero.

DROP TRIGGER IF EXISTS trg_parq_historial_hash ON public.parq_historial_acciones;
CREATE TRIGGER trg_parq_historial_hash
  BEFORE INSERT ON public.parq_historial_acciones
  FOR EACH ROW EXECUTE FUNCTION _parq_historial_asignar_hash();

DROP TRIGGER IF EXISTS trg_no_update_parq_historial ON public.parq_historial_acciones;
CREATE TRIGGER trg_no_update_parq_historial
  BEFORE UPDATE ON public.parq_historial_acciones
  FOR EACH ROW EXECUTE FUNCTION _parq_historial_inmutable();

DROP TRIGGER IF EXISTS trg_no_delete_parq_historial ON public.parq_historial_acciones;
CREATE TRIGGER trg_no_delete_parq_historial
  BEFORE DELETE ON public.parq_historial_acciones
  FOR EACH ROW EXECUTE FUNCTION _parq_historial_inmutable();
