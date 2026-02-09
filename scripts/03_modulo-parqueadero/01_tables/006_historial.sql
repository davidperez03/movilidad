-- Tabla de auditoría para el módulo de parqueadero
-- Registra inspecciones, cambios en vehículos, personal, y novedades

create table if not exists public.parq_historial_acciones (
  id uuid primary key default gen_random_uuid(),

  vehiculo_id uuid references public.parq_vehiculos(id) on delete set null,
  inspeccion_id uuid references public.parq_inspecciones(id) on delete set null,

  accion text not null check (accion in (
    'parq_vehiculo_creado',
    'parq_vehiculo_editado',
    'parq_vehiculo_activado',
    'parq_vehiculo_desactivado',
    'parq_inspeccion_creada',
    'parq_novedad_subsanada',
    'parq_personal_actualizado'
  )),

  detalles jsonb default '{}'::jsonb,

  valor_anterior text,
  valor_nuevo text,

  realizado_por uuid references public.perfiles(id) on delete set null,
  creado_en timestamp with time zone default now() not null
);

create index if not exists idx_parq_historial_vehiculo
  on public.parq_historial_acciones(vehiculo_id);

create index if not exists idx_parq_historial_inspeccion
  on public.parq_historial_acciones(inspeccion_id);

create index if not exists idx_parq_historial_accion
  on public.parq_historial_acciones(accion);

create index if not exists idx_parq_historial_realizado_por
  on public.parq_historial_acciones(realizado_por);

create index if not exists idx_parq_historial_creado_en
  on public.parq_historial_acciones(creado_en desc);

create index if not exists idx_parq_historial_detalles_gin
  on public.parq_historial_acciones using gin(detalles);

comment on table public.parq_historial_acciones is
  'Registro de auditoría del módulo de parqueadero. Incluye inspecciones, vehículos, personal y novedades.';

comment on column public.parq_historial_acciones.vehiculo_id is
  'Vehículo relacionado (NULL si no aplica)';

comment on column public.parq_historial_acciones.inspeccion_id is
  'Inspección relacionada (NULL si no aplica)';

comment on column public.parq_historial_acciones.accion is
  'Tipo de acción (parq_vehiculo_creado, parq_inspeccion_creada, etc.)';

comment on column public.parq_historial_acciones.detalles is
  'Información adicional en formato JSON (varía según el tipo de acción)';
