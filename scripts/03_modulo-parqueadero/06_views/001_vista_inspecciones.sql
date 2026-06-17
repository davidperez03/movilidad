drop view if exists public.parq_vista_inspecciones;

create view public.parq_vista_inspecciones as
select
  i.id, i.consecutivo, i.fecha, i.hora, i.turno, i.es_apto, i.observaciones, i.creado_en,
  i.turno_id, i.km_inicio,
  -- KM final: viene del turno asociado
  t.km_fin,
  v.id as vehiculo_id, v.placa, v.marca, v.modelo, v.tipo as vehiculo_tipo,
  -- Documentos: usa snapshot si existe, sino datos actuales (retrocompatibilidad)
  coalesce(i.snapshot_soat_vencimiento, v.soat_vencimiento) as soat_vencimiento,
  coalesce(i.snapshot_tecnomecanica_vencimiento, v.tecnomecanica_vencimiento) as tecnomecanica_vencimiento,
  parq_estado_documento(coalesce(i.snapshot_soat_vencimiento, v.soat_vencimiento), i.fecha) as estado_soat,
  parq_estado_documento(coalesce(i.snapshot_tecnomecanica_vencimiento, v.tecnomecanica_vencimiento), i.fecha) as estado_tecnomecanica,
  i.operador_id,
  parq_get_nombre_perfil(i.operador_id) as operador_nombre,
  coalesce(i.snapshot_licencia_vencimiento, dp.licencia_vencimiento) as operador_licencia_vencimiento,
  coalesce(i.snapshot_licencia_categoria, dp.licencia_categoria) as operador_licencia_categoria,
  parq_estado_documento(coalesce(i.snapshot_licencia_vencimiento, dp.licencia_vencimiento), i.fecha) as operador_estado_licencia,
  i.auxiliar_id,
  parq_get_nombre_perfil(i.auxiliar_id) as auxiliar_nombre,
  i.inspector_id,
  parq_get_nombre_perfil(i.inspector_id) as inspector_nombre,
  (select count(*) from parq_items_inspeccion ii where ii.inspeccion_id = i.id and ii.estado = 'bueno') as items_buenos,
  (select count(*) from parq_items_inspeccion ii where ii.inspeccion_id = i.id and ii.estado = 'regular') as items_regulares,
  (select count(*) from parq_items_inspeccion ii where ii.inspeccion_id = i.id and ii.estado = 'malo') as items_malos
from public.parq_inspecciones i
join public.parq_vehiculos v on v.id = i.vehiculo_id
left join public.parq_datos_personal dp on dp.perfil_id = i.operador_id
left join public.parq_turnos t on t.id = i.turno_id;

alter view public.parq_vista_inspecciones set (security_invoker = true);

comment on view public.parq_vista_inspecciones is 'Vista consolidada de inspecciones con datos de vehiculo, operador, inspector, km_inicio y km_fin del turno (migration 027)';
