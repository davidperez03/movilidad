create table if not exists public.mov_notificaciones_radicacion (
  id uuid primary key default gen_random_uuid(),
  radicacion_id uuid not null unique references public.mov_radicaciones(id) on delete cascade,
  solicitante_notificado boolean not null default false,
  notificado_en timestamp with time zone,
  observaciones text,
  creado_por uuid not null references public.perfiles(id) on delete restrict,
  actualizado_por uuid references public.perfiles(id) on delete restrict,
  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null,
  constraint chk_mov_notificaciones_radicacion_notificado
    check (
      (solicitante_notificado = true and notificado_en is not null)
      or (solicitante_notificado = false and notificado_en is null)
    )
);

create index if not exists idx_mov_notificaciones_radicacion_notificado
  on public.mov_notificaciones_radicacion(solicitante_notificado);

create index if not exists idx_mov_notificaciones_radicacion_actualizado_en
  on public.mov_notificaciones_radicacion(actualizado_en desc);

comment on table public.mov_notificaciones_radicacion is
  'Control de notificación al solicitante para radicaciones en estado pendiente_radicar';

comment on column public.mov_notificaciones_radicacion.radicacion_id is
  'Referencia única a la radicación (1:1 por proceso)';

comment on column public.mov_notificaciones_radicacion.solicitante_notificado is
  'Indica si el solicitante ya fue notificado';

comment on column public.mov_notificaciones_radicacion.notificado_en is
  'Fecha y hora en que se marcó la notificación al solicitante';
