alter table public.mov_empresas_transporte enable row level security;
alter table public.mov_traslados enable row level security;
alter table public.mov_radicaciones enable row level security;

CREATE POLICY "Usuarios pueden ver empresas de transporte"
  ON public.mov_empresas_transporte FOR SELECT
  USING (true);

CREATE POLICY "Crear empresas de transporte según permisos"
  ON public.mov_empresas_transporte FOR INSERT
  WITH CHECK (
    es_superadmin(auth.uid())
    OR tiene_permiso(auth.uid(), 'movilidad', 'editar_traslados')
  );

CREATE POLICY "Actualizar empresas de transporte según permisos"
  ON public.mov_empresas_transporte FOR UPDATE
  USING (
    es_superadmin(auth.uid())
    OR tiene_permiso(auth.uid(), 'movilidad', 'editar_traslados')
  );

create policy "Usuarios pueden ver todos los traslados"
  on public.mov_traslados for select
  using (true);

create policy "Crear traslados según permisos modulares"
  on public.mov_traslados for insert
  with check (
    auth.uid() = creado_por
    and (
      es_superadmin(auth.uid())
      or tiene_permiso(auth.uid(), 'movilidad', 'crear_traslados')
    )
  );

create policy "Actualizar traslados según permisos modulares"
  on public.mov_traslados for update
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'editar_traslados')
    or (auth.uid() = creado_por and tiene_permiso(auth.uid(), 'movilidad', 'ver'))
  )
  with check (
    actualizado_por is null or auth.uid() = actualizado_por
  );

create policy "Eliminar traslados según permisos modulares"
  on public.mov_traslados for delete
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'eliminar_traslados')
  );

create policy "Usuarios pueden ver todas las radicaciones"
  on public.mov_radicaciones for select
  using (true);

create policy "Crear radicaciones según permisos modulares"
  on public.mov_radicaciones for insert
  with check (
    auth.uid() = creado_por
    and (
      es_superadmin(auth.uid())
      or tiene_permiso(auth.uid(), 'movilidad', 'crear_radicaciones')
    )
  );

create policy "Actualizar radicaciones según permisos modulares"
  on public.mov_radicaciones for update
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'editar_radicaciones')
    or (auth.uid() = creado_por and tiene_permiso(auth.uid(), 'movilidad', 'ver'))
  )
  with check (
    actualizado_por is null or auth.uid() = actualizado_por
  );

create policy "Eliminar radicaciones según permisos modulares"
  on public.mov_radicaciones for delete
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'eliminar_radicaciones')
  );

drop policy if exists "Acceso público de lectura a traslados" on public.mov_traslados;
create policy "Acceso público de lectura a traslados"
  on public.mov_traslados for select
  using (true); -- Permite ver todos los estados

drop policy if exists "Acceso público de lectura a radicaciones" on public.mov_radicaciones;
create policy "Acceso público de lectura a radicaciones"
  on public.mov_radicaciones for select
  using (true); -- Permite ver todos los estados
