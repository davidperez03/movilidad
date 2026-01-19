ALTER TABLE public.sys_auditoria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo superadmins pueden ver auditoría" ON public.sys_auditoria;
CREATE POLICY "Solo superadmins pueden ver auditoría"
  ON public.sys_auditoria FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol_global = 'superadmin'
    )
  );

DROP POLICY IF EXISTS "Solo sistema puede insertar auditoría" ON public.sys_auditoria;
CREATE POLICY "Solo sistema puede insertar auditoría"
  ON public.sys_auditoria FOR INSERT
  WITH CHECK (false);
