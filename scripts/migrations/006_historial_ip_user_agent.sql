-- Migración 006: Agregar ip_address y user_agent a tablas de historial de módulos
-- mov_historial_acciones y parq_historial_acciones carecen de estos campos,
-- lo que impide rastrear el origen geográfico/dispositivo de acciones en módulos.
--
-- Versión: v1.16.0
-- Fecha: 2026-04-16

BEGIN;

-- Movilidad
ALTER TABLE public.mov_historial_acciones
  ADD COLUMN IF NOT EXISTS ip_address INET,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

COMMENT ON COLUMN public.mov_historial_acciones.ip_address IS
  'Dirección IP desde donde se realizó la acción (disponible cuando se registra desde API route)';

COMMENT ON COLUMN public.mov_historial_acciones.user_agent IS
  'Información del navegador/cliente utilizado';

-- Parqueadero
ALTER TABLE public.parq_historial_acciones
  ADD COLUMN IF NOT EXISTS ip_address INET,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

COMMENT ON COLUMN public.parq_historial_acciones.ip_address IS
  'Dirección IP desde donde se realizó la acción (disponible cuando se registra desde API route)';

COMMENT ON COLUMN public.parq_historial_acciones.user_agent IS
  'Información del navegador/cliente utilizado';

COMMIT;

-- ROLLBACK:
-- BEGIN;
-- ALTER TABLE public.mov_historial_acciones DROP COLUMN IF EXISTS ip_address, DROP COLUMN IF EXISTS user_agent;
-- ALTER TABLE public.parq_historial_acciones DROP COLUMN IF EXISTS ip_address, DROP COLUMN IF EXISTS user_agent;
-- COMMIT;
