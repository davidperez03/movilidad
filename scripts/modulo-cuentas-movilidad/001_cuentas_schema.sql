-- =====================================================
-- MÓDULO: CUENTAS DE MOVILIDAD
-- Archivo: 001_cuentas_schema.sql
-- Descripción: Esquema para cuentas de vehículos
-- =====================================================

-- Crear tabla de cuentas de vehículos
create table if not exists public.mov_cuentas_vehiculos (
  id uuid primary key default gen_random_uuid(),

  -- Datos del vehículo
  placa text not null unique,
  numero_cuenta text not null unique,
  tipo_servicio text not null check (tipo_servicio in ('particular', 'publico', 'otro')),

  -- Metadatos
  creado_por uuid not null references public.perfiles(id) on delete restrict,
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null,
  actualizado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear índices
create index if not exists idx_mov_cuentas_placa on public.mov_cuentas_vehiculos(placa);
create index if not exists idx_mov_cuentas_numero on public.mov_cuentas_vehiculos(numero_cuenta);
create index if not exists idx_mov_cuentas_creado_por on public.mov_cuentas_vehiculos(creado_por);
create index if not exists idx_mov_cuentas_creado_en on public.mov_cuentas_vehiculos(creado_en desc);

-- Crear función para generar número de cuenta automático
create or replace function generar_numero_cuenta()
returns text
language plpgsql
as $$
declare
  fecha_actual text;
  consecutivo integer;
  numero_generado text;
begin
  -- Obtener fecha actual en formato YYYYMMDD
  fecha_actual := to_char(current_date, 'YYYYMMDD');

  -- Obtener el último consecutivo del día
  select coalesce(max(
    cast(substring(numero_cuenta from 10) as integer)
  ), 0) + 1
  into consecutivo
  from public.mov_cuentas_vehiculos
  where numero_cuenta like fecha_actual || '-%';

  -- Generar número con formato YYYYMMDD-XXXXX
  numero_generado := fecha_actual || '-' || lpad(consecutivo::text, 5, '0');

  return numero_generado;
end;
$$;

-- Crear trigger para auto-generar número de cuenta
create or replace function trigger_generar_numero_cuenta()
returns trigger
language plpgsql
as $$
begin
  if new.numero_cuenta is null or new.numero_cuenta = '' then
    new.numero_cuenta := generar_numero_cuenta();
  end if;
  return new;
end;
$$;

drop trigger if exists before_insert_cuenta on public.mov_cuentas_vehiculos;

create trigger before_insert_cuenta
  before insert on public.mov_cuentas_vehiculos
  for each row
  execute function trigger_generar_numero_cuenta();

-- Crear trigger para actualizar fecha de actualización
create or replace function trigger_actualizar_fecha()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists before_update_cuenta on public.mov_cuentas_vehiculos;

create trigger before_update_cuenta
  before update on public.mov_cuentas_vehiculos
  for each row
  execute function trigger_actualizar_fecha();

-- Habilitar Row Level Security
alter table public.mov_cuentas_vehiculos enable row level security;

-- Políticas de seguridad
create policy "Todos pueden ver cuentas"
  on public.mov_cuentas_vehiculos for select
  using (true);

create policy "Los usuarios pueden crear cuentas"
  on public.mov_cuentas_vehiculos for insert
  with check (auth.uid() = creado_por);

create policy "Los creadores pueden actualizar sus cuentas"
  on public.mov_cuentas_vehiculos for update
  using (auth.uid() = creado_por);

create policy "Los administradores pueden eliminar cuentas"
  on public.mov_cuentas_vehiculos for delete
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid()
      and rol = 'administrador'
    )
  );

-- Comentarios para documentación
comment on table public.mov_cuentas_vehiculos is 'Almacena las cuentas de vehículos para gestión de movilidad';
comment on column public.mov_cuentas_vehiculos.placa is 'Placa del vehículo (única)';
comment on column public.mov_cuentas_vehiculos.numero_cuenta is 'Número de cuenta generado automáticamente (YYYYMMDD-XXXXX)';
comment on column public.mov_cuentas_vehiculos.tipo_servicio is 'Tipo de servicio: particular, publico, otro';
