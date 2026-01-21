drop trigger if exists before_insert_validar_traslado on public.mov_traslados;
drop trigger if exists before_insert_validar_radicacion on public.mov_radicaciones;

create trigger before_insert_validar_traslado
  before insert on public.mov_traslados
  for each row
  execute function validar_proceso_unico();

create trigger before_insert_validar_radicacion
  before insert on public.mov_radicaciones
  for each row
  execute function validar_proceso_unico();

drop trigger if exists before_insert_validar_secuencia_traslado on public.mov_traslados;
drop trigger if exists before_insert_validar_secuencia_radicacion on public.mov_radicaciones;

create trigger before_insert_validar_secuencia_traslado
  before insert on public.mov_traslados
  for each row
  execute function validar_secuencia_procesos();

create trigger before_insert_validar_secuencia_radicacion
  before insert on public.mov_radicaciones
  for each row
  execute function validar_secuencia_procesos();

drop trigger if exists before_update_validar_estado_traslado on public.mov_traslados;
drop trigger if exists before_update_validar_estado_radicacion on public.mov_radicaciones;

create trigger before_update_validar_estado_traslado
  before update on public.mov_traslados
  for each row
  when (old.estado is distinct from new.estado)
  execute function validar_transicion_estado();

create trigger before_update_validar_estado_radicacion
  before update on public.mov_radicaciones
  for each row
  when (old.estado is distinct from new.estado)
  execute function validar_transicion_estado();

drop trigger if exists before_update_validar_no_finalizado_traslado on public.mov_traslados;
drop trigger if exists before_update_validar_no_finalizado_radicacion on public.mov_radicaciones;

create trigger before_update_validar_no_finalizado_traslado
  before update on public.mov_traslados
  for each row
  execute function validar_proceso_no_finalizado();

create trigger before_update_validar_no_finalizado_radicacion
  before update on public.mov_radicaciones
  for each row
  execute function validar_proceso_no_finalizado();
