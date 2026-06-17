-- Whitelist de personal habilitado para asistencia por QR (migration 026)
-- PIN = ultimos 4 digitos del documento_numero en perfiles
create table if not exists public.asist_datos_empleado (
  perfil_id      uuid        primary key references public.perfiles(id) on delete cascade,
  pin_hash       text        not null,
  creado_en      timestamptz default now() not null,
  actualizado_en timestamptz default now() not null
);

comment on table public.asist_datos_empleado is 'PIN de acceso rapido por QR para el sistema de asistencia. Solo aplica a personal de parqueadero.';
