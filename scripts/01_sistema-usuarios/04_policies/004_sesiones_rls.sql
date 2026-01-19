ALTER TABLE public.sys_sesiones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden ver sus propias sesiones" ON public.sys_sesiones;
CREATE POLICY "Usuarios pueden ver sus propias sesiones"
  ON public.sys_sesiones FOR SELECT
  USING (
    usuario_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol_global = 'superadmin'
    )
  );

DROP POLICY IF EXISTS "Solo sistema puede modificar sesiones" ON public.sys_sesiones;
CREATE POLICY "Solo sistema puede modificar sesiones"
  ON public.sys_sesiones FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "Solo sistema puede actualizar sesiones" ON public.sys_sesiones;
CREATE POLICY "Solo sistema puede actualizar sesiones"
  ON public.sys_sesiones FOR UPDATE
  USING (false);
