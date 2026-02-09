-- RLS para la tabla de auditoría de parqueadero
-- Solo superadmins pueden ver; inserciones solo via triggers (SECURITY DEFINER)

alter table public.parq_historial_acciones enable row level security;

drop policy if exists "Solo superadmins pueden ver historial parqueadero" on public.parq_historial_acciones;
create policy "Solo superadmins pueden ver historial parqueadero"
  on public.parq_historial_acciones for select
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid() and rol_global = 'superadmin'
    )
  );

drop policy if exists "Solo sistema puede insertar historial parqueadero" on public.parq_historial_acciones;
create policy "Solo sistema puede insertar historial parqueadero"
  on public.parq_historial_acciones for insert
  with check (false);
