alter table public.mov_novedades enable row level security;
alter table public.mov_adjuntos_novedades enable row level security;

drop policy if exists "Usuarios pueden ver todas las novedades" on public.mov_novedades;
drop policy if exists "Crear novedades según permisos modulares" on public.mov_novedades;
drop policy if exists "Actualizar novedades según permisos modulares" on public.mov_novedades;
drop policy if exists "Eliminar novedades según permisos modulares" on public.mov_novedades;
drop policy if exists "Usuarios pueden ver adjuntos de novedades" on public.mov_adjuntos_novedades;
drop policy if exists "Subir adjuntos según permisos modulares" on public.mov_adjuntos_novedades;
drop policy if exists "Eliminar adjuntos según permisos modulares" on public.mov_adjuntos_novedades;

create policy "Usuarios pueden ver todas las novedades"
  on public.mov_novedades for select
  using (true);

create policy "Crear novedades según permisos modulares"
  on public.mov_novedades for insert
  with check (
    auth.uid() = creado_por
    and (
      es_superadmin(auth.uid())
      or tiene_permiso(auth.uid(), 'movilidad', 'gestionar_novedades')
    )
  );

create policy "Actualizar novedades según permisos modulares"
  on public.mov_novedades for update
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'gestionar_novedades')
    or (auth.uid() = creado_por and tiene_permiso(auth.uid(), 'movilidad', 'ver'))
  );

create policy "Eliminar novedades según permisos modulares"
  on public.mov_novedades for delete
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'eliminar_novedades')
  );

create policy "Usuarios pueden ver adjuntos de novedades"
  on public.mov_adjuntos_novedades for select
  using (true);

create policy "Subir adjuntos según permisos modulares"
  on public.mov_adjuntos_novedades for insert
  with check (
    auth.uid() = subido_por
    and (
      es_superadmin(auth.uid())
      or tiene_permiso(auth.uid(), 'movilidad', 'gestionar_novedades')
    )
  );

create policy "Eliminar adjuntos según permisos modulares"
  on public.mov_adjuntos_novedades for delete
  using (
    es_superadmin(auth.uid())
    or auth.uid() = subido_por
    or tiene_permiso(auth.uid(), 'movilidad', 'gestionar_novedades')
  );
