drop trigger if exists trigger_update_organismo_search on public.mov_organismos_transito;
drop trigger if exists before_update_organismo on public.mov_organismos_transito;

create trigger trigger_update_organismo_search
  before insert or update on public.mov_organismos_transito
  for each row
  execute function update_organismo_search_vector();

create trigger before_update_organismo
  before update on public.mov_organismos_transito
  for each row
  execute function trigger_actualizar_fecha();
