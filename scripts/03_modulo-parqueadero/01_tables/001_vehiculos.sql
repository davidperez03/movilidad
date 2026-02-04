create table if not exists public.parq_vehiculos (
  id uuid primary key default gen_random_uuid(),
  placa text not null unique,
  marca text,
  modelo text,
  tipo text not null default 'grua_plataforma',
  activo boolean default true,
  soat_aseguradora text,
  soat_vencimiento date,
  tecnomecanica_vencimiento date,
  creado_por uuid references public.perfiles(id),
  creado_en timestamptz default now() not null,
  actualizado_en timestamptz default now() not null
);

create index if not exists idx_parq_vehiculos_placa on public.parq_vehiculos(placa);
create index if not exists idx_parq_vehiculos_activo on public.parq_vehiculos(activo);

comment on table public.parq_vehiculos is 'Vehículos del parqueadero (grúas y plataformas)';
comment on column public.parq_vehiculos.tipo is 'Tipo de vehículo: grua_plataforma, otro';
comment on column public.parq_vehiculos.activo is 'Indica si el vehículo está disponible para operación';
