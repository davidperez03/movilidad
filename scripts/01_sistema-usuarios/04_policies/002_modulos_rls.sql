ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles_modulo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos pueden ver módulos activos" ON public.modulos;
CREATE POLICY "Todos pueden ver módulos activos"
  ON public.modulos FOR SELECT
  USING (activo = true);

DROP POLICY IF EXISTS "Solo superadmins pueden modificar módulos" ON public.modulos;
CREATE POLICY "Solo superadmins pueden modificar módulos"
  ON public.modulos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol_global = 'superadmin'
    )
  );

DROP POLICY IF EXISTS "Todos pueden ver roles disponibles" ON public.roles_modulo;
CREATE POLICY "Todos pueden ver roles disponibles"
  ON public.roles_modulo FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Solo superadmins pueden modificar roles" ON public.roles_modulo;
CREATE POLICY "Solo superadmins pueden modificar roles"
  ON public.roles_modulo FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol_global = 'superadmin'
    )
  );

DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios roles" ON public.usuarios_roles;
CREATE POLICY "Los usuarios pueden ver sus propios roles"
  ON public.usuarios_roles FOR SELECT
  USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "Superadmins pueden ver todos los roles" ON public.usuarios_roles;
CREATE POLICY "Superadmins pueden ver todos los roles"
  ON public.usuarios_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol_global = 'superadmin'
    )
  );

DROP POLICY IF EXISTS "Solo superadmins pueden gestionar roles de usuarios" ON public.usuarios_roles;
CREATE POLICY "Solo superadmins pueden gestionar roles de usuarios"
  ON public.usuarios_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol_global = 'superadmin'
    )
  );
