create or replace function public.parq_turno_actualizar_timestamp()
returns trigger language plpgsql as $$
begin new.actualizado_en = now(); return new; end; $$;

create trigger parq_turnos_actualizado_en
  before update on public.parq_turnos
  for each row execute function public.parq_turno_actualizar_timestamp();
