create or replace function es_dia_habil(fecha date)
returns boolean
language plpgsql
immutable
as $$
declare
  dia_semana integer;
begin
  dia_semana := extract(dow from fecha);

  if dia_semana = 0 or dia_semana = 6 then
    return false;
  end if;

  if exists (select 1 from public.mov_festivos_colombia where mov_festivos_colombia.fecha = es_dia_habil.fecha) then
    return false;
  end if;

  return true;
end;
$$;

create or replace function sumar_dias_habiles(
  fecha_inicio date,
  dias_habiles integer
)
returns date
language plpgsql
immutable
as $$
declare
  fecha_actual date;
  dias_contados integer;
begin
  fecha_actual := fecha_inicio;
  dias_contados := 0;

  while dias_contados < dias_habiles loop
    fecha_actual := fecha_actual + interval '1 day';

    if es_dia_habil(fecha_actual) then
      dias_contados := dias_contados + 1;
    end if;
  end loop;

  return fecha_actual;
end;
$$;

create or replace function contar_dias_habiles(
  fecha_inicio date,
  fecha_fin date
)
returns integer
language plpgsql
immutable
as $$
declare
  fecha_actual date;
  dias_contados integer;
begin
  if fecha_fin < fecha_inicio then
    return 0;
  end if;

  fecha_actual := fecha_inicio;
  dias_contados := 0;

  while fecha_actual < fecha_fin loop
    fecha_actual := fecha_actual + interval '1 day';

    if es_dia_habil(fecha_actual) then
      dias_contados := dias_contados + 1;
    end if;
  end loop;

  return dias_contados;
end;
$$;

comment on function es_dia_habil(date) is 'Verifica si una fecha es día hábil (no sábado, domingo ni festivo)';
comment on function sumar_dias_habiles(date, integer) is 'Suma N días hábiles a una fecha inicial';
comment on function contar_dias_habiles(date, date) is 'Cuenta días hábiles entre dos fechas';
