alter table public.parq_items_inspeccion enable row level security;

drop policy if exists "parq_items_inspeccion_select" on public.parq_items_inspeccion;
drop policy if exists "parq_items_inspeccion_all" on public.parq_items_inspeccion;

create policy "parq_items_inspeccion_select" on public.parq_items_inspeccion
  for select using (es_superadmin(auth.uid()) or tiene_acceso_modulo(auth.uid(), 'parqueadero'));
create policy "parq_items_inspeccion_all" on public.parq_items_inspeccion
  for all using (es_superadmin(auth.uid()) or tiene_permiso(auth.uid(), 'parqueadero', 'crear_inspecciones'));
