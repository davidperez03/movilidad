create or replace view public.mov_vista_resumen_novedades
with (security_invoker = true)
as
select
  n.proceso_tipo,
  n.proceso_id,
  count(*) as total_novedades,
  count(*) filter (where n.estado = 'pendiente') as pendientes,
  count(*) filter (where n.estado = 'en_revision') as en_revision,
  count(*) filter (where n.estado = 'resuelta') as resueltas,
  count(*) filter (where n.prioridad = 'critica') as criticas,
  count(*) filter (where n.prioridad = 'alta') as altas,
  max(n.creado_en) as ultima_novedad
from public.mov_novedades n
group by n.proceso_tipo, n.proceso_id;

comment on view public.mov_vista_resumen_novedades is 'Resumen estadístico de novedades por proceso';
