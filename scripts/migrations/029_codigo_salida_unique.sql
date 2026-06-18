-- ============================================================
-- Migration 029: Formato y unicidad de codigo_salida en salidas grua
-- Nuevo formato: DDMMYYYY-XXXXX  (ej: 18062026-25484)
-- Al vigilante solo se muestran los 5 dígitos; la fecha garantiza
-- unicidad diaria sin ampliar el espacio de búsqueda manual.
-- ============================================================

-- Nullificar códigos antiguos (formato char(5), ya no válidos)
UPDATE public.parq_salidas_grua SET codigo_salida = NULL;

-- Ampliar columna para el nuevo formato (14 chars: 8 fecha + 1 guión + 5 dígitos)
ALTER TABLE public.parq_salidas_grua
  ALTER COLUMN codigo_salida TYPE varchar(15);

-- Constraint único (NULL no viola UNIQUE en Postgres)
ALTER TABLE public.parq_salidas_grua
  ADD CONSTRAINT parq_salidas_grua_codigo_salida_unique UNIQUE (codigo_salida);
