create or replace view public.parq_vista_turnos as
  select
    t.id,
    t.tipo_turno,
    t.fecha,
    t.hora_inicio,
    t.hora_fin,
    t.km_fin,
    t.estado,
    t.creado_en,
    v.id    as vehiculo_id,
    v.placa,
    v.marca,
    v.modelo,
    (select i.km_inicio from public.parq_inspecciones i
     where i.turno_id = t.id and i.km_inicio is not null
     order by i.creado_en asc limit 1) as km_inicio,
    t.km_fin - (select i.km_inicio from public.parq_inspecciones i
                where i.turno_id = t.id and i.km_inicio is not null
                order by i.creado_en asc limit 1) as km_recorridos,
    extract(epoch from (t.hora_fin - t.hora_inicio)) / 3600.0 as horas_brutas,
    coalesce((select sum(extract(epoch from (n.hora_fin - n.hora_inicio)) / 3600.0)
              from public.parq_turno_novedades n
              where n.turno_id = t.id and n.hora_fin is not null), 0) as horas_novedades,
    case when t.hora_fin is not null then
      extract(epoch from (t.hora_fin - t.hora_inicio)) / 3600.0
      - coalesce((select sum(extract(epoch from (n.hora_fin - n.hora_inicio)) / 3600.0)
                  from public.parq_turno_novedades n
                  where n.turno_id = t.id and n.hora_fin is not null), 0)
    else null end as horas_operadas,
    (select count(*) from public.parq_inspecciones i where i.turno_id = t.id) as total_inspecciones,
    (select string_agg(distinct parq_get_nombre_perfil(i.operador_id), ', ')
     from public.parq_inspecciones i where i.turno_id = t.id) as operadores
  from public.parq_turnos t
  join public.parq_vehiculos v on v.id = t.vehiculo_id
  order by t.fecha desc, t.hora_inicio desc;

alter view public.parq_vista_turnos set (security_invoker = true);
