-- Función para manejar la creación de nuevos usuarios
create or replace function public.manejar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, correo, nombre_completo, rol)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nombre_completo', ''),
    coalesce(new.raw_user_meta_data ->> 'rol', 'usuario')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger para crear automáticamente el perfil al registrarse un usuario
drop trigger if exists al_crear_usuario_auth on auth.users;

create trigger al_crear_usuario_auth
  after insert on auth.users
  for each row
  execute function public.manejar_nuevo_usuario();
