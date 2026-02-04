-- Versión sin fecha de referencia (usa fecha actual)
create or replace function public.parq_estado_documento(fecha_venc date)
returns text
language sql
stable
as $$
  select case
    when fecha_venc is null then 'sin_datos'
    when fecha_venc < current_date then 'vencido'
    when fecha_venc <= current_date + 30 then 'por_vencer'
    else 'vigente'
  end;
$$;

comment on function public.parq_estado_documento(date) is 'Calcula el estado de un documento según su fecha de vencimiento (relativo a hoy)';

-- Versión con fecha de referencia (para historial)
create or replace function public.parq_estado_documento(fecha_venc date, fecha_ref date)
returns text
language sql
immutable
as $$
  select case
    when fecha_venc is null then 'sin_datos'
    when fecha_venc < fecha_ref then 'vencido'
    when fecha_venc <= fecha_ref + 30 then 'por_vencer'
    else 'vigente'
  end;
$$;

comment on function public.parq_estado_documento(date, date) is 'Calcula el estado de un documento según su fecha de vencimiento relativo a una fecha de referencia';
