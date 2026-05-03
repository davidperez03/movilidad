
create table if not exists public.mov_historial_acciones (
  id uuid primary key default gen_random_uuid(),

  cuenta_id uuid not null references public.mov_cuentas_vehiculos(id) on delete cascade,

  proceso_tipo text check (proceso_tipo in ('traslado', 'radicacion')),
  proceso_id uuid,

  accion text not null check (accion in (
    'cuenta_creada',
    'traslado_iniciado',
    'radicacion_iniciada',
    'estado_cambiado',
    'novedad_agregada',
    'novedad_resuelta',
    'proceso_completado',
    'proceso_devuelto',
    'observacion_agregada'
  )),

  detalles jsonb,

  estado_anterior text,
  estado_nuevo text,

  realizado_por uuid not null references public.perfiles(id) on delete restrict,
  sesion_id uuid references public.sys_sesiones(id) on delete set null,
  ip_address inet,
  user_agent text,
  creado_en timestamp with time zone default now() not null,
  hash_anterior text,
  hash_registro text
);

create index if not exists idx_mov_historial_cuenta on public.mov_historial_acciones(cuenta_id);
create index if not exists idx_mov_historial_proceso on public.mov_historial_acciones(proceso_tipo, proceso_id);
create index if not exists idx_mov_historial_accion on public.mov_historial_acciones(accion);
create index if not exists idx_mov_historial_realizado_por on public.mov_historial_acciones(realizado_por);
create index if not exists idx_mov_historial_creado_en on public.mov_historial_acciones(creado_en desc);
create index if not exists idx_mov_historial_detalles_gin on public.mov_historial_acciones using gin(detalles);
create index if not exists idx_mov_historial_sesion_id on public.mov_historial_acciones(sesion_id);

comment on table public.mov_historial_acciones is 'Registro de auditoría de todas las acciones realizadas';
comment on column public.mov_historial_acciones.detalles is 'Información adicional en formato JSON';
comment on column public.mov_historial_acciones.hash_registro is 'SHA-256 encadenado para no repudio — ver _mov_historial_asignar_hash';
