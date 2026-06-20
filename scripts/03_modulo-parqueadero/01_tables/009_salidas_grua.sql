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
  codigo_salida    varchar(15) unique,  -- formato DDMMYYYY-XXXXX (migration 029)
  observaciones    text,
  creado_en        timestamptz default now() not null
);

create index if not exists idx_parq_salidas_grua_vehiculo on public.parq_salidas_grua(vehiculo_id);
create index if not exists idx_parq_salidas_grua_salida   on public.parq_salidas_grua(hora_salida desc);
create index if not exists idx_parq_salidas_en_calle      on public.parq_salidas_grua(vehiculo_id, hora_regreso) where hora_regreso is null;

alter table public.parq_salidas_grua enable row level security;

create policy "Autenticados gestionan parq_salidas_grua"
  on public.parq_salidas_grua for all to authenticated using (true) with check (true);

comment on table  public.parq_salidas_grua is 'Registro de salidas y regresos de gruas via QR estatico por vehiculo.';
comment on column public.parq_salidas_grua.codigo_salida      is 'Codigo formato DDMMYYYY-XXXXX (ej: 18062026-25484). Unico por dia. Al vigilante se muestran solo los 5 digitos.';
comment on column public.parq_salidas_grua.inventario_items   is '[{item_id, nombre, desde, hasta, cantidad}] — stickers asignados en campo al regresar la grua.';
