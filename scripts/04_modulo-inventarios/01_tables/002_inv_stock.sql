-- Stock por ubicación física para ítems de tipo_tracking = 'ubicacion'
-- ubicacion: literal 'bodega' o UUID del vehículo/grúa casteado a text

CREATE TABLE IF NOT EXISTS public.inv_stock (
  item_id    uuid        NOT NULL REFERENCES public.inv_insumos(id) ON DELETE CASCADE,
  modulo     text        NOT NULL,
  ubicacion  text        NOT NULL,
  cantidad   int         NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (item_id, modulo, ubicacion)
);

CREATE INDEX IF NOT EXISTS idx_inv_stock_item   ON public.inv_stock(item_id);
CREATE INDEX IF NOT EXISTS idx_inv_stock_modulo ON public.inv_stock(modulo);

COMMENT ON TABLE  public.inv_stock IS 'Stock por ubicación física (bodega o vehículo) para ítems tipo ubicacion.';
COMMENT ON COLUMN public.inv_stock.ubicacion IS 'Literal "bodega" o UUID del vehículo/grúa casteado a text.';
