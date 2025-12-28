-- =====================================================
-- MÓDULO: MOVILIDAD
-- Archivo: 007_historial_completo.sql
-- Descripción: Funciones para obtener historial de procesos completados
-- =====================================================

-- Función para obtener el último proceso completado de cada vehículo
create or replace function obtener_ultimos_procesos_completados()
returns table (
  cuenta_id uuid,
  proceso_tipo text,
  proceso_id uuid,
  estado text,
  fecha_completado timestamp with time zone,
  organismo_nombre text,
  creado_por_nombre text
)
language sql
security definer
as $$
  -- Obtener últimos traslados completados
  with ultimos_traslados as (
    select distinct on (t.cuenta_id)
      t.cuenta_id,
      'traslado'::text as proceso_tipo,
      t.id as proceso_id,
      t.estado,
      t.fecha_completado,
      o.nombre as organismo_nombre,
      p.nombre_completo as creado_por_nombre,
      t.fecha_completado as orden_fecha
    from public.mov_traslados t
    join public.mov_organismos_transito o on t.organismo_destino_id = o.id
    join public.perfiles p on t.creado_por = p.id
    where t.estado in ('trasladado', 'devuelto')
      and t.fecha_completado is not null
    order by t.cuenta_id, t.fecha_completado desc
  ),
  -- Obtener últimas radicaciones completadas
  ultimas_radicaciones as (
    select distinct on (r.cuenta_id)
      r.cuenta_id,
      'radicacion'::text as proceso_tipo,
      r.id as proceso_id,
      r.estado,
      r.fecha_completado,
      o.nombre as organismo_nombre,
      p.nombre_completo as creado_por_nombre,
      r.fecha_completado as orden_fecha
    from public.mov_radicaciones r
    join public.mov_organismos_transito o on r.organismo_origen_id = o.id
    join public.perfiles p on r.creado_por = p.id
    where r.estado in ('radicado', 'devuelto')
      and r.fecha_completado is not null
    order by r.cuenta_id, r.fecha_completado desc
  )
  -- Combinar y seleccionar el más reciente por cuenta
  select distinct on (cuenta_id)
    cuenta_id,
    proceso_tipo,
    proceso_id,
    estado,
    fecha_completado,
    organismo_nombre,
    creado_por_nombre
  from (
    select * from ultimos_traslados
    union all
    select * from ultimas_radicaciones
  ) combinado
  order by cuenta_id, fecha_completado desc;
$$;

comment on function obtener_ultimos_procesos_completados is 'Obtiene el último proceso completado (traslado o radicación) de cada vehículo';

-- Función para obtener TODO el historial de procesos de un vehículo
create or replace function obtener_historial_procesos_vehiculo(p_cuenta_id uuid)
returns table (
  proceso_tipo text,
  proceso_id uuid,
  estado text,
  fecha_tramite date,
  fecha_completado timestamp with time zone,
  organismo_nombre text,
  creado_por_nombre text,
  observaciones text,
  creado_en timestamp with time zone
)
language sql
security definer
as $$
  -- Obtener todos los traslados
  select
    'traslado'::text as proceso_tipo,
    t.id as proceso_id,
    t.estado,
    t.fecha_tramite,
    t.fecha_completado,
    o.nombre as organismo_nombre,
    p.nombre_completo as creado_por_nombre,
    t.observaciones,
    t.creado_en
  from public.mov_traslados t
  join public.mov_organismos_transito o on t.organismo_destino_id = o.id
  join public.perfiles p on t.creado_por = p.id
  where t.cuenta_id = p_cuenta_id

  union all

  -- Obtener todas las radicaciones
  select
    'radicacion'::text as proceso_tipo,
    r.id as proceso_id,
    r.estado,
    r.fecha_tramite,
    r.fecha_completado,
    o.nombre as organismo_nombre,
    p.nombre_completo as creado_por_nombre,
    r.observaciones,
    r.creado_en
  from public.mov_radicaciones r
  join public.mov_organismos_transito o on r.organismo_origen_id = o.id
  join public.perfiles p on r.creado_por = p.id
  where r.cuenta_id = p_cuenta_id

  order by creado_en desc;
$$;

comment on function obtener_historial_procesos_vehiculo is 'Obtiene TODO el historial de procesos (traslados y radicaciones) de un vehículo específico';
