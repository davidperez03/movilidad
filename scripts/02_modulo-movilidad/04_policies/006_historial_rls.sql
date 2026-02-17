alter table public.mov_historial_acciones enable row level security;

drop policy if exists "Usuarios pueden ver todo el historial" on public.mov_historial_acciones;
drop policy if exists "Solo el sistema puede insertar en historial" on public.mov_historial_acciones;

create policy "Usuarios pueden ver todo el historial"
  on public.mov_historial_acciones for select
  using (true);

create policy "Solo el sistema puede insertar en historial"
  on public.mov_historial_acciones for insert
  with check (false); -- Solo triggers pueden insertar
