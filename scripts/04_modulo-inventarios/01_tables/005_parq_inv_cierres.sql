-- Cierres de turno de inventario — específico de parqueadero
-- Un cierre por grúa por fecha. El detalle registra el consumo por ítem.

CREATE TABLE IF NOT EXISTS public.parq_inv_cierres (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id uuid        NOT NULL REFERENCES public.parq_vehiculos(id),
  fecha       date        NOT NULL DEFAULT current_date,
  creado_por  uuid        REFERENCES public.perfiles(id),
  creado_en   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vehiculo_id, fecha)
);

CREATE INDEX IF NOT EXISTS idx_parq_inv_cierres_vehiculo ON public.parq_inv_cierres(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_parq_inv_cierres_fecha    ON public.parq_inv_cierres(fecha DESC);

COMMENT ON TABLE  public.parq_inv_cierres IS 'Cierre de turno por grúa. Un registro por vehículo por fecha.';
COMMENT ON COLUMN public.parq_inv_cierres.vehiculo_id IS 'Grúa que reporta el cierre (parq_vehiculos tipo grua_plataforma).';

-- ── Detalle por ítem ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.parq_inv_cierres_detalle (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cierre_id          uuid NOT NULL REFERENCES public.parq_inv_cierres(id) ON DELETE CASCADE,
  item_id            uuid NOT NULL REFERENCES public.inv_insumos(id),
  cantidad_inicial   int  NOT NULL CHECK (cantidad_inicial   >= 0),
  cantidad_final     int  NOT NULL CHECK (cantidad_final     >= 0),
  cantidad_consumida int  GENERATED ALWAYS AS (cantidad_inicial - cantidad_final) STORED,
  UNIQUE (cierre_id, item_id),
  CHECK  (cantidad_final <= cantidad_inicial)
);

COMMENT ON TABLE  public.parq_inv_cierres_detalle IS 'Consumo por ítem en cada cierre de turno.';
COMMENT ON COLUMN public.parq_inv_cierres_detalle.cantidad_consumida IS 'Calculado automáticamente: inicial - final. No editable.';
