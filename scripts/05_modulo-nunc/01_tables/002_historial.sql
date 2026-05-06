CREATE TABLE public.nunc_historial_acciones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id   UUID REFERENCES public.nunc_sesiones(id) ON DELETE SET NULL,
  registro_id UUID REFERENCES public.nunc_registros(id) ON DELETE SET NULL,

  accion TEXT NOT NULL CHECK (accion IN (
    'nunc_sesion_creada',
    'nunc_sesion_cerrada',
    'nunc_sesion_expirada',
    'nunc_registro_creado',
    'nunc_registro_editado',
    'nunc_registro_eliminado'
  )),

  detalles       JSONB DEFAULT '{}'::jsonb,
  valor_anterior TEXT,
  valor_nuevo    TEXT,

  -- NULL cuando la acción la hace un oficial externo sin cuenta
  realizado_por UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
  ip_address    INET,
  user_agent    TEXT,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT now(),
  hash_anterior TEXT,
  hash_registro TEXT
);

CREATE INDEX IF NOT EXISTS idx_nunc_historial_sesion
  ON public.nunc_historial_acciones(sesion_id);
CREATE INDEX IF NOT EXISTS idx_nunc_historial_registro
  ON public.nunc_historial_acciones(registro_id);
CREATE INDEX IF NOT EXISTS idx_nunc_historial_accion
  ON public.nunc_historial_acciones(accion);
CREATE INDEX IF NOT EXISTS idx_nunc_historial_realizado_por
  ON public.nunc_historial_acciones(realizado_por);
CREATE INDEX IF NOT EXISTS idx_nunc_historial_creado_en
  ON public.nunc_historial_acciones(creado_en DESC);

ALTER TABLE public.nunc_historial_acciones ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.nunc_historial_acciones IS
  'Auditoría del módulo Estudios NUNC. realizado_por es NULL para acciones de oficiales externos sin cuenta.';
