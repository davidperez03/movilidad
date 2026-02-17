alter table public.mov_notificaciones_radicacion enable row level security;

drop policy if exists "Usuarios pueden ver notificaciones de radicacion"
  on public.mov_notificaciones_radicacion;
drop policy if exists "Crear notificaciones de radicacion segun permisos"
  on public.mov_notificaciones_radicacion;
drop policy if exists "Actualizar notificaciones de radicacion segun permisos"
  on public.mov_notificaciones_radicacion;
drop policy if exists "Eliminar notificaciones de radicacion segun permisos"
  on public.mov_notificaciones_radicacion;

create policy "Usuarios pueden ver notificaciones de radicacion"
  on public.mov_notificaciones_radicacion for select
  using (true);

create policy "Crear notificaciones de radicacion segun permisos"
  on public.mov_notificaciones_radicacion for insert
  with check (
    auth.uid() = creado_por
    and (
      es_superadmin(auth.uid())
      or tiene_permiso(auth.uid(), 'movilidad', 'editar_radicaciones')
    )
  );

create policy "Actualizar notificaciones de radicacion segun permisos"
  on public.mov_notificaciones_radicacion for update
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'editar_radicaciones')
  )
  with check (
    actualizado_por is null or auth.uid() = actualizado_por
  );

create policy "Eliminar notificaciones de radicacion segun permisos"
  on public.mov_notificaciones_radicacion for delete
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'eliminar_radicaciones')
  );
