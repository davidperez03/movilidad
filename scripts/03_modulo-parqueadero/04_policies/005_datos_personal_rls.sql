alter table public.parq_datos_personal enable row level security;

drop policy if exists "parq_datos_personal_select" on public.parq_datos_personal;
drop policy if exists "parq_datos_personal_insert" on public.parq_datos_personal;
drop policy if exists "parq_datos_personal_update" on public.parq_datos_personal;
drop policy if exists "parq_datos_personal_delete" on public.parq_datos_personal;

create policy "parq_datos_personal_select" on public.parq_datos_personal
  for select using (es_superadmin(auth.uid()) or tiene_acceso_modulo(auth.uid(), 'parqueadero'));
create policy "parq_datos_personal_insert" on public.parq_datos_personal
  for insert with check (es_superadmin(auth.uid()) or tiene_permiso(auth.uid(), 'parqueadero', 'gestionar_vehiculos'));
create policy "parq_datos_personal_update" on public.parq_datos_personal
  for update using (es_superadmin(auth.uid()) or tiene_permiso(auth.uid(), 'parqueadero', 'gestionar_vehiculos'));
create policy "parq_datos_personal_delete" on public.parq_datos_personal
  for delete using (es_superadmin(auth.uid()) or tiene_permiso(auth.uid(), 'parqueadero', 'gestionar_vehiculos'));
