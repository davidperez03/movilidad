-- Create profiles table with roles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('user', 'agent', 'admin')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tickets table
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  type text not null check (type in ('technical_support', 'internal_request', 'general_task')),
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved', 'closed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  created_by uuid not null references public.profiles(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone,
  closed_at timestamp with time zone
);

-- Create comments table
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_internal boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create attachments table
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_size integer,
  file_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index if not exists idx_tickets_created_by on public.tickets(created_by);
create index if not exists idx_tickets_assigned_to on public.tickets(assigned_to);
create index if not exists idx_tickets_status on public.tickets(status);
create index if not exists idx_tickets_priority on public.tickets(priority);
create index if not exists idx_tickets_type on public.tickets(type);
create index if not exists idx_comments_ticket_id on public.comments(ticket_id);
create index if not exists idx_comments_user_id on public.comments(user_id);
create index if not exists idx_attachments_ticket_id on public.attachments(ticket_id);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.tickets enable row level security;
alter table public.comments enable row level security;
alter table public.attachments enable row level security;

-- Profiles policies
create policy "Users can view all profiles"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Tickets policies
create policy "Users can view their own tickets"
  on public.tickets for select
  using (
    auth.uid() = created_by 
    or auth.uid() = assigned_to
    or exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role in ('agent', 'admin')
    )
  );

create policy "Users can create tickets"
  on public.tickets for insert
  with check (auth.uid() = created_by);

create policy "Agents and admins can update tickets"
  on public.tickets for update
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role in ('agent', 'admin')
    )
  );

create policy "Admins can delete tickets"
  on public.tickets for delete
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'admin'
    )
  );

-- Comments policies
create policy "Users can view comments on their tickets"
  on public.comments for select
  using (
    exists (
      select 1 from public.tickets 
      where id = ticket_id 
      and (
        created_by = auth.uid() 
        or assigned_to = auth.uid()
        or exists (
          select 1 from public.profiles 
          where id = auth.uid() 
          and role in ('agent', 'admin')
        )
      )
    )
  );

create policy "Users can create comments on accessible tickets"
  on public.comments for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.tickets 
      where id = ticket_id 
      and (
        created_by = auth.uid() 
        or assigned_to = auth.uid()
        or exists (
          select 1 from public.profiles 
          where id = auth.uid() 
          and role in ('agent', 'admin')
        )
      )
    )
  );

create policy "Users can update own comments"
  on public.comments for update
  using (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.comments for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'admin'
    )
  );

-- Attachments policies
create policy "Users can view attachments on their tickets"
  on public.attachments for select
  using (
    exists (
      select 1 from public.tickets 
      where id = ticket_id 
      and (
        created_by = auth.uid() 
        or assigned_to = auth.uid()
        or exists (
          select 1 from public.profiles 
          where id = auth.uid() 
          and role in ('agent', 'admin')
        )
      )
    )
  );

create policy "Users can upload attachments to accessible tickets"
  on public.attachments for insert
  with check (
    auth.uid() = uploaded_by
    and exists (
      select 1 from public.tickets 
      where id = ticket_id 
      and (
        created_by = auth.uid() 
        or assigned_to = auth.uid()
        or exists (
          select 1 from public.profiles 
          where id = auth.uid() 
          and role in ('agent', 'admin')
        )
      )
    )
  );

create policy "Users can delete own attachments"
  on public.attachments for delete
  using (
    auth.uid() = uploaded_by
    or exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'admin'
    )
  );
