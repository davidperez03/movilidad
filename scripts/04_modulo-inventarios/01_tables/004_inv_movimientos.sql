-- Log inmutable de movimientos de inventario
-- tipo ingreso:  origen NULL, destino = ubicación que recibe
-- tipo traslado: origen y destino ambos presentes

CREATE TABLE IF NOT EXISTS public.inv_movimientos (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id    uuid        NOT NULL REFERENCES public.inv_insumos(id),
  modulo     text        NOT NULL,
  tipo       text        NOT NULL CHECK (tipo IN ('ingreso', 'traslado')),
  origen     text,                                -- NULL en tipo=ingreso
  destino    text        NOT NULL,
  cantidad   int         NOT NULL CHECK (cantidad > 0),
  notas      text,
  creado_por uuid        REFERENCES public.perfiles(id),
  creado_en  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inv_movimientos_item   ON public.inv_movimientos(item_id);
CREATE INDEX IF NOT EXISTS idx_inv_movimientos_modulo ON public.inv_movimientos(modulo);
CREATE INDEX IF NOT EXISTS idx_inv_movimientos_fecha  ON public.inv_movimientos(creado_en DESC);

COMMENT ON TABLE public.inv_movimientos IS 'Log inmutable de ingresos y traslados. No se modifica ni elimina.';
