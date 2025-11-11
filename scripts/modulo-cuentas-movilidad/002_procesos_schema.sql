-- =====================================================
-- MÓDULO: CUENTAS DE MOVILIDAD
-- Archivo: 002_procesos_schema.sql
-- Descripción: Esquema para traslados y radicaciones
-- =====================================================

-- Crear tabla de traslados (enviar vehículo)
create table if not exists public.mov_traslados (
  id uuid primary key default gen_random_uuid(),

  -- Relación con cuenta
  cuenta_id uuid not null references public.mov_cuentas_vehiculos(id) on delete cascade,

  -- Datos del proceso
  organismo_destino_id uuid not null references public.mov_organismos_transito(id) on delete restrict,
  estado text not null default 'sin_asignar' check (estado in (
    'sin_asignar',
    'enviado_organismo',
    'revisado',
    'con_novedades',
    'trasladado',
    'devuelto'
  )),

  -- Fechas
  fecha_tramite date not null default current_date,
  fecha_vencimiento date not null,
  fecha_completado timestamp with time zone,

  -- Observaciones
  observaciones text,

  -- Metadatos
  creado_por uuid not null references public.perfiles(id) on delete restrict,
  actualizado_por uuid references public.perfiles(id) on delete restrict,
  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null
);

-- Crear tabla de radicaciones (recibir vehículo)
create table if not exists public.mov_radicaciones (
  id uuid primary key default gen_random_uuid(),

  -- Relación con cuenta
  cuenta_id uuid not null references public.mov_cuentas_vehiculos(id) on delete cascade,

  -- Datos del proceso
  organismo_origen_id uuid not null references public.mov_organismos_transito(id) on delete restrict,
  estado text not null default 'sin_asignar' check (estado in (
    'sin_asignar',
    'pendiente_radicar',
    'recibido',
    'revisado',
    'con_novedades',
    'radicado',
    'devuelto'
  )),

  -- Fechas
  fecha_tramite date not null default current_date,
  fecha_vencimiento date not null,
  fecha_completado timestamp with time zone,

  -- Observaciones
  observaciones text,

  -- Metadatos
  creado_por uuid not null references public.perfiles(id) on delete restrict,
  actualizado_por uuid references public.perfiles(id) on delete restrict,
  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null
);

-- Crear índices para traslados
create index if not exists idx_mov_traslados_cuenta on public.mov_traslados(cuenta_id);
create index if not exists idx_mov_traslados_organismo_destino on public.mov_traslados(organismo_destino_id);
create index if not exists idx_mov_traslados_estado on public.mov_traslados(estado);
create index if not exists idx_mov_traslados_fecha_tramite on public.mov_traslados(fecha_tramite desc);
create index if not exists idx_mov_traslados_fecha_vencimiento on public.mov_traslados(fecha_vencimiento);
create index if not exists idx_mov_traslados_creado_por on public.mov_traslados(creado_por);

-- Crear índices para radicaciones
create index if not exists idx_mov_radicaciones_cuenta on public.mov_radicaciones(cuenta_id);
create index if not exists idx_mov_radicaciones_organismo_origen on public.mov_radicaciones(organismo_origen_id);
create index if not exists idx_mov_radicaciones_estado on public.mov_radicaciones(estado);
create index if not exists idx_mov_radicaciones_fecha_tramite on public.mov_radicaciones(fecha_tramite desc);
create index if not exists idx_mov_radicaciones_fecha_vencimiento on public.mov_radicaciones(fecha_vencimiento);
create index if not exists idx_mov_radicaciones_creado_por on public.mov_radicaciones(creado_por);

-- Trigger para auto-calcular fecha de vencimiento en traslados (60 días hábiles)
create or replace function trigger_vencimiento_traslado()
returns trigger
language plpgsql
as $$
begin
  -- Calcular fecha de vencimiento sumando 60 días hábiles
  new.fecha_vencimiento := sumar_dias_habiles(new.fecha_tramite::date, 60);
  return new;
end;
$$;

drop trigger if exists before_insert_traslado on public.mov_traslados;

create trigger before_insert_traslado
  before insert on public.mov_traslados
  for each row
  execute function trigger_vencimiento_traslado();

-- Trigger para auto-calcular fecha de vencimiento en radicaciones (60 días hábiles)
create or replace function trigger_vencimiento_radicacion()
returns trigger
language plpgsql
as $$
begin
  -- Calcular fecha de vencimiento sumando 60 días hábiles
  new.fecha_vencimiento := sumar_dias_habiles(new.fecha_tramite::date, 60);
  return new;
end;
$$;

drop trigger if exists before_insert_radicacion on public.mov_radicaciones;

