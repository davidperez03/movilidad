-- Triggers de auditoría para el módulo de parqueadero
-- Conectan las funciones de 02_functions/004_auditoria.sql con las tablas

-- Vehículo creado
create or replace trigger trg_parq_vehiculo_creado
  after insert on public.parq_vehiculos
  for each row
  execute function trigger_parq_vehiculo_creado();

-- Vehículo editado / activado / desactivado
create or replace trigger trg_parq_vehiculo_editado
  after update on public.parq_vehiculos
  for each row
  execute function trigger_parq_vehiculo_editado();

-- Inspección preoperacional creada
create or replace trigger trg_parq_inspeccion_creada
  after insert on public.parq_inspecciones
  for each row
  execute function trigger_parq_inspeccion_creada();

-- Novedad subsanada (item de inspección resuelto)
create or replace trigger trg_parq_novedad_subsanada
  after update on public.parq_items_inspeccion
  for each row
  when (old.subsanado is distinct from new.subsanado and new.subsanado = true)
  execute function trigger_parq_novedad_subsanada();

-- Datos de personal creados o actualizados
create or replace trigger trg_parq_personal_actualizado
  after insert or update on public.parq_datos_personal
  for each row
  execute function trigger_parq_personal_actualizado();
