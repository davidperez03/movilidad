create or replace function trigger_vencimiento_traslado()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.fecha_vencimiento := sumar_dias_habiles(new.fecha_tramite::date, 60);
  return new;
end;
$$;

create or replace function trigger_vencimiento_radicacion()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.fecha_vencimiento := sumar_dias_habiles(new.fecha_tramite::date, 60);
  return new;
end;
$$;

create or replace function trigger_auto_actualizado_por()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.actualizado_por is null then
    new.actualizado_por := auth.uid();
  end if;
  return new;
end;
$$;

create or replace function trigger_marcar_completado()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_table_name = 'mov_traslados' and new.estado = 'trasladado' and old.estado != 'trasladado' then
    new.fecha_completado := now();
  end if;

  if tg_table_name = 'mov_radicaciones' and new.estado = 'radicado' and old.estado != 'radicado' then
    new.fecha_completado := now();
  end if;

  return new;
end;
$$;

COMMENT ON FUNCTION trigger_vencimiento_traslado() IS
  'Trigger function que calcula automáticamente la fecha de vencimiento sumando 60 días hábiles a la fecha de trámite al crear un traslado';

COMMENT ON FUNCTION trigger_vencimiento_radicacion() IS
  'Trigger function que calcula automáticamente la fecha de vencimiento sumando 60 días hábiles a la fecha de trámite al crear una radicación';

COMMENT ON FUNCTION trigger_auto_actualizado_por() IS
  'Trigger function que asigna automáticamente el usuario actual al campo actualizado_por si no viene especificado';

COMMENT ON FUNCTION trigger_marcar_completado() IS
  'Trigger function que registra automáticamente la fecha de completado cuando el estado cambia a "trasladado" o "radicado"';
