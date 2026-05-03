-- Hash chain e inmutabilidad para inv_movimientos
-- Garantiza no repudio criptográfico en el log de inventarios.

DROP TRIGGER IF EXISTS trg_inv_movimientos_hash ON public.inv_movimientos;
CREATE TRIGGER trg_inv_movimientos_hash
  BEFORE INSERT ON public.inv_movimientos
  FOR EACH ROW EXECUTE FUNCTION _inv_movimientos_asignar_hash();

DROP TRIGGER IF EXISTS trg_no_update_inv_movimientos ON public.inv_movimientos;
CREATE TRIGGER trg_no_update_inv_movimientos
  BEFORE UPDATE ON public.inv_movimientos
  FOR EACH ROW EXECUTE FUNCTION _inv_movimientos_inmutable();

DROP TRIGGER IF EXISTS trg_no_delete_inv_movimientos ON public.inv_movimientos;
CREATE TRIGGER trg_no_delete_inv_movimientos
  BEFORE DELETE ON public.inv_movimientos
  FOR EACH ROW EXECUTE FUNCTION _inv_movimientos_inmutable();
