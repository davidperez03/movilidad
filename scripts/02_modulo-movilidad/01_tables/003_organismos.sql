create table if not exists public.mov_organismos_transito (
  id uuid primary key default gen_random_uuid(),

  nombre text not null,
  tipo text not null,
  telefono text,
  direccion text,
  municipio text not null,
  departamento text not null,

  search_vector tsvector,

  activo boolean not null default true,

  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null
);

create index if not exists idx_mov_organismos_nombre on public.mov_organismos_transito(nombre);
create index if not exists idx_mov_organismos_departamento on public.mov_organismos_transito(departamento);
create index if not exists idx_mov_organismos_municipio on public.mov_organismos_transito(municipio);
create index if not exists idx_mov_organismos_activo on public.mov_organismos_transito(activo);
create index if not exists idx_mov_organismos_search on public.mov_organismos_transito using gin(search_vector);

comment on table public.mov_organismos_transito is 'Organismos de tránsito registrados en el RUNT de Colombia';
comment on column public.mov_organismos_transito.search_vector is 'Vector de búsqueda de texto completo para búsquedas rápidas por nombre, municipio o departamento';
