create table if not exists public.mov_festivos_colombia (
  fecha date primary key,
  nombre text not null,
  tipo text check (tipo in ('religioso', 'civil', 'puente')) not null,
  creado_en timestamp with time zone default now() not null
);

create index if not exists idx_mov_festivos_fecha on public.mov_festivos_colombia(fecha);

comment on table public.mov_festivos_colombia is 'Festivos nacionales de Colombia para cálculo de días hábiles';
