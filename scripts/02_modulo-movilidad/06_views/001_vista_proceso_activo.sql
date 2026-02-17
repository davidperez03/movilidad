create or replace view public.mov_vista_proceso_activo
with (security_invoker = true)
as
with procesos as (
  select
    cv.id as cuenta_id,
    cv.placa,
    cv.numero_cuenta,
    cv.tipo_servicio,
    t.id as traslado_id,
    t.estado as traslado_estado,
    t.fecha_tramite as traslado_fecha_tramite,
    t.fecha_vencimiento as traslado_fecha_vencimiento,
    t.fecha_completado as traslado_fecha_completado,
    t.organismo_destino_id as traslado_organismo_id,
    t.creado_en as traslado_creado_en,
    r.id as radicacion_id,
    r.estado as radicacion_estado,
    r.fecha_tramite as radicacion_fecha_tramite,
    r.fecha_vencimiento as radicacion_fecha_vencimiento,
    r.fecha_completado as radicacion_fecha_completado,
    r.organismo_origen_id as radicacion_organismo_id,
    r.creado_en as radicacion_creado_en
  from public.mov_cuentas_vehiculos cv
  left join lateral (
    select
      t.id,
      t.estado,
      t.fecha_tramite,
      t.fecha_vencimiento,
      t.fecha_completado,
      t.organismo_destino_id,
      t.creado_en
    from public.mov_traslados t
    where t.cuenta_id = cv.id
      and t.estado not in ('trasladado', 'devuelto')
    order by t.creado_en desc nulls last
    limit 1
  ) t on true
  left join lateral (
    select
      r.id,
      r.estado,
      r.fecha_tramite,
      r.fecha_vencimiento,
      r.fecha_completado,
      r.organismo_origen_id,
      r.creado_en
    from public.mov_radicaciones r
    where r.cuenta_id = cv.id
      and r.estado not in ('radicado', 'devuelto')
    order by r.creado_en desc nulls last
    limit 1
  ) r on true
),
seleccion as (
  select
    p.cuenta_id,
    p.placa,
    p.numero_cuenta,
    p.tipo_servicio,
    case
      when p.traslado_id is not null
           and (p.radicacion_id is null or p.traslado_creado_en >= p.radicacion_creado_en) then 'traslado'
      when p.radicacion_id is not null then 'radicacion'
      else null
    end as proceso_tipo,
    case
      when p.traslado_id is not null
           and (p.radicacion_id is null or p.traslado_creado_en >= p.radicacion_creado_en) then p.traslado_id
      when p.radicacion_id is not null then p.radicacion_id
      else null
    end as proceso_id,
    case
      when p.traslado_id is not null
           and (p.radicacion_id is null or p.traslado_creado_en >= p.radicacion_creado_en) then p.traslado_estado
      when p.radicacion_id is not null then p.radicacion_estado
      else null
    end as proceso_estado,
    case
      when p.traslado_id is not null
           and (p.radicacion_id is null or p.traslado_creado_en >= p.radicacion_creado_en) then p.traslado_fecha_tramite
      when p.radicacion_id is not null then p.radicacion_fecha_tramite
      else null
    end as fecha_tramite,
    case
      when p.traslado_id is not null
           and (p.radicacion_id is null or p.traslado_creado_en >= p.radicacion_creado_en) then p.traslado_fecha_vencimiento
      when p.radicacion_id is not null then p.radicacion_fecha_vencimiento
      else null
    end as fecha_vencimiento,
    case
      when p.traslado_id is not null
           and (p.radicacion_id is null or p.traslado_creado_en >= p.radicacion_creado_en) then p.traslado_fecha_completado
      when p.radicacion_id is not null then p.radicacion_fecha_completado
      else null
    end as fecha_completado,
    case
      when p.traslado_id is not null
           and (p.radicacion_id is null or p.traslado_creado_en >= p.radicacion_creado_en) then p.traslado_organismo_id
      when p.radicacion_id is not null then p.radicacion_organismo_id
      else null
    end as organismo_id,
    case
      when p.traslado_id is not null
           and (p.radicacion_id is null or p.traslado_creado_en >= p.radicacion_creado_en) then p.traslado_creado_en
      when p.radicacion_id is not null then p.radicacion_creado_en
      else null
    end as proceso_creado_en
  from procesos p
)
select
  s.cuenta_id,
  s.placa,
  s.numero_cuenta,
  s.tipo_servicio,
  s.proceso_tipo,
  s.proceso_id,
  s.proceso_estado,
  s.fecha_tramite,
  s.fecha_vencimiento,
  s.fecha_completado,
  case
    when s.fecha_completado is null and s.fecha_vencimiento is not null
    then contar_dias_habiles(current_date, s.fecha_vencimiento::date)
    else null
  end as dias_restantes,
  ot.nombre as ciudad,
  s.organismo_id,
  s.proceso_creado_en
from seleccion s
left join public.mov_organismos_transito ot on s.organismo_id = ot.id;

comment on view public.mov_vista_proceso_activo is 'Muestra el proceso activo actual de cada cuenta';
