-- Alineado con la lógica de traslados:
-- Los datos logísticos se guardan en la misma tabla de procesos (mov_radicaciones)
alter table public.mov_radicaciones
  add column if not exists empresa_transportadora_id uuid references public.mov_empresas_transporte(id) on delete set null,
  add column if not exists numero_guia text;

create index if not exists idx_mov_radicaciones_empresa_transportadora
  on public.mov_radicaciones(empresa_transportadora_id);

comment on column public.mov_radicaciones.empresa_transportadora_id is
  'Empresa transportadora usada cuando la radicación se devuelve al solicitante';

comment on column public.mov_radicaciones.numero_guia is
  'Número de guía del envío de devolución de la radicación';
