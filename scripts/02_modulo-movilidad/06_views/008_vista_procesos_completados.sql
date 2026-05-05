create or replace view public.mov_vista_procesos_completados
with (security_invoker = true)
as
select
  'traslado'::text as proceso_tipo,
  t.id as proceso_id,
  t.cuenta_id,
  cv.placa,
  cv.numero_cuenta,
  cv.tipo_servicio,
  t.estado,
  t.fecha_tramite,
  t.fecha_completado,
  ceil(extract(epoch from (t.fecha_completado - t.creado_en)) / 86400)::integer as duracion_dias,
  coalesce(ot.nombre, '') as organismo,
  coalesce(p.nombre_completo, '') as responsable,
  t.observaciones,
  t.creado_en
from public.mov_traslados t
join public.mov_cuentas_vehiculos cv on cv.id = t.cuenta_id
left join public.mov_organismos_transito ot on ot.id = t.organismo_destino_id
left join public.perfiles p on p.id = t.creado_por
where t.estado in ('trasladado', 'devuelto')
  and t.fecha_completado is not null

union all

select
  'radicacion'::text,
  r.id,
  r.cuenta_id,
  cv.placa,
  cv.numero_cuenta,
  cv.tipo_servicio,
  r.estado,
  r.fecha_tramite,
  r.fecha_completado,
  ceil(extract(epoch from (r.fecha_completado - r.creado_en)) / 86400)::integer,
  coalesce(ot.nombre, ''),
  coalesce(p.nombre_completo, ''),
  r.observaciones,
  r.creado_en
from public.mov_radicaciones r
join public.mov_cuentas_vehiculos cv on cv.id = r.cuenta_id
left join public.mov_organismos_transito ot on ot.id = r.organismo_origen_id
left join public.perfiles p on p.id = r.creado_por
where r.estado in ('radicado', 'devuelto')
  and r.fecha_completado is not null;

comment on view public.mov_vista_procesos_completados
  is 'UNION de traslados y radicaciones completadas con placa, organismo, responsable y duración';
