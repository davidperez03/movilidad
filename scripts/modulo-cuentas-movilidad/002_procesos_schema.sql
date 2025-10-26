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
  ciudad_destino text not null check (ciudad_destino in (
    'sogamoso', 'medellin', 'bogota_dc', 'funza', 'el_zulia', 'nobsa'
  )),
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
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null,
  actualizado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear tabla de radicaciones (recibir vehículo)
create table if not exists public.mov_radicaciones (
  id uuid primary key default gen_random_uuid(),

  -- Relación con cuenta
  cuenta_id uuid not null references public.mov_cuentas_vehiculos(id) on delete cascade,

  -- Datos del proceso
  ciudad_origen text not null check (ciudad_origen in (
    'sogamoso', 'medellin', 'bogota_dc', 'funza', 'el_zulia', 'nobsa'
  )),
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
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null,
  actualizado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear índices para traslados
create index if not exists idx_mov_traslados_cuenta on public.mov_traslados(cuenta_id);
create index if not exists idx_mov_traslados_estado on public.mov_traslados(estado);
create index if not exists idx_mov_traslados_fecha_tramite on public.mov_traslados(fecha_tramite desc);
create index if not exists idx_mov_traslados_fecha_vencimiento on public.mov_traslados(fecha_vencimiento);
create index if not exists idx_mov_traslados_creado_por on public.mov_traslados(creado_por);

-- Crear índices para radicaciones
create index if not exists idx_mov_radicaciones_cuenta on public.mov_radicaciones(cuenta_id);
create index if not exists idx_mov_radicaciones_estado on public.mov_radicaciones(estado);
create index if not exists idx_mov_radicaciones_fecha_tramite on public.mov_radicaciones(fecha_tramite desc);
create index if not exists idx_mov_radicaciones_fecha_vencimiento on public.mov_radicaciones(fecha_vencimiento);
create index if not exists idx_mov_radicaciones_creado_por on public.mov_radicaciones(creado_por);

-- Crear función para calcular fecha de vencimiento (60 días)
create or replace function calcular_fecha_vencimiento(fecha_inicio date)
returns date
language plpgsql
immutable
as $$
begin
  return fecha_inicio + interval '60 days';
end;
$$;

-- Trigger para auto-calcular fecha de vencimiento en traslados
create or replace function trigger_vencimiento_traslado()
returns trigger
language plpgsql
as $$
begin
  if new.fecha_vencimiento is null then
    new.fecha_vencimiento := calcular_fecha_vencimiento(new.fecha_tramite);
  end if;
  return new;
end;
$$;

drop trigger if exists before_insert_traslado on public.mov_traslados;

create trigger before_insert_traslado
  before insert on public.mov_traslados
  for each row
  execute function trigger_vencimiento_traslado();

-- Trigger para auto-calcular fecha de vencimiento en radicaciones
create or replace function trigger_vencimiento_radicacion()
returns trigger
language plpgsql
as $$
begin
  if new.fecha_vencimiento is null then
    new.fecha_vencimiento := calcular_fecha_vencimiento(new.fecha_tramite);
  end if;
  return new;
end;
$$;

drop trigger if exists before_insert_radicacion on public.mov_radicaciones;

create trigger before_insert_radicacion
  before insert on public.mov_radicaciones
  for each row
  execute function trigger_vencimiento_radicacion();

-- Trigger para actualizar fecha de actualización en traslados
drop trigger if exists before_update_traslado on public.mov_traslados;

create trigger before_update_traslado
  before update on public.mov_traslados
  for each row
  execute function trigger_actualizar_fecha();

-- Trigger para actualizar fecha de actualización en radicaciones
drop trigger if exists before_update_radicacion on public.mov_radicaciones;

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
    new.fecha_completado := timezone('utc'::text, now());
  end if;

  -- Para radicaciones
  if tg_table_name = 'mov_radicaciones' and new.estado = 'radicado' and old.estado != 'radicado' then
    new.fecha_completado := timezone('utc'::text, now());
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

create policy "Usuarios pueden actualizar sus traslados"
  on public.mov_traslados for update
  using (
    auth.uid() = creado_por or
    exists (
      select 1 from public.perfiles
      where id = auth.uid()
      and rol in ('agente', 'administrador')
    )
  );

create policy "Administradores pueden eliminar traslados"
  on public.mov_traslados for delete
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid()
      and rol = 'administrador'
    )
  );

-- Políticas de seguridad para radicaciones
create policy "Usuarios pueden ver todas las radicaciones"
  on public.mov_radicaciones for select
  using (true);

create policy "Usuarios pueden crear radicaciones"
  on public.mov_radicaciones for insert
  with check (auth.uid() = creado_por);

create policy "Usuarios pueden actualizar sus radicaciones"
  on public.mov_radicaciones for update
  using (
    auth.uid() = creado_por or
    exists (
      select 1 from public.perfiles
      where id = auth.uid()
      and rol in ('agente', 'administrador')
    )
  );

create policy "Administradores pueden eliminar radicaciones"
  on public.mov_radicaciones for delete
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid()
      and rol = 'administrador'
    )
  );

-- Comentarios para documentación
comment on table public.mov_traslados is 'Procesos de envío de vehículos a otras ciudades';
comment on table public.mov_radicaciones is 'Procesos de recepción de vehículos desde otras ciudades';
comment on column public.mov_traslados.fecha_vencimiento is 'Fecha límite del trámite (60 días desde fecha_tramite)';
comment on column public.mov_radicaciones.fecha_vencimiento is 'Fecha límite del trámite (60 días desde fecha_tramite)';
