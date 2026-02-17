-- RPC que consolida todos los contadores del dashboard en una sola llamada
-- Evita 5+ queries secuenciales desde el app

create or replace function obtener_contadores_movilidad()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'traslados_activos', (
      select count(*) from public.mov_traslados
      where estado not in ('trasladado', 'devuelto')
    ),
    'radicaciones_activas', (
      select count(*) from public.mov_radicaciones
      where estado not in ('radicado', 'devuelto')
    ),
    'novedades_pendientes', (
      select count(*) from public.mov_novedades
      where estado != 'resuelta'
    ),
    'activos', (
      select count(*) from public.mov_vista_proceso_activo
      where proceso_tipo is not null
    ),
    'por_vencer', (
      select count(*) from public.mov_vista_procesos_por_vencer
    ),
    'vencidos', (
      select count(*) from public.mov_vista_procesos_vencidos
    ),
    'completados_30d', (
      select (
        select count(*) from public.mov_traslados
        where estado = 'trasladado'
          and fecha_completado >= (current_date - interval '30 days')
      ) + (
        select count(*) from public.mov_radicaciones
        where estado = 'radicado'
          and fecha_completado >= (current_date - interval '30 days')
      )
    )
  );
$$;

comment on function obtener_contadores_movilidad is 'Consolida todos los contadores del dashboard de movilidad en una sola llamada para evitar múltiples queries';
