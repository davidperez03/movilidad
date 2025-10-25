-- Crear tabla perfiles con roles
create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  correo text not null,
  nombre_completo text,
  rol text not null default 'usuario' check (rol in ('usuario', 'agente', 'administrador')),
  url_avatar text,
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null,
  actualizado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear tabla tickets
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text not null,
  tipo text not null check (tipo in ('soporte_tecnico', 'solicitud_interna', 'tarea_general')),
  estado text not null default 'nuevo' check (estado in ('nuevo', 'en_progreso', 'resuelto', 'cerrado')),
  prioridad text not null default 'media' check (prioridad in ('baja', 'media', 'alta', 'urgente')),
  creado_por uuid not null references public.perfiles(id) on delete cascade,
  asignado_a uuid references public.perfiles(id) on delete set null,
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null,
  actualizado_en timestamp with time zone default timezone('utc'::text, now()) not null,
  resuelto_en timestamp with time zone,
  cerrado_en timestamp with time zone
);

-- Crear tabla comentarios
create table if not exists public.comentarios (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  usuario_id uuid not null references public.perfiles(id) on delete cascade,
  contenido text not null,
  es_interno boolean default false,
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null,
  actualizado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear tabla adjuntos
create table if not exists public.adjuntos (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  subido_por uuid not null references public.perfiles(id) on delete cascade,
  nombre_archivo text not null,
  url_archivo text not null,
  tamano_archivo integer,
  tipo_archivo text,
  creado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear índices para mejor rendimiento
create index if not exists idx_tickets_creado_por on public.tickets(creado_por);
create index if not exists idx_tickets_asignado_a on public.tickets(asignado_a);
create index if not exists idx_tickets_estado on public.tickets(estado);
create index if not exists idx_tickets_prioridad on public.tickets(prioridad);
create index if not exists idx_tickets_tipo on public.tickets(tipo);
create index if not exists idx_comentarios_ticket_id on public.comentarios(ticket_id);
create index if not exists idx_comentarios_usuario_id on public.comentarios(usuario_id);
create index if not exists idx_adjuntos_ticket_id on public.adjuntos(ticket_id);

-- Habilitar Row Level Security
alter table public.perfiles enable row level security;
alter table public.tickets enable row level security;
alter table public.comentarios enable row level security;
alter table public.adjuntos enable row level security;

-- Políticas de perfiles
create policy "Los usuarios pueden ver todos los perfiles"
  on public.perfiles for select
  using (true);

create policy "Los usuarios pueden actualizar su propio perfil"
  on public.perfiles for update
  using (auth.uid() = id);

create policy "Los usuarios pueden insertar su propio perfil"
  on public.perfiles for insert
  with check (auth.uid() = id);

-- Políticas de tickets
create policy "Los usuarios pueden ver sus propios tickets"
  on public.tickets for select
  using (
    auth.uid() = creado_por
    or auth.uid() = asignado_a
    or exists (
      select 1 from public.perfiles
      where id = auth.uid()
      and rol in ('agente', 'administrador')
    )
  );

create policy "Los usuarios pueden crear tickets"
  on public.tickets for insert
  with check (auth.uid() = creado_por);

create policy "Los agentes y administradores pueden actualizar tickets"
  on public.tickets for update
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid()
      and rol in ('agente', 'administrador')
    )
  );

create policy "Los administradores pueden eliminar tickets"
  on public.tickets for delete
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid()
      and rol = 'administrador'
    )
  );

-- Políticas de comentarios
create policy "Los usuarios pueden ver comentarios en sus tickets"
  on public.comentarios for select
  using (
    exists (
      select 1 from public.tickets
      where id = ticket_id
      and (
        creado_por = auth.uid()
        or asignado_a = auth.uid()
        or exists (
          select 1 from public.perfiles
          where id = auth.uid()
          and rol in ('agente', 'administrador')
        )
      )
    )
  );

create policy "Los usuarios pueden crear comentarios en tickets accesibles"
  on public.comentarios for insert
  with check (
    auth.uid() = usuario_id
    and exists (
      select 1 from public.tickets
      where id = ticket_id
      and (
        creado_por = auth.uid()
        or asignado_a = auth.uid()
        or exists (
          select 1 from public.perfiles
          where id = auth.uid()
          and rol in ('agente', 'administrador')
        )
      )
    )
  );

create policy "Los usuarios pueden actualizar sus propios comentarios"
  on public.comentarios for update
  using (auth.uid() = usuario_id);

create policy "Los usuarios pueden eliminar sus propios comentarios"
  on public.comentarios for delete
  using (
    auth.uid() = usuario_id
    or exists (
      select 1 from public.perfiles
      where id = auth.uid()
      and rol = 'administrador'
    )
  );

-- Políticas de adjuntos
create policy "Los usuarios pueden ver adjuntos en sus tickets"
  on public.adjuntos for select
  using (
    exists (
      select 1 from public.tickets
      where id = ticket_id
      and (
        creado_por = auth.uid()
        or asignado_a = auth.uid()
        or exists (
          select 1 from public.perfiles
          where id = auth.uid()
          and rol in ('agente', 'administrador')
        )
      )
    )
  );

create policy "Los usuarios pueden subir adjuntos a tickets accesibles"
  on public.adjuntos for insert
  with check (
    auth.uid() = subido_por
    and exists (
      select 1 from public.tickets
      where id = ticket_id
      and (
        creado_por = auth.uid()
        or asignado_a = auth.uid()
        or exists (
          select 1 from public.perfiles
          where id = auth.uid()
          and rol in ('agente', 'administrador')
        )
      )
    )
  );

create policy "Los usuarios pueden eliminar sus propios adjuntos"
  on public.adjuntos for delete
  using (
    auth.uid() = subido_por
    or exists (
      select 1 from public.perfiles
      where id = auth.uid()
      and rol = 'administrador'

    )
  );
