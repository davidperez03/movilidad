-- Migración 010: RLS para módulo de inventarios
-- Habilita Row Level Security en las tablas inv_* y parq_inv_*
-- con políticas consistentes con el resto del sistema.
--
-- Versión: v1.17.0
-- Fecha: 2026-04-17

BEGIN;

-- ── inv_insumos ───────────────────────────────────────────────────────────────

ALTER TABLE public.inv_insumos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inv_insumos_select" ON public.inv_insumos;
DROP POLICY IF EXISTS "inv_insumos_insert" ON public.inv_insumos;
DROP POLICY IF EXISTS "inv_insumos_update" ON public.inv_insumos;
DROP POLICY IF EXISTS "inv_insumos_delete" ON public.inv_insumos;

CREATE POLICY "inv_insumos_select" ON public.inv_insumos
  FOR SELECT USING (
    public.es_superadmin(auth.uid())
    OR public.tiene_acceso_modulo(auth.uid(), modulo)
  );

CREATE POLICY "inv_insumos_insert" ON public.inv_insumos
  FOR INSERT WITH CHECK (public.es_superadmin(auth.uid()));

CREATE POLICY "inv_insumos_update" ON public.inv_insumos
  FOR UPDATE USING (public.es_superadmin(auth.uid()));

CREATE POLICY "inv_insumos_delete" ON public.inv_insumos
  FOR DELETE USING (public.es_superadmin(auth.uid()));

-- ── inv_stock ─────────────────────────────────────────────────────────────────

ALTER TABLE public.inv_stock ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inv_stock_select" ON public.inv_stock;
DROP POLICY IF EXISTS "inv_stock_insert" ON public.inv_stock;
DROP POLICY IF EXISTS "inv_stock_update" ON public.inv_stock;
DROP POLICY IF EXISTS "inv_stock_delete" ON public.inv_stock;

CREATE POLICY "inv_stock_select" ON public.inv_stock
  FOR SELECT USING (
    public.es_superadmin(auth.uid())
    OR public.tiene_acceso_modulo(auth.uid(), modulo)
  );

CREATE POLICY "inv_stock_insert" ON public.inv_stock
  FOR INSERT WITH CHECK (
    public.es_superadmin(auth.uid())
    OR public.tiene_permiso(auth.uid(), modulo, 'gestionar_inventario')
  );

CREATE POLICY "inv_stock_update" ON public.inv_stock
  FOR UPDATE USING (
    public.es_superadmin(auth.uid())
    OR public.tiene_permiso(auth.uid(), modulo, 'gestionar_inventario')
  );

CREATE POLICY "inv_stock_delete" ON public.inv_stock
  FOR DELETE USING (public.es_superadmin(auth.uid()));

-- ── inv_rangos ────────────────────────────────────────────────────────────────

ALTER TABLE public.inv_rangos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inv_rangos_select" ON public.inv_rangos;
DROP POLICY IF EXISTS "inv_rangos_insert" ON public.inv_rangos;
DROP POLICY IF EXISTS "inv_rangos_update" ON public.inv_rangos;

CREATE POLICY "inv_rangos_select" ON public.inv_rangos
  FOR SELECT USING (
    public.es_superadmin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.inv_insumos i
      WHERE  i.id = item_id
      AND    public.tiene_acceso_modulo(auth.uid(), i.modulo)
    )
  );

CREATE POLICY "inv_rangos_insert" ON public.inv_rangos
  FOR INSERT WITH CHECK (public.es_superadmin(auth.uid()));

CREATE POLICY "inv_rangos_update" ON public.inv_rangos
  FOR UPDATE USING (
    public.es_superadmin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.inv_insumos i
      WHERE  i.id = item_id
      AND    public.tiene_permiso(auth.uid(), i.modulo, 'gestionar_inventario')
    )
  );

-- ── inv_movimientos ───────────────────────────────────────────────────────────

ALTER TABLE public.inv_movimientos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inv_movimientos_select" ON public.inv_movimientos;
DROP POLICY IF EXISTS "inv_movimientos_insert" ON public.inv_movimientos;

CREATE POLICY "inv_movimientos_select" ON public.inv_movimientos
  FOR SELECT USING (
    public.es_superadmin(auth.uid())
    OR public.tiene_acceso_modulo(auth.uid(), modulo)
  );

CREATE POLICY "inv_movimientos_insert" ON public.inv_movimientos
  FOR INSERT WITH CHECK (
    public.es_superadmin(auth.uid())
    OR public.tiene_permiso(auth.uid(), modulo, 'gestionar_inventario')
  );

-- ── parq_inv_cierres ──────────────────────────────────────────────────────────

ALTER TABLE public.parq_inv_cierres ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parq_inv_cierres_select" ON public.parq_inv_cierres;
DROP POLICY IF EXISTS "parq_inv_cierres_insert" ON public.parq_inv_cierres;

CREATE POLICY "parq_inv_cierres_select" ON public.parq_inv_cierres
  FOR SELECT USING (
    public.es_superadmin(auth.uid())
    OR public.tiene_acceso_modulo(auth.uid(), 'parqueadero')
  );

CREATE POLICY "parq_inv_cierres_insert" ON public.parq_inv_cierres
  FOR INSERT WITH CHECK (
    public.es_superadmin(auth.uid())
    OR public.tiene_permiso(auth.uid(), 'parqueadero', 'gestionar_inventario')
  );

-- ── parq_inv_cierres_detalle ──────────────────────────────────────────────────

ALTER TABLE public.parq_inv_cierres_detalle ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parq_inv_cierres_detalle_select" ON public.parq_inv_cierres_detalle;
DROP POLICY IF EXISTS "parq_inv_cierres_detalle_insert" ON public.parq_inv_cierres_detalle;

CREATE POLICY "parq_inv_cierres_detalle_select" ON public.parq_inv_cierres_detalle
  FOR SELECT USING (
    public.es_superadmin(auth.uid())
    OR public.tiene_acceso_modulo(auth.uid(), 'parqueadero')
  );

CREATE POLICY "parq_inv_cierres_detalle_insert" ON public.parq_inv_cierres_detalle
  FOR INSERT WITH CHECK (
    public.es_superadmin(auth.uid())
    OR public.tiene_permiso(auth.uid(), 'parqueadero', 'gestionar_inventario')
  );

COMMIT;

-- ROLLBACK:
-- BEGIN;
-- ALTER TABLE public.parq_inv_cierres_detalle DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.parq_inv_cierres         DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.inv_movimientos          DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.inv_rangos               DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.inv_stock                DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.inv_insumos              DISABLE ROW LEVEL SECURITY;
-- COMMIT;
