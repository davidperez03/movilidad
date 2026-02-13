create or replace function es_dia_habil(fecha date)
returns boolean
language plpgsql
stable
set search_path = public
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
stable
set search_path = public
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
stable
set search_path = public
as $$
declare
  inicio date;
  fin date;
  dias_totales integer;
  semanas integer;
  resto integer;
  dow_inicio integer;
  i integer;
  dias_semana integer := 0;
  festivos integer := 0;
  resultado integer := 0;
begin
  if fecha_fin = fecha_inicio then
    return 0;
  end if;

  -- Para fecha_fin > fecha_inicio contamos días hábiles en (fecha_inicio, fecha_fin].
  -- Para fecha_fin < fecha_inicio contamos en [fecha_fin, fecha_inicio) y luego negamos.
  if fecha_fin > fecha_inicio then
    inicio := fecha_inicio + 1;
    fin := fecha_fin;
  else
    inicio := fecha_fin;
    fin := fecha_inicio - 1;
  end if;

  if fin >= inicio then
    dias_totales := (fin - inicio) + 1;
    semanas := dias_totales / 7;
    resto := dias_totales % 7;
    dow_inicio := extract(isodow from inicio)::integer;

    dias_semana := semanas * 5;

    if resto > 0 then
      for i in 0..(resto - 1) loop
        if (((dow_inicio + i - 1) % 7) + 1) <= 5 then
          dias_semana := dias_semana + 1;
        end if;
      end loop;
    end if;

    select count(distinct f.fecha)::integer
    into festivos
    from public.mov_festivos_colombia f
    where f.fecha between inicio and fin
      and extract(isodow from f.fecha) <= 5;

    resultado := greatest(dias_semana - festivos, 0);
  end if;

  if fecha_fin > fecha_inicio then
    return resultado;
  end if;

  -- Si ya venció por fecha calendario pero no hubo día hábil intermedio,
  -- devolvemos -1 para evitar mostrar "0 días".
  if resultado = 0 then
    return -1;
  end if;

  return -resultado;
end;
$$;

comment on function es_dia_habil(date) is 'Verifica si una fecha es día hábil (no sábado, domingo ni festivo)';
comment on function sumar_dias_habiles(date, integer) is 'Suma N días hábiles a una fecha inicial';
comment on function contar_dias_habiles(date, date) is 'Cuenta días hábiles entre dos fechas';
