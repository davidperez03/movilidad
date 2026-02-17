alter table public.mov_cuentas_vehiculos enable row level security;

drop policy if exists "Todos pueden ver cuentas" on public.mov_cuentas_vehiculos;
drop policy if exists "Crear cuentas según permisos modulares" on public.mov_cuentas_vehiculos;
drop policy if exists "Actualizar cuentas según permisos modulares" on public.mov_cuentas_vehiculos;
drop policy if exists "Eliminar cuentas según permisos modulares" on public.mov_cuentas_vehiculos;

create policy "Todos pueden ver cuentas"
  on public.mov_cuentas_vehiculos for select
  using (tiene_acceso_modulo(auth.uid(), 'movilidad'));

create policy "Crear cuentas según permisos modulares"
  on public.mov_cuentas_vehiculos for insert
  with check (
    auth.uid() = creado_por
    and (
      es_superadmin(auth.uid())
      or tiene_permiso(auth.uid(), 'movilidad', 'crear_cuentas')
    )
  );

create policy "Actualizar cuentas según permisos modulares"
  on public.mov_cuentas_vehiculos for update
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'editar_cuentas')
    or (auth.uid() = creado_por and tiene_permiso(auth.uid(), 'movilidad', 'ver'))
  );

create policy "Eliminar cuentas según permisos modulares"
  on public.mov_cuentas_vehiculos for delete
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'eliminar_cuentas')
  );
