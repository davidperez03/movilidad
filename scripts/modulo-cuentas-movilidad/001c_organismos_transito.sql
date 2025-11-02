-- =====================================================
-- MÓDULO: CUENTAS DE MOVILIDAD
-- Archivo: 001c_organismos_transito.sql
-- Descripción: Tabla de organismos de tránsito de Colombia (RUNT)
-- Ejecutar después de: 001b_festivos_dias_habiles.sql
-- Ejecutar antes de: 002_procesos_schema.sql
-- =====================================================

-- Crear tabla de organismos de tránsito
create table if not exists public.mov_organismos_transito (
  id uuid primary key default gen_random_uuid(),

  -- Datos del organismo
  nombre text not null,
  tipo text not null,
  telefono text,
  direccion text,
  municipio text not null,
  departamento text not null,

  -- Índice de búsqueda de texto completo
  search_vector tsvector,

  -- Control
  activo boolean not null default true,

  -- Metadatos
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null,
  actualizado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear índices para búsquedas
create index if not exists idx_mov_organismos_nombre on public.mov_organismos_transito(nombre);
create index if not exists idx_mov_organismos_departamento on public.mov_organismos_transito(departamento);
create index if not exists idx_mov_organismos_municipio on public.mov_organismos_transito(municipio);
create index if not exists idx_mov_organismos_activo on public.mov_organismos_transito(activo);
create index if not exists idx_mov_organismos_search on public.mov_organismos_transito using gin(search_vector);

-- Función para actualizar el vector de búsqueda
create or replace function update_organismo_search_vector()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('spanish', coalesce(new.nombre, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(new.municipio, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(new.departamento, '')), 'C');
  return new;
end;
$$;

-- Trigger para actualizar el vector de búsqueda
drop trigger if exists trigger_update_organismo_search on public.mov_organismos_transito;

create trigger trigger_update_organismo_search
  before insert or update on public.mov_organismos_transito
  for each row
  execute function update_organismo_search_vector();

-- Trigger para actualizar fecha de actualización
create trigger before_update_organismo
  before update on public.mov_organismos_transito
  for each row
  execute function trigger_actualizar_fecha();

-- Habilitar Row Level Security
alter table public.mov_organismos_transito enable row level security;

-- Políticas de seguridad
create policy "Todos pueden ver organismos activos"
  on public.mov_organismos_transito for select
  using (activo = true);

create policy "Solo administradores pueden modificar organismos"
  on public.mov_organismos_transito for all
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid()
      and rol = 'administrador'
    )
  );

-- Comentarios para documentación
comment on table public.mov_organismos_transito is 'Organismos de tránsito registrados en el RUNT de Colombia';
comment on column public.mov_organismos_transito.search_vector is 'Vector de búsqueda de texto completo para búsquedas rápidas por nombre, municipio o departamento';

-- NOTA: Los datos se cargan desde runt/organismos_transito.json
-- Total: 293 organismos de tránsito
