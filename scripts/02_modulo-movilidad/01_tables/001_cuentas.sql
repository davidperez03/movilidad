create table if not exists public.mov_cuentas_vehiculos (
  id uuid primary key default gen_random_uuid(),

  placa text not null unique,
  numero_cuenta text not null unique,
  tipo_servicio text not null check (tipo_servicio in ('particular', 'publico', 'otro')),

  creado_por uuid not null references public.perfiles(id) on delete restrict,
  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null
);

create index if not exists idx_mov_cuentas_placa on public.mov_cuentas_vehiculos(placa);
create index if not exists idx_mov_cuentas_numero on public.mov_cuentas_vehiculos(numero_cuenta);
create index if not exists idx_mov_cuentas_creado_por on public.mov_cuentas_vehiculos(creado_por);
create index if not exists idx_mov_cuentas_creado_en on public.mov_cuentas_vehiculos(creado_en desc);

comment on table public.mov_cuentas_vehiculos is 'Almacena las cuentas de vehículos para gestión de movilidad';
comment on column public.mov_cuentas_vehiculos.placa is 'Placa del vehículo (única)';
comment on column public.mov_cuentas_vehiculos.numero_cuenta is 'Número de cuenta generado automáticamente (YYYYMMDD-XXXXX)';
comment on column public.mov_cuentas_vehiculos.tipo_servicio is 'Tipo de servicio: particular, publico, otro';
