create table if not exists public.parq_items_inspeccion (
  id uuid primary key default gen_random_uuid(),
  inspeccion_id uuid not null references public.parq_inspecciones(id) on delete cascade,
  item_catalogo_id uuid not null references public.parq_items_catalogo(id),
  estado text not null check (estado in ('bueno', 'regular', 'malo', 'no_aplica')),
  observacion text,
  foto_url text, -- URL de foto de evidencia (para novedades)
  -- Snapshot: datos del catálogo al momento de la inspección
  item_codigo text,
  item_nombre text,
  item_categoria text,
  item_orden integer,
  subsanado boolean default false,
  subsanado_en timestamptz,
  subsanado_por uuid references public.perfiles(id),
  subsanado_observacion text,
  subsanado_foto_url text, -- URL de foto de subsanación
  unique(inspeccion_id, item_catalogo_id)
);

create index if not exists idx_parq_items_inspeccion_inspeccion on public.parq_items_inspeccion(inspeccion_id);
create index if not exists idx_parq_items_inspeccion_novedades on public.parq_items_inspeccion(inspeccion_id) where estado in ('regular', 'malo');

comment on table public.parq_items_inspeccion is 'Resultados de cada ítem verificado en una inspección';
comment on column public.parq_items_inspeccion.subsanado is 'true si la novedad fue corregida';
