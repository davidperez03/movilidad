alter table public.mov_festivos_colombia enable row level security;

drop policy if exists "Todos pueden ver festivos" on public.mov_festivos_colombia;
drop policy if exists "Solo admins pueden modificar festivos" on public.mov_festivos_colombia;

create policy "Todos pueden ver festivos"
  on public.mov_festivos_colombia for select
  using (true);

create policy "Solo admins pueden modificar festivos"
  on public.mov_festivos_colombia for all
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'configurar')
  );
