-- Hash chain e inmutabilidad para mov_historial_acciones
-- Garantiza no repudio criptográfico en el log de movilidad.

-- Hash chain: asigna hash_anterior y hash_registro en cada INSERT
DROP TRIGGER IF EXISTS trg_mov_historial_hash ON public.mov_historial_acciones;
CREATE TRIGGER trg_mov_historial_hash
  BEFORE INSERT ON public.mov_historial_acciones
  FOR EACH ROW EXECUTE FUNCTION _mov_historial_asignar_hash();

-- Inmutabilidad: bloquea UPDATE y DELETE
DROP TRIGGER IF EXISTS trg_no_update_mov_historial ON public.mov_historial_acciones;
CREATE TRIGGER trg_no_update_mov_historial
  BEFORE UPDATE ON public.mov_historial_acciones
  FOR EACH ROW EXECUTE FUNCTION _mov_historial_inmutable();

DROP TRIGGER IF EXISTS trg_no_delete_mov_historial ON public.mov_historial_acciones;
CREATE TRIGGER trg_no_delete_mov_historial
  BEFORE DELETE ON public.mov_historial_acciones
  FOR EACH ROW EXECUTE FUNCTION _mov_historial_inmutable();
