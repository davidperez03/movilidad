create or replace function public.parq_tiene_rol(user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.usuarios_roles
    where usuario_id = user_id
    and modulo_id = 'parqueadero'
  );
$$;

comment on function public.parq_tiene_rol(uuid) is 'Verifica si un usuario tiene algún rol en el módulo parqueadero';
