-- Migración 025: Corregir RLS de mov_historial_acciones
-- La política anterior solo permitía superadmins; ahora permite
-- a cualquier usuario con acceso al módulo de movilidad.

BEGIN;

DROP POLICY IF EXISTS "Solo superadmins pueden ver historial movilidad" ON public.mov_historial_acciones;
DROP POLICY IF EXISTS "Usuarios pueden ver todo el historial" ON public.mov_historial_acciones;

CREATE POLICY "Usuarios con acceso a movilidad pueden ver historial"
  ON public.mov_historial_acciones FOR SELECT
  USING (tiene_acceso_modulo(auth.uid(), 'movilidad'));

COMMIT;
