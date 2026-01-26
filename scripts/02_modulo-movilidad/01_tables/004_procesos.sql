
CREATE TABLE IF NOT EXISTS public.mov_empresas_transporte (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamp with time zone DEFAULT now() NOT NULL,
  actualizado_en timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mov_empresas_transporte_nombre
  ON public.mov_empresas_transporte(nombre);

create table if not exists public.mov_traslados (
  id uuid primary key default gen_random_uuid(),

  cuenta_id uuid not null references public.mov_cuentas_vehiculos(id) on delete cascade,

  organismo_destino_id uuid not null references public.mov_organismos_transito(id) on delete restrict,
  estado text not null default 'sin_asignar' check (estado in (
    'sin_asignar',
    'revisado',
    'con_novedades',
    'aprobado',
    'enviado_organismo',
    'trasladado',
    'devuelto'
  )),

  fecha_tramite date not null default current_date,
  fecha_aprobacion date,
  fecha_vencimiento date,
  fecha_completado timestamp with time zone,

  observaciones text,

  empresa_transportadora_id uuid references public.mov_empresas_transporte(id) on delete set null,
  numero_guia text,

  creado_por uuid not null references public.perfiles(id) on delete restrict,
  actualizado_por uuid references public.perfiles(id) on delete restrict,
  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null
);

create table if not exists public.mov_radicaciones (
  id uuid primary key default gen_random_uuid(),

  cuenta_id uuid not null references public.mov_cuentas_vehiculos(id) on delete cascade,

  organismo_origen_id uuid not null references public.mov_organismos_transito(id) on delete restrict,
  estado text not null default 'sin_asignar' check (estado in (
    'sin_asignar',
    'pendiente_radicar',
    'recibido',
    'revisado',
    'con_novedades',
    'radicado',
    'devuelto'
  )),

  fecha_tramite date not null default current_date,
  fecha_vencimiento date not null,
  fecha_completado timestamp with time zone,

  observaciones text,

  creado_por uuid not null references public.perfiles(id) on delete restrict,
  actualizado_por uuid references public.perfiles(id) on delete restrict,
  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null
);

create index if not exists idx_mov_traslados_cuenta on public.mov_traslados(cuenta_id);
create index if not exists idx_mov_traslados_organismo_destino on public.mov_traslados(organismo_destino_id);
create index if not exists idx_mov_traslados_estado on public.mov_traslados(estado);
create index if not exists idx_mov_traslados_fecha_tramite on public.mov_traslados(fecha_tramite desc);
create index if not exists idx_mov_traslados_fecha_vencimiento on public.mov_traslados(fecha_vencimiento);
create index if not exists idx_mov_traslados_creado_por on public.mov_traslados(creado_por);
create index if not exists idx_mov_traslados_empresa_transportadora on public.mov_traslados(empresa_transportadora_id);

create index if not exists idx_mov_radicaciones_cuenta on public.mov_radicaciones(cuenta_id);
create index if not exists idx_mov_radicaciones_organismo_origen on public.mov_radicaciones(organismo_origen_id);
create index if not exists idx_mov_radicaciones_estado on public.mov_radicaciones(estado);
create index if not exists idx_mov_radicaciones_fecha_tramite on public.mov_radicaciones(fecha_tramite desc);
create index if not exists idx_mov_radicaciones_fecha_vencimiento on public.mov_radicaciones(fecha_vencimiento);
create index if not exists idx_mov_radicaciones_creado_por on public.mov_radicaciones(creado_por);

COMMENT ON TABLE public.mov_empresas_transporte IS
  'Catálogo de empresas transportadoras para traslados de vehículos';

COMMENT ON COLUMN public.mov_empresas_transporte.id IS
  'Identificador único de la empresa (UUID)';

COMMENT ON COLUMN public.mov_empresas_transporte.nombre IS
  'Nombre de la empresa transportadora';

COMMENT ON COLUMN public.mov_empresas_transporte.activo IS
  'Indica si la empresa está activa (disponible para selección)';

COMMENT ON TABLE public.mov_traslados IS
  'Procesos de envío (traslado) de vehículos a otras ciudades. Registra el flujo completo desde la solicitud hasta la finalización del traslado, con estados intermedios y fechas de vencimiento basadas en días hábiles.';

COMMENT ON COLUMN public.mov_traslados.id IS
  'Identificador único del traslado (UUID)';

COMMENT ON COLUMN public.mov_traslados.cuenta_id IS
  'ID de la cuenta de vehículo asociada al traslado (referencia a mov_cuentas_vehiculos.id)';

COMMENT ON COLUMN public.mov_traslados.organismo_destino_id IS
  'ID del organismo de tránsito destino al que se envía el vehículo (referencia a mov_organismos_transito.id)';

COMMENT ON COLUMN public.mov_traslados.estado IS
  'Estado actual del proceso: sin_asignar, revisado, con_novedades, aprobado (genera remisión), enviado_organismo, trasladado (final), devuelto (final)';

COMMENT ON COLUMN public.mov_traslados.fecha_aprobacion IS
  'Fecha en que el trámite fue aprobado (cuando estado cambia a "aprobado"). A partir de esta fecha se calculan los 60 días hábiles de vencimiento';

COMMENT ON COLUMN public.mov_traslados.fecha_tramite IS
  'Fecha de inicio del trámite de traslado';

COMMENT ON COLUMN public.mov_traslados.fecha_vencimiento IS
  'Fecha límite del trámite (60 días hábiles desde fecha_aprobacion, calculado automáticamente al aprobar sin contar sábados, domingos ni festivos)';

COMMENT ON COLUMN public.mov_traslados.fecha_completado IS
  'Fecha y hora en que se completó el traslado (cuando estado cambia a "trasladado")';

COMMENT ON COLUMN public.mov_traslados.observaciones IS
  'Notas u observaciones adicionales sobre el proceso de traslado';

COMMENT ON COLUMN public.mov_traslados.empresa_transportadora_id IS
  'ID de la empresa transportadora encargada del traslado (referencia a mov_empresas_transporte.id)';

COMMENT ON COLUMN public.mov_traslados.numero_guia IS
  'Número de guía o tracking del envío del vehículo';

COMMENT ON COLUMN public.mov_traslados.creado_por IS
  'ID del usuario que creó el traslado (referencia a perfiles.id)';

COMMENT ON COLUMN public.mov_traslados.actualizado_por IS
  'ID del usuario que realizó la última actualización (referencia a perfiles.id)';

COMMENT ON COLUMN public.mov_traslados.creado_en IS
  'Fecha y hora de creación del registro';

COMMENT ON COLUMN public.mov_traslados.actualizado_en IS
  'Fecha y hora de la última actualización (actualizado automáticamente)';

COMMENT ON TABLE public.mov_radicaciones IS
  'Procesos de recepción (radicación) de vehículos desde otras ciudades. Registra el flujo completo desde la solicitud hasta la finalización de la radicación, con estados intermedios y fechas de vencimiento basadas en días hábiles.';

COMMENT ON COLUMN public.mov_radicaciones.id IS
  'Identificador único de la radicación (UUID)';

COMMENT ON COLUMN public.mov_radicaciones.cuenta_id IS
  'ID de la cuenta de vehículo asociada a la radicación (referencia a mov_cuentas_vehiculos.id)';

COMMENT ON COLUMN public.mov_radicaciones.organismo_origen_id IS
  'ID del organismo de tránsito origen desde donde se recibe el vehículo (referencia a mov_organismos_transito.id)';

COMMENT ON COLUMN public.mov_radicaciones.estado IS
  'Estado actual del proceso: sin_asignar, pendiente_radicar, recibido, revisado, con_novedades, radicado (final), devuelto (final)';

COMMENT ON COLUMN public.mov_radicaciones.fecha_tramite IS
  'Fecha de inicio del trámite de radicación';

COMMENT ON COLUMN public.mov_radicaciones.fecha_vencimiento IS
  'Fecha límite del trámite (60 días hábiles desde fecha_tramite, calculado automáticamente sin contar sábados, domingos ni festivos)';

COMMENT ON COLUMN public.mov_radicaciones.fecha_completado IS
  'Fecha y hora en que se completó la radicación (cuando estado cambia a "radicado")';

COMMENT ON COLUMN public.mov_radicaciones.observaciones IS
  'Notas u observaciones adicionales sobre el proceso de radicación';

COMMENT ON COLUMN public.mov_radicaciones.creado_por IS
  'ID del usuario que creó la radicación (referencia a perfiles.id)';

COMMENT ON COLUMN public.mov_radicaciones.actualizado_por IS
  'ID del usuario que realizó la última actualización (referencia a perfiles.id)';

COMMENT ON COLUMN public.mov_radicaciones.creado_en IS
  'Fecha y hora de creación del registro';

COMMENT ON COLUMN public.mov_radicaciones.actualizado_en IS
  'Fecha y hora de la última actualización (actualizado automáticamente)';
