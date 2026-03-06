create table if not exists public.parq_inspecciones (
  id uuid primary key default gen_random_uuid(),
  consecutivo text unique, -- Formato: YYYY-MM-DD-NNN
  vehiculo_id uuid not null references public.parq_vehiculos(id),
  operador_id uuid not null references public.perfiles(id),
  auxiliar_id uuid references public.perfiles(id),
  inspector_id uuid not null references public.perfiles(id),
  fecha date not null default current_date,
  hora time not null default current_time,
  turno text check (turno in ('diurno', 'nocturno')),
  es_apto boolean not null default false,
  observaciones text,
  -- Snapshot: datos al momento de la inspección
  snapshot_soat_vencimiento date,
  snapshot_tecnomecanica_vencimiento date,
  snapshot_licencia_vencimiento date,
  snapshot_licencia_categoria text,
  -- Firmas (base64)
  firma_inspector text,
  firma_operador text,
  observaciones_fotos JSONB DEFAULT '[]'::jsonb, -- [{url: string, timestamp: string}]. Máximo 5.
  creado_por uuid references public.perfiles(id),
  creado_en timestamptz default now() not null,
  actualizado_en timestamptz default now() not null
);

create index if not exists idx_parq_inspecciones_vehiculo on public.parq_inspecciones(vehiculo_id);
create index if not exists idx_parq_inspecciones_fecha on public.parq_inspecciones(fecha desc);
create index if not exists idx_parq_inspecciones_operador on public.parq_inspecciones(operador_id);

alter table public.parq_inspecciones
  add constraint if not exists check_observaciones_fotos_max_5 check (jsonb_array_length(observaciones_fotos) <= 5);

comment on table public.parq_inspecciones is 'Inspecciones preoperacionales de vehículos';
comment on column public.parq_inspecciones.es_apto is 'Resultado: true si el vehículo puede operar';
