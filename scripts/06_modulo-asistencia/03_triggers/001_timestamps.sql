create or replace function public.asist_actualizar_timestamp()
returns trigger language plpgsql as $$
begin
  new.actualizado_en = now();
  return new;
end; $$;

create trigger asist_datos_empleado_actualizado_en
  before update on public.asist_datos_empleado
  for each row execute function public.asist_actualizar_timestamp();
