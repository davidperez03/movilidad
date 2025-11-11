-- =====================================================
-- MÓDULO: CUENTAS DE MOVILIDAD
-- Archivo: 003_novedades_schema.sql
-- Descripción: Esquema para novedades y adjuntos
-- =====================================================

-- Crear tabla de novedades
create table if not exists public.mov_novedades (
  id uuid primary key default gen_random_uuid(),

  -- Relación con el proceso (puede ser traslado o radicación)
  proceso_tipo text not null check (proceso_tipo in ('traslado', 'radicacion')),
  proceso_id uuid not null,

  -- Datos de la novedad
  tipo_novedad text not null check (tipo_novedad in (
    'documentos_faltantes',
    'documentos_incorrectos',
    'placa_incorrecta',
    'otro'
  )),
  descripcion text not null,
  prioridad text not null default 'media' check (prioridad in (
    'baja', 'media', 'alta', 'critica'
  )),
  estado text not null default 'pendiente' check (estado in (
    'pendiente',
    'en_revision',
    'resuelta'
  )),

  -- Resolución
  solucion text,
  resuelta_por uuid references public.perfiles(id) on delete set null,
  resuelta_en timestamp with time zone,

  -- Metadatos
  creado_por uuid not null references public.perfiles(id) on delete restrict,
  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null
);

-- Crear tabla de adjuntos de novedades
create table if not exists public.mov_adjuntos_novedades (
  id uuid primary key default gen_random_uuid(),

  -- Relación con novedad
  novedad_id uuid not null references public.mov_novedades(id) on delete cascade,

  -- Datos del archivo
  nombre_archivo text not null,
  url_archivo text not null,
  tamano_archivo integer,
  tipo_archivo text,

  -- Metadatos
  subido_por uuid not null references public.perfiles(id) on delete restrict,
  creado_en timestamp with time zone default now() not null
);

-- Crear índices para novedades
create index if not exists idx_mov_novedades_proceso on public.mov_novedades(proceso_tipo, proceso_id);
create index if not exists idx_mov_novedades_estado on public.mov_novedades(estado);
create index if not exists idx_mov_novedades_prioridad on public.mov_novedades(prioridad);
create index if not exists idx_mov_novedades_creado_por on public.mov_novedades(creado_por);
create index if not exists idx_mov_novedades_creado_en on public.mov_novedades(creado_en desc);

-- Crear índices para adjuntos
create index if not exists idx_mov_adjuntos_novedades_novedad on public.mov_adjuntos_novedades(novedad_id);
create index if not exists idx_mov_adjuntos_novedades_subido_por on public.mov_adjuntos_novedades(subido_por);

-- Trigger para actualizar fecha de actualización
drop trigger if exists before_update_novedad on public.mov_novedades;

create trigger before_update_novedad
  before update on public.mov_novedades
  for each row
  execute function trigger_actualizar_fecha();

-- Trigger para marcar fecha de resolución
create or replace function trigger_marcar_resolucion()
returns trigger
language plpgsql
as $$
begin
  if new.estado = 'resuelta' and old.estado != 'resuelta' then
    new.resuelta_en := now();
    if new.resuelta_por is null then
      new.resuelta_por := auth.uid();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists before_update_estado_novedad on public.mov_novedades;

create trigger before_update_estado_novedad
  before update on public.mov_novedades
  for each row
  execute function trigger_marcar_resolucion();

-- Trigger para actualizar estado del proceso cuando hay novedades
create or replace function trigger_actualizar_estado_proceso()
returns trigger
language plpgsql
as $$
declare
  tiene_pendientes boolean;
begin
  -- Si se crea una novedad nueva y está pendiente
  if tg_op = 'INSERT' and new.estado != 'resuelta' then
    -- Actualizar estado del proceso a "con_novedades"
    if new.proceso_tipo = 'traslado' then
      update public.mov_traslados
      set estado = 'con_novedades'
      where id = new.proceso_id and estado not in ('trasladado', 'devuelto');
    elsif new.proceso_tipo = 'radicacion' then
      update public.mov_radicaciones
      set estado = 'con_novedades'
      where id = new.proceso_id and estado not in ('radicado', 'devuelto');
    end if;
  end if;

  -- Si se actualiza una novedad a resuelta, verificar si quedan pendientes
  if tg_op = 'UPDATE' and new.estado = 'resuelta' and old.estado != 'resuelta' then
    -- Verificar si hay más novedades pendientes
    select exists(
      select 1 from public.mov_novedades
      where proceso_tipo = new.proceso_tipo
      and proceso_id = new.proceso_id
      and estado != 'resuelta'
      and id != new.id
    ) into tiene_pendientes;

    -- Si no hay más novedades pendientes, cambiar estado a revisado
    if not tiene_pendientes then
      if new.proceso_tipo = 'traslado' then
        update public.mov_traslados
        set estado = 'revisado'
        where id = new.proceso_id and estado = 'con_novedades';
      elsif new.proceso_tipo = 'radicacion' then
        update public.mov_radicaciones
        set estado = 'revisado'
        where id = new.proceso_id and estado = 'con_novedades';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists after_insert_update_novedad on public.mov_novedades;

create trigger after_insert_update_novedad
  after insert or update on public.mov_novedades
  for each row
  execute function trigger_actualizar_estado_proceso();

-- Habilitar Row Level Security
alter table public.mov_novedades enable row level security;
alter table public.mov_adjuntos_novedades enable row level security;

-- Políticas de seguridad para novedades
create policy "Usuarios pueden ver todas las novedades"
  on public.mov_novedades for select
  using (true);

create policy "Usuarios pueden crear novedades"
  on public.mov_novedades for insert
  with check (auth.uid() = creado_por);

create policy "Actualizar novedades según permisos modulares"
  on public.mov_novedades for update
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'gestionar_novedades')
    or (auth.uid() = creado_por and tiene_permiso(auth.uid(), 'movilidad', 'ver'))
  );

create policy "Eliminar novedades según permisos modulares"
  on public.mov_novedades for delete
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'eliminar_novedades')
  );

-- Políticas de seguridad para adjuntos de novedades
create policy "Usuarios pueden ver adjuntos de novedades"
  on public.mov_adjuntos_novedades for select
  using (true);

create policy "Usuarios pueden subir adjuntos a novedades"
  on public.mov_adjuntos_novedades for insert
  with check (auth.uid() = subido_por);

create policy "Eliminar adjuntos según permisos modulares"
  on public.mov_adjuntos_novedades for delete
  using (
    es_superadmin(auth.uid())
    or auth.uid() = subido_por
    or tiene_permiso(auth.uid(), 'movilidad', 'gestionar_novedades')
  );

-- Comentarios para documentación
comment on table public.mov_novedades is 'Problemas o incidencias encontradas durante los procesos';
comment on column public.mov_novedades.proceso_tipo is 'Tipo de proceso: traslado o radicacion';
comment on column public.mov_novedades.proceso_id is 'ID del proceso (traslado o radicación)';
comment on column public.mov_novedades.prioridad is 'Nivel de urgencia: baja, media, alta, critica';
comment on table public.mov_adjuntos_novedades is 'Archivos de soporte para las novedades';
