drop view if exists public.parq_vista_alertas_vencimientos;

create view public.parq_vista_alertas_vencimientos as
select 'vehiculo' as tipo, v.id as entidad_id, v.placa as identificador, 'SOAT' as documento,
  v.soat_vencimiento as fecha_vencimiento, parq_estado_documento(v.soat_vencimiento) as estado
from public.parq_vehiculos v
where v.activo and v.soat_vencimiento is not null and v.soat_vencimiento <= current_date + 30
union all
select 'vehiculo', v.id, v.placa, 'Tecnomecánica',
  v.tecnomecanica_vencimiento, parq_estado_documento(v.tecnomecanica_vencimiento)
from public.parq_vehiculos v
where v.activo and v.tecnomecanica_vencimiento is not null and v.tecnomecanica_vencimiento <= current_date + 30
union all
select 'operador', p.id, p.nombre_completo, 'Licencia ' || coalesce(dp.licencia_categoria, ''),
  dp.licencia_vencimiento, parq_estado_documento(dp.licencia_vencimiento)
from public.parq_datos_personal dp
join public.perfiles p on p.id = dp.perfil_id
where dp.licencia_vencimiento is not null and dp.licencia_vencimiento <= current_date + 30
order by fecha_vencimiento;

alter view public.parq_vista_alertas_vencimientos set (security_invoker = true);

comment on view public.parq_vista_alertas_vencimientos is 'Alertas de documentos próximos a vencer o vencidos';
