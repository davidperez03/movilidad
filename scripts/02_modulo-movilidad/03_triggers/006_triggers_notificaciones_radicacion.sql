drop trigger if exists before_update_auto_actualizado_notificacion_radicacion
  on public.mov_notificaciones_radicacion;
drop trigger if exists before_update_notificacion_radicacion
  on public.mov_notificaciones_radicacion;

create trigger before_update_auto_actualizado_notificacion_radicacion
  before update on public.mov_notificaciones_radicacion
  for each row
  execute function trigger_auto_actualizado_por();

create trigger before_update_notificacion_radicacion
  before update on public.mov_notificaciones_radicacion
  for each row
  execute function trigger_actualizar_fecha();
