-- ============================================================================
-- MÓDULO DE TICKETS
-- NOTA: La tabla perfiles debe existir antes de ejecutar este script
-- Se encuentra en: /scripts/sistema-usuarios/001_perfiles_base.sql
-- ============================================================================

-- Crear tabla tickets
create table if not exists public.tks_tickets (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text not null,
  tipo text not null check (tipo in ('soporte_tecnico', 'solicitud_interna', 'tarea_general')),
  estado text not null default 'nuevo' check (estado in ('nuevo', 'en_progreso', 'resuelto', 'cerrado')),
  prioridad text not null default 'media' check (prioridad in ('baja', 'media', 'alta', 'urgente')),
  creado_por uuid not null references public.perfiles(id) on delete cascade,
  asignado_a uuid references public.perfiles(id) on delete set null,
  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null,
  resuelto_en timestamp with time zone,
  cerrado_en timestamp with time zone
);

-- Crear tabla comentarios
create table if not exists public.tks_comentarios (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tks_tickets(id) on delete cascade,
  usuario_id uuid not null references public.perfiles(id) on delete cascade,
  contenido text not null,
  es_interno boolean default false,
  creado_en timestamp with time zone default now() not null,
  actualizado_en timestamp with time zone default now() not null
);

-- Crear tabla adjuntos
create table if not exists public.tks_adjuntos (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tks_tickets(id) on delete cascade,
  subido_por uuid not null references public.perfiles(id) on delete cascade,
  nombre_archivo text not null,
  url_archivo text not null,
  tamano_archivo integer,
  tipo_archivo text,
  creado_en timestamp with time zone default now() not null
);

-- Crear índices para mejor rendimiento
create index if not exists idx_tks_tickets_creado_por on public.tks_tickets(creado_por);
create index if not exists idx_tks_tickets_asignado_a on public.tks_tickets(asignado_a);
create index if not exists idx_tks_tickets_estado on public.tks_tickets(estado);
create index if not exists idx_tks_tickets_prioridad on public.tks_tickets(prioridad);
create index if not exists idx_tks_tickets_tipo on public.tks_tickets(tipo);
create index if not exists idx_tks_comentarios_ticket_id on public.tks_comentarios(ticket_id);
create index if not exists idx_tks_comentarios_usuario_id on public.tks_comentarios(usuario_id);
create index if not exists idx_tks_adjuntos_ticket_id on public.tks_adjuntos(ticket_id);

-- Habilitar Row Level Security
alter table public.tks_tickets enable row level security;
alter table public.tks_comentarios enable row level security;
alter table public.tks_adjuntos enable row level security;

-- ============================================================================
-- POLÍTICAS RLS PARA TICKETS (Sistema Modular)
-- Usan funciones del sistema de roles modulares
-- ============================================================================

-- Políticas de tickets
create policy "Ver tickets según permisos modulares"
  on public.tks_tickets for select
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'tickets', 'ver_todos')
    or (
      tiene_permiso(auth.uid(), 'tickets', 'ver_propios')
      and (creado_por = auth.uid() or asignado_a = auth.uid())
    )
  );

create policy "Crear tickets según permisos modulares"
  on public.tks_tickets for insert
  with check (
    es_superadmin(auth.uid())
    or (
      tiene_permiso(auth.uid(), 'tickets', 'crear')
      and auth.uid() = creado_por
    )
  );

create policy "Actualizar tickets según permisos modulares"
  on public.tks_tickets for update
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'tickets', 'editar_todos')
    or (
      tiene_permiso(auth.uid(), 'tickets', 'editar_asignados')
      and asignado_a = auth.uid()
    )
    or (
      tiene_permiso(auth.uid(), 'tickets', 'editar_propios')
      and creado_por = auth.uid()
    )
  );

create policy "Eliminar tickets según permisos modulares"
  on public.tks_tickets for delete
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'tickets', 'eliminar')
  );

-- Políticas de comentarios
create policy "Ver comentarios según permisos modulares"
  on public.tks_comentarios for select
  using (
    es_superadmin(auth.uid())
    or exists (
      select 1 from public.tks_tickets t
      where t.id = ticket_id
      and (
        tiene_permiso(auth.uid(), 'tickets', 'ver_todos')
        or (
          tiene_permiso(auth.uid(), 'tickets', 'ver_propios')
          and (t.creado_por = auth.uid() or t.asignado_a = auth.uid())
        )
      )
    )
  );

create policy "Crear comentarios según permisos modulares"
  on public.tks_comentarios for insert
  with check (
    es_superadmin(auth.uid())
    or (
      tiene_permiso(auth.uid(), 'tickets', 'comentar')
      and auth.uid() = usuario_id
      and exists (
        select 1 from public.tks_tickets t
        where t.id = ticket_id
        and (
          tiene_permiso(auth.uid(), 'tickets', 'ver_todos')
          or (t.creado_por = auth.uid() or t.asignado_a = auth.uid())
        )
      )
    )
  );

create policy "Actualizar comentarios según permisos modulares"
  on public.tks_comentarios for update
  using (
    es_superadmin(auth.uid())
    or (auth.uid() = usuario_id and tiene_permiso(auth.uid(), 'tickets', 'comentar'))
  );

create policy "Eliminar comentarios según permisos modulares"
  on public.tks_comentarios for delete
  using (
    es_superadmin(auth.uid())
    or auth.uid() = usuario_id
    or tiene_permiso(auth.uid(), 'tickets', 'eliminar')
  );

-- Políticas de adjuntos
create policy "Ver adjuntos según permisos modulares"
  on public.tks_adjuntos for select
  using (
    es_superadmin(auth.uid())
    or exists (
      select 1 from public.tks_tickets t
      where t.id = ticket_id
      and (
        tiene_permiso(auth.uid(), 'tickets', 'ver_todos')
        or (
          tiene_permiso(auth.uid(), 'tickets', 'ver_propios')
          and (t.creado_por = auth.uid() or t.asignado_a = auth.uid())
        )
      )
    )
  );

create policy "Subir adjuntos según permisos modulares"
  on public.tks_adjuntos for insert
  with check (
    es_superadmin(auth.uid())
    or (
      tiene_permiso(auth.uid(), 'tickets', 'adjuntar')
      and auth.uid() = subido_por
      and exists (
        select 1 from public.tks_tickets t
        where t.id = ticket_id
        and (
          tiene_permiso(auth.uid(), 'tickets', 'ver_todos')
          or (t.creado_por = auth.uid() or t.asignado_a = auth.uid())
        )
      )
    )
  );

create policy "Eliminar adjuntos según permisos modulares"
  on public.tks_adjuntos for delete
  using (
    es_superadmin(auth.uid())
    or auth.uid() = subido_por
    or tiene_permiso(auth.uid(), 'tickets', 'eliminar')
  );
