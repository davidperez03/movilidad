-- Salidas de operacion por turno (migration 027)
create table if not exists public.parq_turno_novedades (
  id          uuid        default gen_random_uuid() primary key,
  turno_id    uuid        not null references public.parq_turnos(id) on delete cascade,
  motivo      text        not null,
  hora_inicio timestamptz not null,
  hora_fin    timestamptz,
  creado_en   timestamptz default now() not null
);

create index if not exists idx_parq_turno_novedades_turno_id on public.parq_turno_novedades(turno_id);

comment on table public.parq_turno_novedades is 'Salidas de operacion durante un turno que descuentan horas operadas.';
