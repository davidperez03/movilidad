create or replace function public.consultar_vehiculo_por_placa(p_placa text)
returns table (
  placa text,
  numero_cuenta text,
  tipo_servicio text,
  proceso_tipo text,
  proceso_estado text,
  fecha_tramite date,
  fecha_vencimiento date,
  fecha_completado timestamp with time zone,
  dias_restantes integer,
  ciudad text,
  observaciones text
)
language plpgsql
security definer
stable
as $$
begin
  return query
  select
    v.placa,
    v.numero_cuenta,
    v.tipo_servicio,
    v.proceso_tipo,
    v.proceso_estado,
    v.fecha_tramite::date,
    v.fecha_vencimiento::date,
    v.fecha_completado,
    v.dias_restantes,
    v.ciudad,
    v.observaciones
  from public.mov_vista_consulta_publica v
  where upper(v.placa) = upper(p_placa)
  limit 1;
end;
$$;

grant execute on function public.consultar_vehiculo_por_placa(text) to anon;
grant execute on function public.consultar_vehiculo_por_placa(text) to authenticated;
grant execute on function public.consultar_vehiculo_por_placa(text) to public;

comment on function public.consultar_vehiculo_por_placa(text) is 'Función pública para consultar estado completo de vehículo por placa, incluyendo observaciones';
