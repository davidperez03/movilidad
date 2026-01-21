drop trigger if exists before_update_novedad on public.mov_novedades;

create trigger before_update_novedad
  before update on public.mov_novedades
  for each row
  execute function trigger_actualizar_fecha();

drop trigger if exists before_update_estado_novedad on public.mov_novedades;

create trigger before_update_estado_novedad
  before update on public.mov_novedades
  for each row
  execute function trigger_marcar_resolucion();

drop trigger if exists after_insert_update_novedad on public.mov_novedades;

create trigger after_insert_update_novedad
  after insert or update on public.mov_novedades
  for each row
  execute function trigger_actualizar_estado_proceso();
