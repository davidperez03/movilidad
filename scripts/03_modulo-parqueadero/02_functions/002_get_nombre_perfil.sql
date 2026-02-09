create or replace function public.parq_get_nombre_perfil(perfil_id uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select nombre_completo from public.perfiles where id = perfil_id;
$$;

comment on function public.parq_get_nombre_perfil(uuid) is 'Obtiene el nombre completo de un perfil por su ID';
