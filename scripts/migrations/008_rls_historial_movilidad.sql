-- Migración 008: Restringir acceso a historial de movilidad solo a superadmins
-- La política anterior permitía ver TODO el historial a cualquier usuario con rol en movilidad,
-- inconsistente con parqueadero y sistema que son solo superadmin.
--
-- Versión: v1.16.0
-- Fecha: 2026-04-16

BEGIN;

DROP POLICY IF EXISTS "Usuarios pueden ver todo el historial" ON public.mov_historial_acciones;
DROP POLICY IF EXISTS "Solo superadmins pueden ver historial movilidad" ON public.mov_historial_acciones;

CREATE POLICY "Solo superadmins pueden ver historial movilidad"
  ON public.mov_historial_acciones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol_global = 'superadmin'
    )
  );

COMMIT;

-- ROLLBACK:
-- BEGIN;
-- DROP POLICY IF EXISTS "Solo superadmins pueden ver historial movilidad" ON public.mov_historial_acciones;
-- CREATE POLICY "Usuarios pueden ver todo el historial"
--   ON public.mov_historial_acciones FOR SELECT
--   USING (tiene_acceso_modulo(auth.uid(), 'movilidad'));
-- COMMIT;
