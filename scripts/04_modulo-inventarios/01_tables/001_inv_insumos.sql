-- Catálogo maestro de insumos — compartido entre todos los módulos
-- Soporta dos modelos de tracking:
--   'ubicacion' → stock por bodega/grúa (inv_stock)
--   'rango'     → numeración secuencial, ej. stickers (inv_rangos)

CREATE TABLE IF NOT EXISTS public.inv_insumos (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre         text        NOT NULL,
  categoria      text        NOT NULL,
  unidad         text        NOT NULL,
  stock_minimo   int         NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
  tipo_tracking  text        NOT NULL DEFAULT 'ubicacion'
                             CHECK (tipo_tracking IN ('ubicacion', 'rango')),
  modulo         text        NOT NULL,
  activo         bool        NOT NULL DEFAULT true,
  creado_en      timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inv_insumos_modulo    ON public.inv_insumos(modulo);
CREATE INDEX IF NOT EXISTS idx_inv_insumos_categoria ON public.inv_insumos(categoria);
CREATE INDEX IF NOT EXISTS idx_inv_insumos_activo    ON public.inv_insumos(activo);

COMMENT ON TABLE  public.inv_insumos IS 'Catálogo maestro de insumos — compartido entre todos los módulos.';
COMMENT ON COLUMN public.inv_insumos.tipo_tracking IS 'ubicacion: stock por bodega/grúa. rango: numeración secuencial (ej. stickers).';
COMMENT ON COLUMN public.inv_insumos.modulo IS 'Módulo propietario: parqueadero, movilidad, etc.';
