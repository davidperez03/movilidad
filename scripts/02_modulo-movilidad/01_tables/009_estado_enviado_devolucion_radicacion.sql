-- Compatibilidad para bases existentes:
-- agrega el nuevo estado intermedio 'enviado_devolucion' en la validación del estado.
alter table public.mov_radicaciones
  drop constraint if exists mov_radicaciones_estado_check;

alter table public.mov_radicaciones
  drop constraint if exists chk_mov_radicaciones_estado;

alter table public.mov_radicaciones
  add constraint chk_mov_radicaciones_estado
  check (estado in (
    'sin_asignar',
    'pendiente_radicar',
    'enviado_devolucion',
    'recibido',
    'revisado',
    'con_novedades',
    'radicado',
    'devuelto'
  ));
