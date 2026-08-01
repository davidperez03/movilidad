-- Migración 031: Eliminar módulo de turnos
-- Elimina tablas, vistas, triggers y columnas asociados al módulo parq_turnos.

-- 1. Eliminar vista de turnos
drop view if exists public.parq_vista_turnos;

-- 2. Eliminar vista de inspecciones que referencia parq_turnos y recrear sin el join
drop view if exists public.parq_vista_inspecciones;

create view public.parq_vista_inspecciones as
select
  i.id, i.consecutivo, i.fecha, i.hora, i.es_apto, i.observaciones, i.creado_en,
  i.km_inicio,
  v.id as vehiculo_id, v.placa, v.marca, v.modelo, v.tipo as vehiculo_tipo,
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
left join public.parq_datos_personal dp on dp.perfil_id = i.operador_id;

alter view public.parq_vista_inspecciones set (security_invoker = true);

-- 3. Eliminar columnas de inspecciones relacionadas con turnos
alter table public.parq_inspecciones
  drop column if exists turno_id,
  drop column if exists turno;

-- 4. Eliminar tablas de turnos (turno_novedades primero por FK)
drop table if exists public.parq_turno_novedades;
drop table if exists public.parq_turnos;
