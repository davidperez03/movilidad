
create or replace view public.mov_vista_consulta_publica as
select distinct on (cv.id)
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
    when coalesce(t.fecha_completado, r.fecha_completado) is null
      and coalesce(t.fecha_vencimiento, r.fecha_vencimiento) is not null
    then contar_dias_habiles(current_date, coalesce(t.fecha_vencimiento, r.fecha_vencimiento)::date)
    else null
  end as dias_restantes,
  case
    when t.id is not null then ot.nombre
    when r.id is not null then or_org.nombre
    else null
  end as ciudad,
  coalesce(t.observaciones, r.observaciones) as observaciones,
  coalesce(t.creado_en, r.creado_en) as proceso_creado_en
from public.mov_cuentas_vehiculos cv
left join public.mov_traslados t on cv.id = t.cuenta_id
left join public.mov_radicaciones r on cv.id = r.cuenta_id
left join public.mov_organismos_transito ot on t.organismo_destino_id = ot.id
left join public.mov_organismos_transito or_org on r.organismo_origen_id = or_org.id
where t.id is not null or r.id is not null
order by cv.id, coalesce(t.creado_en, r.creado_en) desc;

grant select on public.mov_vista_consulta_publica to anon;
grant select on public.mov_vista_consulta_publica to authenticated;
grant select on public.mov_vista_consulta_publica to public;

comment on view public.mov_vista_consulta_publica is 'Vista pública con información completa para consultas externas incluyendo estados finales y observaciones';
