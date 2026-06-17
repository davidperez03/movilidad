-- Turnos operativos de gruas (migration 027)
create table if not exists public.parq_turnos (
  id             uuid        default gen_random_uuid() primary key,
  tipo_turno     text        not null check (tipo_turno in ('diurno', 'nocturno')),
  fecha          date        not null,
  vehiculo_id    uuid        not null references public.parq_vehiculos(id),
  hora_inicio    timestamptz not null,
  hora_fin       timestamptz,
  km_fin         integer,
  estado         text        not null default 'abierto' check (estado in ('abierto', 'cerrado')),
  creado_por     uuid        references public.perfiles(id),
  creado_en      timestamptz default now() not null,
  actualizado_en timestamptz default now() not null,
  constraint uq_parq_turnos_vehiculo_fecha_tipo unique (vehiculo_id, fecha, tipo_turno)
);

create index if not exists idx_parq_turnos_fecha       on public.parq_turnos(fecha desc);
create index if not exists idx_parq_turnos_vehiculo_id on public.parq_turnos(vehiculo_id);
create index if not exists idx_parq_turnos_estado      on public.parq_turnos(estado);

comment on table public.parq_turnos is 'Turnos operativos de gruas. Agrupa inspecciones y registra kilometraje y horas de operacion.';