create trigger before_insert_radicacion
  before insert on public.mov_radicaciones
  for each row
  execute function trigger_vencimiento_radicacion();

-- Trigger para auto-asignar actualizado_por
create or replace function trigger_auto_actualizado_por()
returns trigger
language plpgsql
as $$
begin
  -- Auto-asignar actualizado_por si no viene en el request
  if new.actualizado_por is null then
    new.actualizado_por := auth.uid();
  end if;
  return new;
end;
$$;

-- Trigger para actualizar fecha de actualización en traslados
drop trigger if exists before_update_traslado on public.mov_traslados;
drop trigger if exists before_update_auto_actualizado_traslado on public.mov_traslados;

create trigger before_update_auto_actualizado_traslado
  before update on public.mov_traslados
  for each row
  execute function trigger_auto_actualizado_por();

create trigger before_update_traslado
  before update on public.mov_traslados
  for each row
  execute function trigger_actualizar_fecha();

-- Trigger para actualizar fecha de actualización en radicaciones
drop trigger if exists before_update_radicacion on public.mov_radicaciones;
drop trigger if exists before_update_auto_actualizado_radicacion on public.mov_radicaciones;

create trigger before_update_auto_actualizado_radicacion
  before update on public.mov_radicaciones
  for each row
  execute function trigger_auto_actualizado_por();

create trigger before_update_radicacion
  before update on public.mov_radicaciones
  for each row
  execute function trigger_actualizar_fecha();

-- Trigger para registrar fecha de completado cuando cambia a estado final
create or replace function trigger_marcar_completado()
returns trigger
language plpgsql
as $$
begin
  -- Para traslados
  if tg_table_name = 'mov_traslados' and new.estado = 'trasladado' and old.estado != 'trasladado' then
    new.fecha_completado := now();
  end if;

  -- Para radicaciones
  if tg_table_name = 'mov_radicaciones' and new.estado = 'radicado' and old.estado != 'radicado' then
    new.fecha_completado := now();
  end if;

  return new;
end;
$$;

drop trigger if exists before_update_estado_traslado on public.mov_traslados;
drop trigger if exists before_update_estado_radicacion on public.mov_radicaciones;

create trigger before_update_estado_traslado
  before update on public.mov_traslados
  for each row
  execute function trigger_marcar_completado();

create trigger before_update_estado_radicacion
  before update on public.mov_radicaciones
  for each row
  execute function trigger_marcar_completado();

-- Habilitar Row Level Security
alter table public.mov_traslados enable row level security;
alter table public.mov_radicaciones enable row level security;

-- Políticas de seguridad para traslados
create policy "Usuarios pueden ver todos los traslados"
  on public.mov_traslados for select
  using (true);

create policy "Usuarios pueden crear traslados"
  on public.mov_traslados for insert
  with check (auth.uid() = creado_por);

create policy "Actualizar traslados según permisos modulares"
  on public.mov_traslados for update
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'editar_traslados')
    or (auth.uid() = creado_por and tiene_permiso(auth.uid(), 'movilidad', 'ver'))
  )
  with check (
    actualizado_por is null or auth.uid() = actualizado_por
  );

create policy "Eliminar traslados según permisos modulares"
  on public.mov_traslados for delete
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'eliminar_traslados')
  );

-- Políticas de seguridad para radicaciones
create policy "Usuarios pueden ver todas las radicaciones"
  on public.mov_radicaciones for select
  using (true);

create policy "Usuarios pueden crear radicaciones"
  on public.mov_radicaciones for insert
  with check (auth.uid() = creado_por);

create policy "Actualizar radicaciones según permisos modulares"
  on public.mov_radicaciones for update
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'editar_radicaciones')
    or (auth.uid() = creado_por and tiene_permiso(auth.uid(), 'movilidad', 'ver'))
  )
  with check (
    actualizado_por is null or auth.uid() = actualizado_por
  );

create policy "Eliminar radicaciones según permisos modulares"
  on public.mov_radicaciones for delete
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'eliminar_radicaciones')
  );

-- Comentarios para documentación
comment on table public.mov_traslados is 'Procesos de envío de vehículos a otras ciudades';
comment on table public.mov_radicaciones is 'Procesos de recepción de vehículos desde otras ciudades';
comment on column public.mov_traslados.fecha_vencimiento is 'Fecha límite del trámite (60 días hábiles desde fecha_tramite, sin contar sábados, domingos ni festivos)';
comment on column public.mov_radicaciones.fecha_vencimiento is 'Fecha límite del trámite (60 días hábiles desde fecha_tramite, sin contar sábados, domingos ni festivos)';
