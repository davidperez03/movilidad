alter table public.parq_inspecciones enable row level security;

drop policy if exists "parq_inspecciones_select" on public.parq_inspecciones;
drop policy if exists "parq_inspecciones_insert" on public.parq_inspecciones;
drop policy if exists "parq_inspecciones_update" on public.parq_inspecciones;
drop policy if exists "parq_inspecciones_delete" on public.parq_inspecciones;

create policy "parq_inspecciones_select" on public.parq_inspecciones
  for select using (es_superadmin(auth.uid()) or tiene_acceso_modulo(auth.uid(), 'parqueadero'));
create policy "parq_inspecciones_insert" on public.parq_inspecciones
  for insert with check (es_superadmin(auth.uid()) or tiene_permiso(auth.uid(), 'parqueadero', 'crear_inspecciones'));
create policy "parq_inspecciones_update" on public.parq_inspecciones
  for update using (es_superadmin(auth.uid()) or tiene_permiso(auth.uid(), 'parqueadero', 'editar_inspecciones'));
create policy "parq_inspecciones_delete" on public.parq_inspecciones
  for delete using (es_superadmin(auth.uid()) or tiene_permiso(auth.uid(), 'parqueadero', 'eliminar_inspecciones'));
