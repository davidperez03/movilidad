-- ============================================================================
-- FUNCIONES HELPER PARA EL SISTEMA DE PERMISOS
-- Funciones para verificar permisos y roles de usuarios
-- ============================================================================

-- ============================================================================
-- 1. FUNCIÓN: Verificar si un usuario es superadmin
-- ============================================================================

CREATE OR REPLACE FUNCTION es_superadmin(p_usuario_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = p_usuario_id AND rol_global = 'superadmin'
  );
END;
$$;

-- ============================================================================
-- 2. FUNCIÓN: Obtener el código del rol de un usuario en un módulo
-- ============================================================================

CREATE OR REPLACE FUNCTION obtener_rol_usuario(
  p_usuario_id UUID,
  p_modulo_id TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rol_codigo TEXT;
BEGIN
  -- Si es superadmin, retornar 'superadmin'
  IF es_superadmin(p_usuario_id) THEN
    RETURN 'superadmin';
  END IF;

  -- Obtener el código del rol del usuario en el módulo
  SELECT rm.codigo INTO v_rol_codigo
  FROM public.usuarios_roles ur
  JOIN public.roles_modulo rm ON rm.id = ur.rol_id
  WHERE ur.usuario_id = p_usuario_id
    AND ur.modulo_id = p_modulo_id;

  RETURN v_rol_codigo;
END;
$$;

-- ============================================================================
-- 3. FUNCIÓN: Verificar si un usuario tiene un permiso específico en un módulo
-- ============================================================================

CREATE OR REPLACE FUNCTION tiene_permiso(
  p_usuario_id UUID,
  p_modulo_id TEXT,
  p_permiso TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_permisos JSONB;
  v_es_superadmin BOOLEAN;
BEGIN
  -- Verificar si es superadmin (tiene todos los permisos)
  SELECT es_superadmin(p_usuario_id) INTO v_es_superadmin;

  IF v_es_superadmin THEN
    RETURN TRUE;
  END IF;

  -- Obtener permisos del rol del usuario en el módulo
  SELECT rm.permisos INTO v_permisos
  FROM public.usuarios_roles ur
  JOIN public.roles_modulo rm ON rm.id = ur.rol_id
  WHERE ur.usuario_id = p_usuario_id
    AND ur.modulo_id = p_modulo_id;

  -- Si no tiene rol asignado, no tiene permisos
  IF v_permisos IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Verificar si el permiso específico está en true
  RETURN COALESCE((v_permisos->>p_permiso)::BOOLEAN, FALSE);
END;
$$;

-- ============================================================================
-- 4. FUNCIÓN: Obtener todos los permisos de un usuario en un módulo
-- ============================================================================

CREATE OR REPLACE FUNCTION obtener_permisos_usuario(
  p_usuario_id UUID,
  p_modulo_id TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_permisos JSONB;
BEGIN
  -- Si es superadmin, retornar todos los permisos como true
  IF es_superadmin(p_usuario_id) THEN
    RETURN '{
      "ver_propios": true,
      "ver_todos": true,
      "crear": true,
      "editar_propios": true,
      "editar_asignados": true,
      "editar_todos": true,
      "eliminar": true,
      "asignar": true,
      "comentar": true,
      "adjuntar": true,
      "configurar": true
    }'::jsonb;
  END IF;

  -- Obtener permisos del rol del usuario
  SELECT rm.permisos INTO v_permisos
  FROM public.usuarios_roles ur
  JOIN public.roles_modulo rm ON rm.id = ur.rol_id
  WHERE ur.usuario_id = p_usuario_id
    AND ur.modulo_id = p_modulo_id;

  -- Si no tiene rol, retornar objeto vacío
  RETURN COALESCE(v_permisos, '{}'::jsonb);
END;
$$;

-- ============================================================================
-- 5. FUNCIÓN: Verificar si un usuario tiene acceso a un módulo
-- ============================================================================

CREATE OR REPLACE FUNCTION tiene_acceso_modulo(
  p_usuario_id UUID,
  p_modulo_id TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Los superadmins tienen acceso a todos los módulos
  IF es_superadmin(p_usuario_id) THEN
    RETURN TRUE;
  END IF;

  -- Verificar si el usuario tiene algún rol asignado en el módulo
  RETURN EXISTS (
    SELECT 1 FROM public.usuarios_roles
    WHERE usuario_id = p_usuario_id
      AND modulo_id = p_modulo_id
  );
END;
$$;

-- ============================================================================
-- 6. FUNCIÓN: Obtener nivel del rol de un usuario en un módulo
-- ============================================================================

CREATE OR REPLACE FUNCTION obtener_nivel_rol(
  p_usuario_id UUID,
  p_modulo_id TEXT
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nivel INTEGER;
BEGIN
  -- Si es superadmin, retornar nivel máximo (3)
  IF es_superadmin(p_usuario_id) THEN
    RETURN 3;
  END IF;

  -- Obtener nivel del rol
  SELECT rm.nivel INTO v_nivel
  FROM public.usuarios_roles ur
  JOIN public.roles_modulo rm ON rm.id = ur.rol_id
  WHERE ur.usuario_id = p_usuario_id
    AND ur.modulo_id = p_modulo_id;

  -- Si no tiene rol, retornar -1
  RETURN COALESCE(v_nivel, -1);
END;
$$;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
