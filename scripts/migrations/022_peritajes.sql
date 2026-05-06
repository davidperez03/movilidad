CREATE TABLE public.nunc_sesiones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  entidad_nombre text NOT NULL,
  nombre_peritos text NOT NULL,
  -- Valores NUNC por defecto para la sesión (editables por registro)
  nunc_dpto text NOT NULL,
  nunc_municipio text NOT NULL,
  nunc_entidad text NOT NULL,
  nunc_unidad text NOT NULL,
  nunc_anio integer NOT NULL,
  observaciones text,
  estado text NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'cerrada', 'expirada')),
  generado_por uuid NOT NULL REFERENCES public.perfiles(id),
  expira_en timestamptz NOT NULL,
  cerrado_en timestamptz,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.nunc_registros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id uuid NOT NULL REFERENCES public.nunc_sesiones(id) ON DELETE CASCADE,
  placa text NOT NULL,
  -- NUNC completo por registro (pre-llenado desde sesión, editable)
  nunc_dpto text NOT NULL,
  nunc_municipio text NOT NULL,
  nunc_entidad text NOT NULL,
  nunc_unidad text NOT NULL,
  nunc_anio integer NOT NULL,
  nunc_consecutivo text NOT NULL,
  observaciones text,
  registrado_en timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_nunc_registros_nunc_unico
  ON public.nunc_registros(nunc_dpto, nunc_municipio, nunc_entidad, nunc_unidad, nunc_anio, nunc_consecutivo);

CREATE INDEX IF NOT EXISTS idx_nunc_sesiones_codigo ON public.nunc_sesiones(codigo) WHERE estado = 'activa';
CREATE INDEX IF NOT EXISTS idx_nunc_sesiones_generado_por ON public.nunc_sesiones(generado_por);
CREATE INDEX IF NOT EXISTS idx_nunc_registros_sesion ON public.nunc_registros(sesion_id);

ALTER TABLE public.nunc_sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nunc_registros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nunc_sesiones_auth" ON public.nunc_sesiones
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "nunc_registros_auth" ON public.nunc_registros
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Módulo y roles de Estudios NUNC
INSERT INTO public.modulos (id, nombre, descripcion, icono, ruta, activo, orden)
VALUES ('nunc', 'Estudios NUNC', 'Registro de estudios NUNC externos', 'scale', '/nunc', true, 3)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  icono = EXCLUDED.icono,
  ruta = EXCLUDED.ruta,
  activo = EXCLUDED.activo,
  orden = EXCLUDED.orden;

INSERT INTO public.roles_modulo (modulo_id, codigo, nombre, descripcion, permisos, nivel)
VALUES
  (
    'nunc',
    'nunc_operador',
    'Operador NUNC',
    'Puede ver sesiones y crear nuevas sesiones',
    '{"ver": true, "crear_sesiones": true, "configurar": false}'::jsonb,
    1
  ),
  (
    'nunc',
    'nunc_admin',
    'Administrador NUNC',
    'Control total sobre el módulo NUNC',
    '{"ver": true, "crear_sesiones": true, "configurar": true}'::jsonb,
    2
  )
ON CONFLICT (modulo_id, codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  permisos = EXCLUDED.permisos,
  nivel = EXCLUDED.nivel;
