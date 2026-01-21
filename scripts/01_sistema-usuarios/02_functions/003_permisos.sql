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
  IF es_superadmin(p_usuario_id) THEN
    RETURN 'superadmin';
  END IF;

  SELECT rm.codigo INTO v_rol_codigo
  FROM public.usuarios_roles ur
  JOIN public.roles_modulo rm ON rm.id = ur.rol_id
  WHERE ur.usuario_id = p_usuario_id
    AND ur.modulo_id = p_modulo_id;

  RETURN v_rol_codigo;
END;
$$;

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
  SELECT es_superadmin(p_usuario_id) INTO v_es_superadmin;

  IF v_es_superadmin THEN
    RETURN TRUE;
  END IF;

  SELECT rm.permisos INTO v_permisos
  FROM public.usuarios_roles ur
  JOIN public.roles_modulo rm ON rm.id = ur.rol_id
  WHERE ur.usuario_id = p_usuario_id
    AND ur.modulo_id = p_modulo_id;

  IF v_permisos IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN COALESCE((v_permisos->>p_permiso)::BOOLEAN, FALSE);
END;
$$;

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

  SELECT rm.permisos INTO v_permisos
  FROM public.usuarios_roles ur
  JOIN public.roles_modulo rm ON rm.id = ur.rol_id
  WHERE ur.usuario_id = p_usuario_id
    AND ur.modulo_id = p_modulo_id;

  RETURN COALESCE(v_permisos, '{}'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION tiene_acceso_modulo(
  p_usuario_id UUID,
  p_modulo_id TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF es_superadmin(p_usuario_id) THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.usuarios_roles
    WHERE usuario_id = p_usuario_id
      AND modulo_id = p_modulo_id
  );
END;
$$;

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
  IF es_superadmin(p_usuario_id) THEN
    RETURN 3;
  END IF;

  SELECT rm.nivel INTO v_nivel
  FROM public.usuarios_roles ur
  JOIN public.roles_modulo rm ON rm.id = ur.rol_id
  WHERE ur.usuario_id = p_usuario_id
    AND ur.modulo_id = p_modulo_id;

  RETURN COALESCE(v_nivel, -1);
END;
$$;
