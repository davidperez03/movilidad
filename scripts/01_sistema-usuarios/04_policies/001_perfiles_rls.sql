ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Los usuarios pueden ver todos los perfiles" ON public.perfiles;
CREATE POLICY "Los usuarios pueden ver todos los perfiles"
  ON public.perfiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.perfiles;
CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.perfiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Los usuarios pueden insertar su propio perfil" ON public.perfiles;
CREATE POLICY "Los usuarios pueden insertar su propio perfil"
  ON public.perfiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Los superadmins pueden modificar perfiles" ON public.perfiles;
CREATE POLICY "Los superadmins pueden modificar perfiles"
  ON public.perfiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol_global = 'superadmin'
    )
  );
