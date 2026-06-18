-- ============================================================
-- Migration 030: Permitir múltiples turnos por día por vehículo
-- Reemplaza el unique (vehiculo_id, fecha, tipo_turno) por un
-- índice parcial que solo impide tener DOS turnos ABIERTOS
-- para el mismo vehículo al mismo tiempo.
-- ============================================================

-- Eliminar constraint anterior
ALTER TABLE public.parq_turnos
  DROP CONSTRAINT IF EXISTS uq_parq_turnos_vehiculo_fecha_tipo;

-- Solo puede haber un turno abierto por vehículo a la vez
CREATE UNIQUE INDEX IF NOT EXISTS uq_parq_turnos_vehiculo_abierto
  ON public.parq_turnos (vehiculo_id)
  WHERE estado = 'abierto';
