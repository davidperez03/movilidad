
create table if not exists public.mov_novedades (
  id uuid primary key default gen_random_uuid(),

  proceso_tipo text not null check (proceso_tipo in ('traslado', 'radicacion')),
  proceso_id uuid not null,

  tipo_novedad text not null check (tipo_novedad in (
    'documentos_faltantes',
    'documentos_incorrectos',
    'placa_incorrecta',
    'otro'
  )),
  descripcion text not null,
  prioridad text not null default 'media' check (prioridad in (
    'baja', 'media', 'alta', 'critica'
  )),
  estado text not null default 'pendiente' check (estado in (
    'pendiente',
    'en_revision',
    'resuelta'
  )),

  solucion text,
  resuelta_por uuid references public.perfiles(id) on delete set null,
  resuelta_en timestamp with time zone,

  creado_por uuid not null references public.perfiles(id) on delete restrict,
  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null
);

create table if not exists public.mov_adjuntos_novedades (
  id uuid primary key default gen_random_uuid(),

  novedad_id uuid not null references public.mov_novedades(id) on delete cascade,

  nombre_archivo text not null,
  url_archivo text not null,
  tamano_archivo integer,
  tipo_archivo text,

  subido_por uuid not null references public.perfiles(id) on delete restrict,
  creado_en timestamp with time zone default now() not null
);

create index if not exists idx_mov_novedades_proceso on public.mov_novedades(proceso_tipo, proceso_id);
create index if not exists idx_mov_novedades_estado on public.mov_novedades(estado);
create index if not exists idx_mov_novedades_prioridad on public.mov_novedades(prioridad);
create index if not exists idx_mov_novedades_creado_por on public.mov_novedades(creado_por);
create index if not exists idx_mov_novedades_creado_en on public.mov_novedades(creado_en desc);
create index if not exists idx_mov_novedades_pendientes on public.mov_novedades(creado_en desc) where estado != 'resuelta';

create index if not exists idx_mov_adjuntos_novedades_novedad on public.mov_adjuntos_novedades(novedad_id);
create index if not exists idx_mov_adjuntos_novedades_subido_por on public.mov_adjuntos_novedades(subido_por);

comment on table public.mov_novedades is 'Problemas o incidencias encontradas durante los procesos';
comment on column public.mov_novedades.proceso_tipo is 'Tipo de proceso: traslado o radicacion';
comment on column public.mov_novedades.proceso_id is 'ID del proceso (traslado o radicación)';
comment on column public.mov_novedades.prioridad is 'Nivel de urgencia: baja, media, alta, critica';
comment on table public.mov_adjuntos_novedades is 'Archivos de soporte para las novedades';
