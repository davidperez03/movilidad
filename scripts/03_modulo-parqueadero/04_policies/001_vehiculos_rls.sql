alter table public.parq_vehiculos enable row level security;

drop policy if exists "parq_vehiculos_select" on public.parq_vehiculos;
drop policy if exists "parq_vehiculos_insert" on public.parq_vehiculos;
drop policy if exists "parq_vehiculos_update" on public.parq_vehiculos;
drop policy if exists "parq_vehiculos_delete" on public.parq_vehiculos;

create policy "parq_vehiculos_select" on public.parq_vehiculos
  for select using (es_superadmin(auth.uid()) or tiene_acceso_modulo(auth.uid(), 'parqueadero'));
create policy "parq_vehiculos_insert" on public.parq_vehiculos
  for insert with check (es_superadmin(auth.uid()) or tiene_permiso(auth.uid(), 'parqueadero', 'gestionar_vehiculos'));
create policy "parq_vehiculos_update" on public.parq_vehiculos
  for update using (es_superadmin(auth.uid()) or tiene_permiso(auth.uid(), 'parqueadero', 'gestionar_vehiculos'));
create policy "parq_vehiculos_delete" on public.parq_vehiculos
  for delete using (es_superadmin(auth.uid()) or tiene_permiso(auth.uid(), 'parqueadero', 'gestionar_vehiculos'));
