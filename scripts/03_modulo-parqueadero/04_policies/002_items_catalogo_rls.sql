alter table public.parq_items_catalogo enable row level security;

drop policy if exists "parq_items_catalogo_select" on public.parq_items_catalogo;
drop policy if exists "parq_items_catalogo_all" on public.parq_items_catalogo;

create policy "parq_items_catalogo_select" on public.parq_items_catalogo
  for select using (es_superadmin(auth.uid()) or tiene_acceso_modulo(auth.uid(), 'parqueadero'));
create policy "parq_items_catalogo_all" on public.parq_items_catalogo
  for all using (es_superadmin(auth.uid()) or tiene_permiso(auth.uid(), 'parqueadero', 'configurar'));
