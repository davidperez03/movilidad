-- Registros de ingreso y salida por QR (migration 026)
create table if not exists public.asist_registros (
  id          uuid        default gen_random_uuid() primary key,
  usuario_id  uuid        not null references public.perfiles(id) on delete cascade,
  tipo        text        not null check (tipo in ('INGRESO', 'SALIDA')),
  timestamp   timestamptz not null default now(),
  punto       text        not null default 'entrada-principal',
  user_agent  text
);

create index if not exists idx_asist_registros_usuario_id on public.asist_registros(usuario_id);
create index if not exists idx_asist_registros_timestamp  on public.asist_registros(timestamp desc);
create index if not exists idx_asist_registros_usuario_ts on public.asist_registros(usuario_id, timestamp desc);

comment on table public.asist_registros is 'Registros de ingreso y salida del personal de parqueadero, generados por escaneo de QR fijo en la entrada.';
