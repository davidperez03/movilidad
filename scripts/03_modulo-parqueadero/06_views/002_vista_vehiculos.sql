drop view if exists public.parq_vista_vehiculos;

create view public.parq_vista_vehiculos as
select
  v.*,
  parq_estado_documento(v.soat_vencimiento) as estado_soat,
  parq_estado_documento(v.tecnomecanica_vencimiento) as estado_tecnomecanica,
  (select count(*) from parq_inspecciones i where i.vehiculo_id = v.id) as total_inspecciones,
  (select max(fecha) from parq_inspecciones i where i.vehiculo_id = v.id) as ultima_inspeccion
from public.parq_vehiculos v;

alter view public.parq_vista_vehiculos set (security_invoker = true);

comment on view public.parq_vista_vehiculos is 'Vista de vehículos con estado de documentos y estadísticas';
