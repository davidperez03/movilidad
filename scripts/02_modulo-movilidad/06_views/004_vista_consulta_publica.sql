create or replace view public.mov_vista_consulta_publica
with (security_invoker = true)
as
with procesos as (
  select
    cv.id as cuenta_id,
    cv.placa,
    cv.numero_cuenta,
    cv.tipo_servicio,
    'traslado'::text as proceso_tipo,
    t.id as proceso_id,
    t.estado as proceso_estado,
    t.fecha_tramite,
    t.fecha_vencimiento,
    t.fecha_completado,
    case
      when t.fecha_completado is null and t.fecha_vencimiento is not null
      then contar_dias_habiles(current_date, t.fecha_vencimiento::date)
      else null
    end as dias_restantes,
    ot.nombre as ciudad,
    t.observaciones,
    et.nombre as empresa_transporte,
    t.numero_guia,
    t.creado_en as proceso_creado_en,
    null::boolean as solicitante_notificado,
    null::timestamp with time zone as notificado_en
  from public.mov_cuentas_vehiculos cv
  join public.mov_traslados t on cv.id = t.cuenta_id
  left join public.mov_organismos_transito ot on t.organismo_destino_id = ot.id
  left join public.mov_empresas_transporte et on et.id = t.empresa_transportadora_id

  union all

  select
    cv.id as cuenta_id,
    cv.placa,
    cv.numero_cuenta,
    cv.tipo_servicio,
    'radicacion'::text as proceso_tipo,
    r.id as proceso_id,
    r.estado as proceso_estado,
    r.fecha_tramite,
    r.fecha_vencimiento,
    r.fecha_completado,
    case
      when r.fecha_completado is null and r.fecha_vencimiento is not null
      then contar_dias_habiles(current_date, r.fecha_vencimiento::date)
      else null
    end as dias_restantes,
    or_org.nombre as ciudad,
    r.observaciones,
    et.nombre as empresa_transporte,
    r.numero_guia,
    r.creado_en as proceso_creado_en,
    nr.solicitante_notificado,
    nr.notificado_en
  from public.mov_cuentas_vehiculos cv
  join public.mov_radicaciones r on cv.id = r.cuenta_id
  left join public.mov_organismos_transito or_org on r.organismo_origen_id = or_org.id
  left join public.mov_notificaciones_radicacion nr on nr.radicacion_id = r.id
  left join public.mov_empresas_transporte et on et.id = r.empresa_transportadora_id
)
select distinct on (p.cuenta_id)
  p.placa,
  p.numero_cuenta,
  p.tipo_servicio,
  p.proceso_tipo,
  p.proceso_id,
  p.proceso_estado,
  p.fecha_tramite,
  p.fecha_vencimiento,
  p.fecha_completado,
  p.dias_restantes,
  p.ciudad,
  p.observaciones,
  p.empresa_transporte,
  p.numero_guia,
  p.proceso_creado_en,
  p.solicitante_notificado,
  p.notificado_en
from procesos p
order by p.cuenta_id, p.proceso_creado_en desc, p.proceso_id desc;

grant select on public.mov_vista_consulta_publica to anon;
grant select on public.mov_vista_consulta_publica to authenticated;
grant select on public.mov_vista_consulta_publica to public;

comment on view public.mov_vista_consulta_publica is 'Vista pública con información del último proceso realizado por vehículo (traslado o radicación), incluyendo estados finales y observaciones';
