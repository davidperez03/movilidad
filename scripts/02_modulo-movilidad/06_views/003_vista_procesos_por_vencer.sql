create or replace view public.mov_vista_procesos_por_vencer
with (security_invoker = true)
as
select
  'traslado' as proceso_tipo,
  t.id as proceso_id,
  t.cuenta_id,
  cv.placa,
  cv.numero_cuenta,
  ot.nombre as ciudad,
  t.estado,
  t.fecha_vencimiento,
  contar_dias_habiles(current_date, t.fecha_vencimiento::date) as dias_restantes,
  p.nombre_completo as responsable
from public.mov_traslados t
join public.mov_cuentas_vehiculos cv on t.cuenta_id = cv.id
join public.perfiles p on t.creado_por = p.id
join public.mov_organismos_transito ot on t.organismo_destino_id = ot.id
where t.estado not in ('sin_asignar', 'trasladado', 'devuelto')
  and contar_dias_habiles(current_date, t.fecha_vencimiento::date) <= 7

union all

select
  'radicacion' as proceso_tipo,
  r.id as proceso_id,
  r.cuenta_id,
  cv.placa,
  cv.numero_cuenta,
  or_org.nombre as ciudad,
  r.estado,
  r.fecha_vencimiento,
  contar_dias_habiles(current_date, r.fecha_vencimiento::date) as dias_restantes,
  p.nombre_completo as responsable
from public.mov_radicaciones r
join public.mov_cuentas_vehiculos cv on r.cuenta_id = cv.id
join public.perfiles p on r.creado_por = p.id
join public.mov_organismos_transito or_org on r.organismo_origen_id = or_org.id
where r.estado not in ('sin_asignar', 'radicado', 'devuelto')
  and contar_dias_habiles(current_date, r.fecha_vencimiento::date) <= 7

order by dias_restantes asc;

comment on view public.mov_vista_procesos_por_vencer is 'Procesos que vencen en los próximos 7 días';
