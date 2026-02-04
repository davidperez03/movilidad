create or replace function public.parq_actualizar_timestamp()
returns trigger language plpgsql as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

drop trigger if exists tr_parq_vehiculos_ts on public.parq_vehiculos;
drop trigger if exists tr_parq_items_catalogo_ts on public.parq_items_catalogo;
drop trigger if exists tr_parq_inspecciones_ts on public.parq_inspecciones;
drop trigger if exists tr_parq_datos_personal_ts on public.parq_datos_personal;

create trigger tr_parq_vehiculos_ts before update on public.parq_vehiculos
  for each row execute function public.parq_actualizar_timestamp();

create trigger tr_parq_items_catalogo_ts before update on public.parq_items_catalogo
  for each row execute function public.parq_actualizar_timestamp();

create trigger tr_parq_inspecciones_ts before update on public.parq_inspecciones
  for each row execute function public.parq_actualizar_timestamp();

create trigger tr_parq_datos_personal_ts before update on public.parq_datos_personal
  for each row execute function public.parq_actualizar_timestamp();

-- Función para generar consecutivo de inspección (YYYY-MM-DD-NNN)
create or replace function public.parq_generar_consecutivo()
returns trigger language plpgsql as $$
declare
  v_fecha text;
  v_secuencia int;
  v_consecutivo text;
begin
  -- Formato de fecha
  v_fecha := to_char(new.fecha, 'YYYY-MM-DD');

  -- Obtener siguiente secuencia del día
  select coalesce(max(
    nullif(split_part(consecutivo, '-', 4), '')::int
  ), 0) + 1
  into v_secuencia
  from public.parq_inspecciones
  where fecha = new.fecha;

  -- Generar consecutivo
  v_consecutivo := v_fecha || '-' || lpad(v_secuencia::text, 3, '0');

  new.consecutivo := v_consecutivo;
  return new;
end;
$$;

drop trigger if exists tr_parq_inspecciones_consecutivo on public.parq_inspecciones;
create trigger tr_parq_inspecciones_consecutivo before insert on public.parq_inspecciones
  for each row execute function public.parq_generar_consecutivo();
