alter table public.parq_turnos          enable row level security;
alter table public.parq_turno_novedades enable row level security;

create policy "Autenticados gestionan parq_turnos"
  on public.parq_turnos for all to authenticated using (true) with check (true);

create policy "Autenticados gestionan parq_turno_novedades"
  on public.parq_turno_novedades for all to authenticated using (true) with check (true);
