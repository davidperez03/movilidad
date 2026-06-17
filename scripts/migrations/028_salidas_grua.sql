-- ============================================================
-- Migration 028: Registro de salidas y regresos de gruas por QR
-- ============================================================

CREATE TABLE IF NOT EXISTS public.parq_salidas_grua (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  vehiculo_id      uuid        NOT NULL REFERENCES public.parq_vehiculos(id) ON DELETE CASCADE,
  operador_id      uuid        REFERENCES public.perfiles(id) ON DELETE SET NULL,
  hora_salida      timestamptz NOT NULL DEFAULT now(),
  hora_regreso     timestamptz,
  motivo           text        NOT NULL CHECK (motivo IN (
                     'requerimiento_agentes', 'requerimiento_polca',
                     'mantenimiento', 'tanqueo', 'autorizacion', 'otros'
                   )),
  trae_carga       boolean     NOT NULL DEFAULT false,
  inventario_items jsonb       NOT NULL DEFAULT '[]'::jsonb,
  observaciones    text,
  registrado_por   uuid        REFERENCES public.perfiles(id) ON DELETE SET NULL,
  creado_en        timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_parq_salidas_grua_vehiculo  ON public.parq_salidas_grua(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_parq_salidas_grua_salida    ON public.parq_salidas_grua(hora_salida DESC);
CREATE INDEX IF NOT EXISTS idx_parq_salidas_grua_en_calle  ON public.parq_salidas_grua(vehiculo_id, hora_regreso) WHERE hora_regreso IS NULL;

COMMENT ON TABLE  public.parq_salidas_grua IS 'Registro de salidas y regresos de gruas. Escaneado por el operador via QR estatico por vehiculo.';
COMMENT ON COLUMN public.parq_salidas_grua.inventario_items IS '[{item_id, nombre, cantidad, unidad}] — snapshot del inventario que lleva la grua al salir.';

ALTER TABLE public.parq_salidas_grua ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados gestionan parq_salidas_grua"
  ON public.parq_salidas_grua FOR ALL TO authenticated USING (true) WITH CHECK (true);
