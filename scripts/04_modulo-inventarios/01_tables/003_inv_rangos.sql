-- Rangos numéricos para ítems de tipo_tracking = 'rango'
-- Una fila por ítem. El campo usados solo puede incrementar — nunca retroceder.
-- Esa restricción se enforcea en la aplicación y en la política de UPDATE.

CREATE TABLE IF NOT EXISTS public.inv_rangos (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      uuid        NOT NULL UNIQUE REFERENCES public.inv_insumos(id) ON DELETE CASCADE,
  rango_inicio int         NOT NULL CHECK (rango_inicio >= 0),
  rango_fin    int         NOT NULL,
  usados       int         NOT NULL DEFAULT 0 CHECK (usados >= 0),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   uuid        REFERENCES public.perfiles(id),
  CHECK (rango_fin >= rango_inicio),
  CHECK (usados    <= rango_fin)
);

COMMENT ON TABLE  public.inv_rangos IS 'Control de rangos numéricos para ítems tipo rango (ej. stickers numerados).';
COMMENT ON COLUMN public.inv_rangos.usados IS 'Último número usado. Solo puede incrementar — nunca retroceder.';
COMMENT ON COLUMN public.inv_rangos.rango_fin IS 'Último número habilitado/impreso. Se amplía cuando llega nuevo lote.';
