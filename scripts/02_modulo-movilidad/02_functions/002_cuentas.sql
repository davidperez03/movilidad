create or replace function generar_numero_cuenta()
returns text
language plpgsql
set search_path = public
as $$
declare
  fecha_actual text;
  consecutivo integer;
  numero_generado text;
begin
  fecha_actual := to_char(current_date, 'YYYYMMDD');

  -- Prevenir race condition en generación de número de cuenta
  PERFORM pg_advisory_xact_lock(hashtext('generar_numero_cuenta'));

  select coalesce(max(
    cast(substring(numero_cuenta from 10) as integer)
  ), 0) + 1
  into consecutivo
  from public.mov_cuentas_vehiculos
  where numero_cuenta like fecha_actual || '-%';

  numero_generado := fecha_actual || '-' || lpad(consecutivo::text, 5, '0');

  return numero_generado;
end;
$$;

create or replace function trigger_generar_numero_cuenta()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.numero_cuenta is null or new.numero_cuenta = '' then
    new.numero_cuenta := generar_numero_cuenta();
  end if;
  return new;
end;
$$;

create or replace function trigger_actualizar_fecha()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;
