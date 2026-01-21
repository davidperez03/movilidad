drop trigger if exists before_insert_cuenta on public.mov_cuentas_vehiculos;

create trigger before_insert_cuenta
  before insert on public.mov_cuentas_vehiculos
  for each row
  execute function trigger_generar_numero_cuenta();

drop trigger if exists before_update_cuenta on public.mov_cuentas_vehiculos;

create trigger before_update_cuenta
  before update on public.mov_cuentas_vehiculos
  for each row
  execute function trigger_actualizar_fecha();

drop trigger if exists after_insert_cuenta_historial on public.mov_cuentas_vehiculos;

create trigger after_insert_cuenta_historial
  after insert on public.mov_cuentas_vehiculos
  for each row
  execute function trigger_historial_cuenta_creada();
