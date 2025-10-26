-- =====================================================
-- MÓDULO: CUENTAS DE MOVILIDAD
-- Archivo: 004_historial_schema.sql
-- Descripción: Esquema para trazabilidad y auditoría
-- =====================================================

-- Crear tabla de historial de acciones
create table if not exists public.mov_historial_acciones (
  id uuid primary key default gen_random_uuid(),

  -- Relación con cuenta
  cuenta_id uuid not null references public.mov_cuentas_vehiculos(id) on delete cascade,

  -- Relación con proceso (opcional)
  proceso_tipo text check (proceso_tipo in ('traslado', 'radicacion')),
  proceso_id uuid,

  -- Tipo de acción
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

  -- Detalles de la acción (JSON para flexibilidad)
  detalles jsonb,

  -- Estado anterior y nuevo (para cambios de estado)
  estado_anterior text,
  estado_nuevo text,

  -- Metadatos
  realizado_por uuid not null references public.perfiles(id) on delete restrict,
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear vista para último proceso activo de cada cuenta
create or replace view public.mov_vista_proceso_activo as
select distinct on (cv.id)
  cv.id as cuenta_id,
  cv.placa,
  cv.numero_cuenta,
  cv.tipo_servicio,
  case
    when t.id is not null then 'traslado'
    when r.id is not null then 'radicacion'
    else null
  end as proceso_tipo,
  coalesce(t.id, r.id) as proceso_id,
  coalesce(t.estado, r.estado) as proceso_estado,
  coalesce(t.fecha_tramite, r.fecha_tramite) as fecha_tramite,
  coalesce(t.fecha_vencimiento, r.fecha_vencimiento) as fecha_vencimiento,
  coalesce(t.fecha_completado, r.fecha_completado) as fecha_completado,
  case
    when t.id is not null then t.ciudad_destino
    when r.id is not null then r.ciudad_origen
    else null
  end as ciudad,
  coalesce(t.creado_en, r.creado_en) as proceso_creado_en
from public.mov_cuentas_vehiculos cv
left join public.mov_traslados t on cv.id = t.cuenta_id
  and t.estado not in ('sin_asignar', 'trasladado', 'devuelto')
left join public.mov_radicaciones r on cv.id = r.cuenta_id
  and r.estado not in ('sin_asignar', 'radicado', 'devuelto')
order by cv.id, coalesce(t.creado_en, r.creado_en) desc nulls last;

-- Crear vista para resumen de novedades por proceso
create or replace view public.mov_vista_resumen_novedades as
select
  n.proceso_tipo,
  n.proceso_id,
  count(*) as total_novedades,
  count(*) filter (where n.estado = 'pendiente') as pendientes,
  count(*) filter (where n.estado = 'en_revision') as en_revision,
  count(*) filter (where n.estado = 'resuelta') as resueltas,
  count(*) filter (where n.prioridad = 'critica') as criticas,
  count(*) filter (where n.prioridad = 'alta') as altas,
  max(n.creado_en) as ultima_novedad
from public.mov_novedades n
group by n.proceso_tipo, n.proceso_id;

-- Crear vista para procesos próximos a vencer
create or replace view public.mov_vista_procesos_por_vencer as
select
  'traslado' as proceso_tipo,
  t.id as proceso_id,
  t.cuenta_id,
  cv.placa,
  cv.numero_cuenta,
  t.ciudad_destino as ciudad,
  t.estado,
  t.fecha_vencimiento,
  t.fecha_vencimiento - current_date as dias_restantes,
  p.nombre_completo as responsable
from public.mov_traslados t
join public.mov_cuentas_vehiculos cv on t.cuenta_id = cv.id
join public.perfiles p on t.creado_por = p.id
where t.estado not in ('sin_asignar', 'trasladado', 'devuelto')
  and t.fecha_vencimiento <= current_date + interval '7 days'

union all

select
  'radicacion' as proceso_tipo,
  r.id as proceso_id,
  r.cuenta_id,
  cv.placa,
  cv.numero_cuenta,
  r.ciudad_origen as ciudad,
  r.estado,
  r.fecha_vencimiento,
  r.fecha_vencimiento - current_date as dias_restantes,
  p.nombre_completo as responsable
from public.mov_radicaciones r
join public.mov_cuentas_vehiculos cv on r.cuenta_id = cv.id
join public.perfiles p on r.creado_por = p.id
where r.estado not in ('sin_asignar', 'radicado', 'devuelto')
  and r.fecha_vencimiento <= current_date + interval '7 days'

order by dias_restantes asc;

-- Crear índices para historial
create index if not exists idx_mov_historial_cuenta on public.mov_historial_acciones(cuenta_id);
create index if not exists idx_mov_historial_proceso on public.mov_historial_acciones(proceso_tipo, proceso_id);
create index if not exists idx_mov_historial_accion on public.mov_historial_acciones(accion);
create index if not exists idx_mov_historial_realizado_por on public.mov_historial_acciones(realizado_por);
create index if not exists idx_mov_historial_creado_en on public.mov_historial_acciones(creado_en desc);
create index if not exists idx_mov_historial_detalles_gin on public.mov_historial_acciones using gin(detalles);

-- Función para registrar acción en historial
create or replace function registrar_historial(
  p_cuenta_id uuid,
  p_proceso_tipo text,
  p_proceso_id uuid,
  p_accion text,
  p_detalles jsonb default null,
  p_estado_anterior text default null,
  p_estado_nuevo text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  nuevo_id uuid;
begin
  insert into public.mov_historial_acciones (
    cuenta_id,
    proceso_tipo,
    proceso_id,
    accion,
    detalles,
    estado_anterior,
    estado_nuevo,
    realizado_por
  ) values (
    p_cuenta_id,
    p_proceso_tipo,
    p_proceso_id,
    p_accion,
    p_detalles,
    p_estado_anterior,
    p_estado_nuevo,
    auth.uid()
  )
  returning id into nuevo_id;

  return nuevo_id;
end;
$$;

-- Trigger para registrar creación de cuenta
create or replace function trigger_historial_cuenta_creada()
returns trigger
language plpgsql
security definer
as $$
begin
  perform registrar_historial(
    new.id,
    null,
    null,
    'cuenta_creada',
    jsonb_build_object(
      'placa', new.placa,
      'numero_cuenta', new.numero_cuenta,
      'tipo_servicio', new.tipo_servicio
    )
  );
  return new;
end;
$$;

drop trigger if exists after_insert_cuenta_historial on public.mov_cuentas_vehiculos;

create trigger after_insert_cuenta_historial
  after insert on public.mov_cuentas_vehiculos
  for each row
  execute function trigger_historial_cuenta_creada();

-- Trigger para registrar inicio de traslado
create or replace function trigger_historial_traslado_iniciado()
returns trigger
language plpgsql
security definer
as $$
begin
  perform registrar_historial(
    new.cuenta_id,
    'traslado',
    new.id,
    'traslado_iniciado',
    jsonb_build_object(
      'ciudad_destino', new.ciudad_destino,
      'fecha_tramite', new.fecha_tramite,
      'fecha_vencimiento', new.fecha_vencimiento
    ),
    null,
    new.estado
  );
  return new;
end;
$$;

drop trigger if exists after_insert_traslado_historial on public.mov_traslados;

create trigger after_insert_traslado_historial
  after insert on public.mov_traslados
  for each row
  execute function trigger_historial_traslado_iniciado();

-- Trigger para registrar inicio de radicación
create or replace function trigger_historial_radicacion_iniciada()
returns trigger
language plpgsql
security definer
as $$
begin
  perform registrar_historial(
    new.cuenta_id,
    'radicacion',
    new.id,
    'radicacion_iniciada',
    jsonb_build_object(
      'ciudad_origen', new.ciudad_origen,
      'fecha_tramite', new.fecha_tramite,
      'fecha_vencimiento', new.fecha_vencimiento
    ),
    null,
    new.estado
  );
  return new;
end;
$$;

drop trigger if exists after_insert_radicacion_historial on public.mov_radicaciones;

create trigger after_insert_radicacion_historial
  after insert on public.mov_radicaciones
  for each row
  execute function trigger_historial_radicacion_iniciada();

-- Trigger para registrar cambios de estado en traslados
create or replace function trigger_historial_estado_traslado()
returns trigger
language plpgsql
security definer
as $$
begin
  if old.estado != new.estado then
    perform registrar_historial(
      new.cuenta_id,
      'traslado',
      new.id,
      case
        when new.estado = 'trasladado' then 'proceso_completado'
        when new.estado = 'devuelto' then 'proceso_devuelto'
        else 'estado_cambiado'
      end,
      jsonb_build_object('observaciones', new.observaciones),
      old.estado,
      new.estado
    );
  end if;
  return new;
end;
$$;

drop trigger if exists after_update_traslado_historial on public.mov_traslados;

create trigger after_update_traslado_historial
  after update on public.mov_traslados
  for each row
  execute function trigger_historial_estado_traslado();

-- Trigger para registrar cambios de estado en radicaciones
create or replace function trigger_historial_estado_radicacion()
returns trigger
language plpgsql
security definer
as $$
begin
  if old.estado != new.estado then
    perform registrar_historial(
      new.cuenta_id,
      'radicacion',
      new.id,
      case
        when new.estado = 'radicado' then 'proceso_completado'
        when new.estado = 'devuelto' then 'proceso_devuelto'
        else 'estado_cambiado'
      end,
      jsonb_build_object('observaciones', new.observaciones),
      old.estado,
      new.estado
    );
  end if;
  return new;
end;
$$;

drop trigger if exists after_update_radicacion_historial on public.mov_radicaciones;

create trigger after_update_radicacion_historial
  after update on public.mov_radicaciones
  for each row
  execute function trigger_historial_estado_radicacion();

-- Habilitar Row Level Security
alter table public.mov_historial_acciones enable row level security;

-- Políticas de seguridad
create policy "Usuarios pueden ver todo el historial"
  on public.mov_historial_acciones for select
  using (true);

create policy "Solo el sistema puede insertar en historial"
  on public.mov_historial_acciones for insert
  with check (false); -- Solo triggers pueden insertar

-- Comentarios para documentación
comment on table public.mov_historial_acciones is 'Registro de auditoría de todas las acciones realizadas';
comment on column public.mov_historial_acciones.detalles is 'Información adicional en formato JSON';
comment on view public.mov_vista_proceso_activo is 'Muestra el proceso activo actual de cada cuenta';
comment on view public.mov_vista_resumen_novedades is 'Resumen estadístico de novedades por proceso';
comment on view public.mov_vista_procesos_por_vencer is 'Procesos que vencen en los próximos 7 días';
