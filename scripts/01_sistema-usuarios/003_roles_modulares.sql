-- ============================================================================
-- SISTEMA DE ROLES MODULARES
-- Permite asignar diferentes roles a usuarios según el módulo
-- ============================================================================

-- ============================================================================
-- 1. TABLA DE MÓDULOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.modulos (
  id TEXT PRIMARY KEY,  -- 'movilidad', 'reportes', etc.
  nombre TEXT NOT NULL,
  descripcion TEXT,
  icono TEXT,  -- Nombre del icono para el UI
  ruta TEXT,   -- Ruta base del módulo (/movilidad, etc.)
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,  -- Para ordenar en el UI
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Índice para búsquedas
CREATE INDEX IF NOT EXISTS idx_modulos_activo ON public.modulos(activo);

-- ============================================================================
-- 2. TABLA DE ROLES POR MÓDULO
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.roles_modulo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id TEXT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,  -- 'mov_operador', 'mov_usuario', etc.
  nombre TEXT NOT NULL,  -- 'Operador de Movilidad', 'Usuario de Movilidad'
  descripcion TEXT,
  permisos JSONB NOT NULL DEFAULT '{}',  -- { "ver": true, "crear": true, ... }
  nivel INTEGER DEFAULT 0,  -- 0=básico, 1=intermedio, 2=administrador
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(modulo_id, codigo)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_roles_modulo_modulo_id ON public.roles_modulo(modulo_id);
CREATE INDEX IF NOT EXISTS idx_roles_modulo_codigo ON public.roles_modulo(codigo);

-- ============================================================================
-- 3. TABLA DE ASIGNACIÓN DE ROLES A USUARIOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.usuarios_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  modulo_id TEXT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  rol_id UUID NOT NULL REFERENCES roles_modulo(id) ON DELETE CASCADE,
  asignado_por UUID REFERENCES perfiles(id),  -- Quién asignó el rol
  asignado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(usuario_id, modulo_id)  -- Un usuario solo puede tener un rol por módulo
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_usuario ON public.usuarios_roles(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_modulo ON public.usuarios_roles(modulo_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_rol ON public.usuarios_roles(rol_id);

-- ============================================================================
-- 4. TRIGGERS PARA ACTUALIZAR TIMESTAMPS
-- ============================================================================

-- Trigger para modulos
CREATE OR REPLACE FUNCTION actualizar_timestamp_modulos()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_modulos ON public.modulos;
CREATE TRIGGER trigger_actualizar_modulos
  BEFORE UPDATE ON public.modulos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp_modulos();

-- Trigger para roles_modulo
CREATE OR REPLACE FUNCTION actualizar_timestamp_roles_modulo()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_roles_modulo ON public.roles_modulo;
CREATE TRIGGER trigger_actualizar_roles_modulo
  BEFORE UPDATE ON public.roles_modulo
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp_roles_modulo();

-- ============================================================================
-- 5. HABILITAR ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles_modulo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. POLÍTICAS RLS PARA MÓDULOS
-- ============================================================================

-- Todos pueden ver módulos activos
DROP POLICY IF EXISTS "Todos pueden ver módulos activos" ON public.modulos;
CREATE POLICY "Todos pueden ver módulos activos"
  ON public.modulos FOR SELECT
  USING (activo = true);

-- Solo superadmins pueden modificar módulos
DROP POLICY IF EXISTS "Solo superadmins pueden modificar módulos" ON public.modulos;
CREATE POLICY "Solo superadmins pueden modificar módulos"
  ON public.modulos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol_global = 'superadmin'
    )
  );

-- ============================================================================
-- 7. POLÍTICAS RLS PARA ROLES_MODULO
-- ============================================================================

-- Todos pueden ver roles disponibles
DROP POLICY IF EXISTS "Todos pueden ver roles disponibles" ON public.roles_modulo;
CREATE POLICY "Todos pueden ver roles disponibles"
  ON public.roles_modulo FOR SELECT
  USING (true);

-- Solo superadmins pueden modificar roles
DROP POLICY IF EXISTS "Solo superadmins pueden modificar roles" ON public.roles_modulo;
CREATE POLICY "Solo superadmins pueden modificar roles"
  ON public.roles_modulo FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol_global = 'superadmin'
    )
  );

-- ============================================================================
-- 8. POLÍTICAS RLS PARA USUARIOS_ROLES
-- ============================================================================

-- Los usuarios pueden ver sus propios roles
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios roles" ON public.usuarios_roles;
CREATE POLICY "Los usuarios pueden ver sus propios roles"
  ON public.usuarios_roles FOR SELECT
  USING (usuario_id = auth.uid());

-- Los superadmins pueden ver todos los roles
DROP POLICY IF EXISTS "Superadmins pueden ver todos los roles" ON public.usuarios_roles;
CREATE POLICY "Superadmins pueden ver todos los roles"
  ON public.usuarios_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol_global = 'superadmin'
    )
  );

-- Solo superadmins pueden asignar/modificar/eliminar roles
DROP POLICY IF EXISTS "Solo superadmins pueden gestionar roles de usuarios" ON public.usuarios_roles;
CREATE POLICY "Solo superadmins pueden gestionar roles de usuarios"
  ON public.usuarios_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol_global = 'superadmin'
    )
  );

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
