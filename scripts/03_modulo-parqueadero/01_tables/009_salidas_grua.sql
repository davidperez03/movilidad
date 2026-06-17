-- Registro de salidas y regresos de gruas via QR estatico por vehiculo (migration 028)
create table if not exists public.parq_salidas_grua (
  id               uuid        default gen_random_uuid() primary key,
  vehiculo_id      uuid        not null references public.parq_vehiculos(id) on delete cascade,
  operador_id      uuid        references public.perfiles(id) on delete set null,
  hora_salida      timestamptz not null default now(),
  hora_regreso     timestamptz,
  motivo           text        not null check (motivo in (
                     'requerimiento_agentes', 'requerimiento_polca',
                     'mantenimiento', 'tanqueo', 'autorizacion', 'otros'
                   )),
  trae_carga       boolean     not null default false,
  inventario_items jsonb       not null default '[]'::jsonb,
  observaciones    text,
  registrado_por   uuid        references public.perfiles(id) on delete set null,
  creado_en        timestamptz default now() not null
);

create index if not exists idx_parq_salidas_grua_vehiculo on public.parq_salidas_grua(vehiculo_id);
create index if not exists idx_parq_salidas_grua_salida   on public.parq_salidas_grua(hora_salida desc);
create index if not exists idx_parq_salidas_en_calle      on public.parq_salidas_grua(vehiculo_id, hora_regreso) where hora_regreso is null;

alter table public.parq_salidas_grua enable row level security;

create policy "Autenticados gestionan parq_salidas_grua"
  on public.parq_salidas_grua for all to authenticated using (true) with check (true);

comment on table public.parq_salidas_grua is 'Registro de salidas y regresos de gruas via QR estatico por vehiculo.';
