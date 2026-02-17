drop trigger if exists before_update_empresa_transporte on public.mov_empresas_transporte;

CREATE TRIGGER before_update_empresa_transporte
  BEFORE UPDATE ON public.mov_empresas_transporte
  FOR EACH ROW
  EXECUTE FUNCTION trigger_actualizar_fecha();

drop trigger if exists before_insert_traslado on public.mov_traslados;

create trigger before_insert_traslado
  before insert on public.mov_traslados
  for each row
  execute function trigger_vencimiento_traslado();

drop trigger if exists before_insert_radicacion on public.mov_radicaciones;

create trigger before_insert_radicacion
  before insert on public.mov_radicaciones
  for each row
  execute function trigger_vencimiento_radicacion();

drop trigger if exists before_update_traslado on public.mov_traslados;
drop trigger if exists before_update_auto_actualizado_traslado on public.mov_traslados;
drop trigger if exists before_update_aprobar_traslado on public.mov_traslados;

create trigger before_update_auto_actualizado_traslado
  before update on public.mov_traslados
  for each row
  execute function trigger_auto_actualizado_por();

create trigger before_update_traslado
  before update on public.mov_traslados
  for each row
  execute function trigger_actualizar_fecha();

-- Trigger para calcular fecha de vencimiento al aprobar
create trigger before_update_aprobar_traslado
  before update on public.mov_traslados
  for each row
  execute function trigger_aprobar_traslado();

drop trigger if exists before_update_radicacion on public.mov_radicaciones;
drop trigger if exists before_update_auto_actualizado_radicacion on public.mov_radicaciones;

create trigger before_update_auto_actualizado_radicacion
  before update on public.mov_radicaciones
  for each row
  execute function trigger_auto_actualizado_por();

create trigger before_update_radicacion
  before update on public.mov_radicaciones
  for each row
  execute function trigger_actualizar_fecha();

drop trigger if exists before_update_estado_traslado on public.mov_traslados;
drop trigger if exists before_update_estado_radicacion on public.mov_radicaciones;

create trigger before_update_estado_traslado
  before update on public.mov_traslados
  for each row
  execute function trigger_marcar_completado();

create trigger before_update_estado_radicacion
  before update on public.mov_radicaciones
  for each row
  execute function trigger_marcar_completado();

drop trigger if exists after_insert_traslado_historial on public.mov_traslados;

create trigger after_insert_traslado_historial
  after insert on public.mov_traslados
  for each row
  execute function trigger_historial_traslado_iniciado();

drop trigger if exists after_insert_radicacion_historial on public.mov_radicaciones;

create trigger after_insert_radicacion_historial
  after insert on public.mov_radicaciones
  for each row
  execute function trigger_historial_radicacion_iniciada();

drop trigger if exists after_update_traslado_historial on public.mov_traslados;

create trigger after_update_traslado_historial
  after update on public.mov_traslados
  for each row
  execute function trigger_historial_estado_traslado();

drop trigger if exists after_update_radicacion_historial on public.mov_radicaciones;

create trigger after_update_radicacion_historial
  after update on public.mov_radicaciones
  for each row
  execute function trigger_historial_estado_radicacion();
