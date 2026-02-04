create table if not exists public.parq_items_catalogo (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nombre text not null,
  categoria text not null,
  descripcion text,
  orden integer default 0,
  activo boolean default true,
  creado_en timestamptz default now() not null,
  actualizado_en timestamptz default now() not null
);

create index if not exists idx_parq_items_catalogo_categoria on public.parq_items_catalogo(categoria);
create index if not exists idx_parq_items_catalogo_activo on public.parq_items_catalogo(activo);

comment on table public.parq_items_catalogo is 'Catálogo de ítems verificados en inspecciones preoperacionales';
comment on column public.parq_items_catalogo.categoria is 'Categoría: niveles, luces, exterior, grua, funcional, kit_carretera, epp_operador, epp_auxiliar';
comment on column public.parq_items_catalogo.orden is 'Orden de aparición en el formulario';
