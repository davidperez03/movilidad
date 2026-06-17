create table if not exists public.parq_datos_personal (
  perfil_id uuid primary key references public.perfiles(id) on delete cascade,
  licencia_numero varchar(30),
  licencia_categoria varchar(10) check (licencia_categoria is null or licencia_categoria in ('A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3')),
  licencia_vencimiento date,
  licencia_restricciones text,
  telefono varchar(20),
  contacto_emergencia varchar(255),
  telefono_emergencia varchar(20),
  observaciones text,
  creado_en timestamptz default now() not null,
  actualizado_en timestamptz default now() not null
);
-- documento_tipo y documento_numero viven en public.perfiles (migration 026)

create index if not exists idx_parq_datos_personal_licencia on public.parq_datos_personal(licencia_vencimiento);

comment on table public.parq_datos_personal is 'Datos adicionales del personal de parqueadero (licencia, contacto, etc)';
