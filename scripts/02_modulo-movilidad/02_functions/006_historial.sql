create or replace function registrar_historial(
  p_cuenta_id uuid,
  p_proceso_tipo text,
  p_proceso_id uuid,
  p_accion text,
  p_detalles jsonb default null,
  p_estado_anterior text default null,
  p_estado_nuevo text default null,
  p_realizado_por uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  nuevo_id uuid;
  v_realizado_por uuid;
begin
  v_realizado_por := coalesce(p_realizado_por, auth.uid());

  if v_realizado_por is null then
    raise exception 'No se puede registrar historial sin usuario. Proporciona p_realizado_por o asegúrate de que auth.uid() esté disponible.';
  end if;

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
    v_realizado_por
  )
  returning id into nuevo_id;

  return nuevo_id;
end;
$$;

create or replace function trigger_historial_cuenta_creada()
returns trigger
language plpgsql
security definer
set search_path = public
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
    ),
    null,
    null,
    new.creado_por
  );
  return new;
end;
$$;

create or replace function trigger_historial_traslado_iniciado()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_placa text;
begin
  select placa into v_placa from public.mov_cuentas_vehiculos where id = new.cuenta_id;

  perform registrar_historial(
    new.cuenta_id,
    'traslado',
    new.id,
    'traslado_iniciado',
    jsonb_build_object(
      'placa', v_placa,
      'organismo_destino_id', new.organismo_destino_id,
      'fecha_tramite', new.fecha_tramite,
      'fecha_vencimiento', new.fecha_vencimiento
    ),
    null,
    new.estado
  );
  return new;
end;
$$;

create or replace function trigger_historial_radicacion_iniciada()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_placa text;
begin
  select placa into v_placa from public.mov_cuentas_vehiculos where id = new.cuenta_id;

  perform registrar_historial(
    new.cuenta_id,
    'radicacion',
    new.id,
    'radicacion_iniciada',
    jsonb_build_object(
      'placa', v_placa,
      'organismo_origen_id', new.organismo_origen_id,
      'fecha_tramite', new.fecha_tramite,
      'fecha_vencimiento', new.fecha_vencimiento
    ),
    null,
    new.estado
  );
  return new;
end;
$$;

create or replace function trigger_historial_estado_traslado()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_placa text;
begin
  if old.estado != new.estado then
    select placa into v_placa from public.mov_cuentas_vehiculos where id = new.cuenta_id;

    perform registrar_historial(
      new.cuenta_id,
      'traslado',
      new.id,
      case
        when new.estado = 'trasladado' then 'proceso_completado'
        when new.estado = 'devuelto' then 'proceso_devuelto'
        else 'estado_cambiado'
      end,
      jsonb_build_object(
        'placa', v_placa,
        'observaciones', new.observaciones
      ),
      old.estado,
      new.estado
    );
  end if;
  return new;
end;
$$;

create or replace function trigger_historial_estado_radicacion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_placa text;
begin
  if old.estado != new.estado then
    select placa into v_placa from public.mov_cuentas_vehiculos where id = new.cuenta_id;

    perform registrar_historial(
      new.cuenta_id,
      'radicacion',
      new.id,
      case
        when new.estado = 'radicado' then 'proceso_completado'
        when new.estado = 'devuelto' then 'proceso_devuelto'
        else 'estado_cambiado'
      end,
      jsonb_build_object(
        'placa', v_placa,
        'observaciones', new.observaciones
      ),
      old.estado,
      new.estado
    );
  end if;
  return new;
end;
$$;

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
set search_path = public
as $$
  with ultimos_traslados as (
    select distinct on (t.cuenta_id)
      t.cuenta_id,
      'traslado'::text as proceso_tipo,
      t.id as proceso_id,
      t.estado,
      t.fecha_completado,
      o.nombre as organismo_nombre,
      p.nombre_completo as creado_por_nombre,
      coalesce(t.fecha_completado, t.creado_en) as orden_fecha
    from public.mov_traslados t
    join public.mov_organismos_transito o on t.organismo_destino_id = o.id
    join public.perfiles p on t.creado_por = p.id
    where t.estado in ('trasladado', 'devuelto')
    order by t.cuenta_id, coalesce(t.fecha_completado, t.creado_en) desc
  ),
  ultimas_radicaciones as (
    select distinct on (r.cuenta_id)
      r.cuenta_id,
      'radicacion'::text as proceso_tipo,
      r.id as proceso_id,
      r.estado,
      r.fecha_completado,
      o.nombre as organismo_nombre,
      p.nombre_completo as creado_por_nombre,
      coalesce(r.fecha_completado, r.creado_en) as orden_fecha
    from public.mov_radicaciones r
    join public.mov_organismos_transito o on r.organismo_origen_id = o.id
    join public.perfiles p on r.creado_por = p.id
    where r.estado in ('radicado', 'devuelto')
    order by r.cuenta_id, coalesce(r.fecha_completado, r.creado_en) desc
  )
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
set search_path = public
as $$
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
