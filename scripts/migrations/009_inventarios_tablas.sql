-- Migración 009: Módulo de inventarios — tablas y datos iniciales
-- Crea el sistema de inventarios compartido entre módulos:
--   inv_insumos, inv_stock, inv_rangos, inv_movimientos (tablas globales)
--   parq_inv_cierres, parq_inv_cierres_detalle (específicas de parqueadero)
-- Inserta los 4 insumos iniciales del módulo parqueadero.
--
-- Versión: v1.17.0
-- Fecha: 2026-04-17

BEGIN;

-- ── 1. Catálogo maestro de insumos ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.inv_insumos (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre         text        NOT NULL,
  categoria      text        NOT NULL,
  unidad         text        NOT NULL,                          -- 'hoja', 'und', etc.
  stock_minimo   int         NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
  tipo_tracking  text        NOT NULL DEFAULT 'ubicacion'
                             CHECK (tipo_tracking IN ('ubicacion', 'rango')),
  modulo         text        NOT NULL,                          -- 'parqueadero' | 'movilidad' | ...
  activo         bool        NOT NULL DEFAULT true,
  creado_en      timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inv_insumos_modulo   ON public.inv_insumos(modulo);
CREATE INDEX IF NOT EXISTS idx_inv_insumos_categoria ON public.inv_insumos(categoria);

COMMENT ON TABLE  public.inv_insumos IS 'Catálogo maestro de insumos — compartido entre todos los módulos.';
COMMENT ON COLUMN public.inv_insumos.tipo_tracking IS 'ubicacion: stock por bodega/grúa. rango: numeración secuencial (ej. stickers).';
COMMENT ON COLUMN public.inv_insumos.modulo IS 'Módulo propietario del insumo. Puede extenderse a otros módulos.';

-- ── 2. Stock por ubicación ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.inv_stock (
  item_id    uuid        NOT NULL REFERENCES public.inv_insumos(id) ON DELETE CASCADE,
  modulo     text        NOT NULL,
  ubicacion  text        NOT NULL,                              -- 'bodega' | vehiculo_id::text
  cantidad   int         NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (item_id, modulo, ubicacion)
);

CREATE INDEX IF NOT EXISTS idx_inv_stock_item    ON public.inv_stock(item_id);
CREATE INDEX IF NOT EXISTS idx_inv_stock_modulo  ON public.inv_stock(modulo);

COMMENT ON TABLE  public.inv_stock IS 'Stock por ubicación física (bodega o vehículo) para ítems de tipo tracking = ubicacion.';
COMMENT ON COLUMN public.inv_stock.ubicacion IS 'Literal "bodega" o UUID del vehículo/grúa casteado a text.';

-- ── 3. Rangos numéricos ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.inv_rangos (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      uuid        NOT NULL UNIQUE REFERENCES public.inv_insumos(id) ON DELETE CASCADE,
  rango_inicio int         NOT NULL CHECK (rango_inicio >= 0),
  rango_fin    int         NOT NULL,
  usados       int         NOT NULL DEFAULT 0 CHECK (usados >= 0),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   uuid        REFERENCES public.perfiles(id),
  CHECK (rango_fin >= rango_inicio),
  CHECK (usados   <= rango_fin)
);

COMMENT ON TABLE  public.inv_rangos IS 'Control de rangos numéricos para ítems de tipo tracking = rango (ej. stickers numerados).';
COMMENT ON COLUMN public.inv_rangos.usados IS 'Último número de sticker/etiqueta usado. Solo puede incrementar — nunca retroceder.';

-- ── 4. Log de movimientos ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.inv_movimientos (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id    uuid        NOT NULL REFERENCES public.inv_insumos(id),
  modulo     text        NOT NULL,
  tipo       text        NOT NULL CHECK (tipo IN ('ingreso', 'traslado')),
  origen     text,                                              -- NULL en tipo=ingreso
  destino    text        NOT NULL,
  cantidad   int         NOT NULL CHECK (cantidad > 0),
  notas      text,
  creado_por uuid        REFERENCES public.perfiles(id),
  creado_en  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inv_movimientos_item   ON public.inv_movimientos(item_id);
CREATE INDEX IF NOT EXISTS idx_inv_movimientos_modulo ON public.inv_movimientos(modulo);
CREATE INDEX IF NOT EXISTS idx_inv_movimientos_fecha  ON public.inv_movimientos(creado_en DESC);

COMMENT ON TABLE public.inv_movimientos IS 'Log inmutable de ingresos y traslados de insumos. No se modifica ni elimina.';

-- ── 5. Cierres de turno — parqueadero ────────────────────────────────────────

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

-- ── 6. Detalle de cierre de turno ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.parq_inv_cierres_detalle (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cierre_id          uuid NOT NULL REFERENCES public.parq_inv_cierres(id) ON DELETE CASCADE,
  item_id            uuid NOT NULL REFERENCES public.inv_insumos(id),
  cantidad_inicial   int  NOT NULL CHECK (cantidad_inicial   >= 0),
  cantidad_final     int  NOT NULL CHECK (cantidad_final     >= 0),
  cantidad_consumida int  GENERATED ALWAYS AS (cantidad_inicial - cantidad_final) STORED,
  UNIQUE (cierre_id, item_id),
  CHECK (cantidad_final <= cantidad_inicial)
);

COMMENT ON TABLE  public.parq_inv_cierres_detalle IS 'Detalle de consumo por ítem en cada cierre de turno.';
COMMENT ON COLUMN public.parq_inv_cierres_detalle.cantidad_consumida IS 'Calculado automáticamente: inicial - final. No editable.';

-- ── 7. Datos iniciales — insumos parqueadero ─────────────────────────────────

INSERT INTO public.inv_insumos (nombre, categoria, unidad, stock_minimo, tipo_tracking, modulo)
VALUES
  ('Libreta Carro',         'libretas', 'hoja', 200, 'ubicacion', 'parqueadero'),
  ('Libreta Moto',          'libretas', 'hoja', 200, 'ubicacion', 'parqueadero'),
  ('Sello de Seguridad',    'sellos',   'und',  300, 'ubicacion', 'parqueadero'),
  ('Sticker de Inventario', 'stickers', 'und',  200, 'rango',     'parqueadero')
ON CONFLICT DO NOTHING;

-- Stock inicial en bodega para los 3 ítems de tipo ubicacion
-- (el sticker se configura en inv_rangos directamente)
INSERT INTO public.inv_stock (item_id, modulo, ubicacion, cantidad)
SELECT id, 'parqueadero', 'bodega', 0
FROM   public.inv_insumos
WHERE  modulo         = 'parqueadero'
AND    tipo_tracking  = 'ubicacion'
ON CONFLICT DO NOTHING;

COMMIT;

-- ROLLBACK:
-- BEGIN;
-- DELETE FROM public.inv_insumos WHERE modulo = 'parqueadero';
-- DROP TABLE IF EXISTS public.parq_inv_cierres_detalle;
-- DROP TABLE IF EXISTS public.parq_inv_cierres;
-- DROP TABLE IF EXISTS public.inv_movimientos;
-- DROP TABLE IF EXISTS public.inv_rangos;
-- DROP TABLE IF EXISTS public.inv_stock;
-- DROP TABLE IF EXISTS public.inv_insumos;
-- COMMIT;
