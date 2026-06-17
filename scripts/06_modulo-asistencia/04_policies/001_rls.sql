alter table public.asist_datos_empleado enable row level security;
alter table public.asist_registros       enable row level security;

create policy "Autenticados gestionan asist_datos_empleado"
  on public.asist_datos_empleado for all to authenticated using (true) with check (true);

create policy "Autenticados leen asist_registros"
  on public.asist_registros for select to authenticated using (true);

create policy "Autenticados insertan asist_registros"
  on public.asist_registros for insert to authenticated with check (true);
