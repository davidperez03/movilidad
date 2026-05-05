create or replace view public.mov_vista_proceso_activo_detalle
with (security_invoker = true)
as
select
  vpa.*,
  coalesce(t.observaciones, r.observaciones) as observaciones,
  coalesce(t.actualizado_en, r.actualizado_en) as actualizado_en,
  coalesce(t.numero_guia, r.numero_guia) as numero_guia,
  coalesce(t.empresa_transportadora_id, r.empresa_transportadora_id) as empresa_transportadora_id,
  t.fecha_aprobacion,
  cp.nombre_completo as proceso_creador_nombre,
  up.nombre_completo as proceso_actualizador_nombre,
  et.id as empresa_transporte_id,
  et.nombre as empresa_transporte_nombre,
  nr.id as notificacion_radicacion_id,
  nr.solicitante_notificado as notificacion_solicitante_notificado,
  nr.notificado_en as notificacion_notificado_en,
  nr.observaciones as notificacion_observaciones
from public.mov_vista_proceso_activo vpa
left join public.mov_traslados t
  on vpa.proceso_tipo = 'traslado' and t.id = vpa.proceso_id
left join public.mov_radicaciones r
  on vpa.proceso_tipo = 'radicacion' and r.id = vpa.proceso_id
left join public.perfiles cp
  on coalesce(t.creado_por, r.creado_por) = cp.id
left join public.perfiles up
  on coalesce(t.actualizado_por, r.actualizado_por) = up.id
left join public.mov_empresas_transporte et
  on coalesce(t.empresa_transportadora_id, r.empresa_transportadora_id) = et.id
left join public.mov_notificaciones_radicacion nr
  on vpa.proceso_tipo = 'radicacion' and nr.radicacion_id = vpa.proceso_id;

comment on view public.mov_vista_proceso_activo_detalle
  is 'Proceso activo con detalles completos (campos proceso, usuarios, empresa, notificación) en una sola query';
