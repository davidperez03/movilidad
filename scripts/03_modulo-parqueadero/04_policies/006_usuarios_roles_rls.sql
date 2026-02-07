do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'usuarios_roles'
    and policyname = 'Usuarios parqueadero pueden ver roles parqueadero'
  ) then
    create policy "Usuarios parqueadero pueden ver roles parqueadero" on public.usuarios_roles
      for select using (modulo_id = 'parqueadero' and parq_tiene_rol(auth.uid()));
  end if;
end $$;
