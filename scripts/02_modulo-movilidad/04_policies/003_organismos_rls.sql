alter table public.mov_organismos_transito enable row level security;

create policy "Todos pueden ver organismos activos"
  on public.mov_organismos_transito for select
  using (activo = true);

create policy "Solo administradores pueden modificar organismos"
  on public.mov_organismos_transito for all
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'configurar')
  );
