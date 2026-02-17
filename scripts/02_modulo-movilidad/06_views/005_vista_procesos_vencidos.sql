drop view if exists public.mov_vista_procesos_vencidos;

create or replace view public.mov_vista_procesos_vencidos
with (security_invoker = true)
as
select
  procesos.proceso_tipo,
  procesos.proceso_id,
  procesos.cuenta_id,
  procesos.placa,
  procesos.numero_cuenta,
  procesos.ciudad,
  procesos.estado,
  procesos.fecha_vencimiento,
  procesos.dias_restantes,
  (current_date - procesos.fecha_vencimiento::date)::int as dias_vencidos,
  procesos.responsable,
  procesos.organismo_id
from (
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
    p.nombre_completo as responsable,
    t.organismo_destino_id as organismo_id
  from public.mov_traslados t
  join public.mov_cuentas_vehiculos cv on t.cuenta_id = cv.id
  join public.perfiles p on t.creado_por = p.id
  join public.mov_organismos_transito ot on t.organismo_destino_id = ot.id
  where t.estado not in ('trasladado', 'devuelto')
    and t.fecha_vencimiento is not null

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
    p.nombre_completo as responsable,
    r.organismo_origen_id as organismo_id
  from public.mov_radicaciones r
  join public.mov_cuentas_vehiculos cv on r.cuenta_id = cv.id
  join public.perfiles p on r.creado_por = p.id
  join public.mov_organismos_transito or_org on r.organismo_origen_id = or_org.id
  where r.estado not in ('radicado', 'devuelto')
    and r.fecha_vencimiento is not null
) procesos
where procesos.fecha_vencimiento::date < current_date;

comment on view public.mov_vista_procesos_vencidos is 'Procesos activos cuya fecha de vencimiento ya fue superada';
