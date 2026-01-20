CREATE OR REPLACE FUNCTION extraer_exp_de_jwt(p_token TEXT)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  payload_b64 TEXT;
  payload_json JSONB;
  exp_timestamp BIGINT;
BEGIN
  payload_b64 := split_part(p_token, '.', 2);

  IF payload_b64 IS NULL OR payload_b64 = '' THEN
    RETURN NULL;
  END IF;

  payload_b64 := replace(replace(payload_b64, '-', '+'), '_', '/');

  WHILE length(payload_b64) % 4 != 0 LOOP
    payload_b64 := payload_b64 || '=';
  END LOOP;

  BEGIN
    payload_json := convert_from(decode(payload_b64, 'base64'), 'UTF8')::JSONB;
    exp_timestamp := (payload_json->>'exp')::BIGINT;

    RETURN to_timestamp(exp_timestamp);
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
END;
$$;

CREATE OR REPLACE FUNCTION registrar_inicio_sesion(
  p_usuario_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_dispositivo TEXT DEFAULT 'web',
  p_token_sesion TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nueva_sesion_id UUID;
  v_token_expira TIMESTAMP WITH TIME ZONE;
BEGIN
  IF p_token_sesion IS NOT NULL THEN
    v_token_expira := extraer_exp_de_jwt(p_token_sesion);
  END IF;

  INSERT INTO public.sys_sesiones (
    usuario_id,
    estado,
    inicio_sesion,
    ip_address,
    user_agent,
    dispositivo,
    token_sesion,
    token_expira_en,
    ultima_actividad
  ) VALUES (
    p_usuario_id,
    'activa',
    now(),
    p_ip_address,
    p_user_agent,
    p_dispositivo,
    p_token_sesion,
    v_token_expira,
    now()
  )
  RETURNING id INTO nueva_sesion_id;

  PERFORM registrar_auditoria_sistema(
    'login_exitoso',
    'sesion',
    nueva_sesion_id,
    jsonb_build_object(
      'usuario_id', p_usuario_id,
      'ip_address', p_ip_address::text,
      'dispositivo', p_dispositivo,
      'token_expira_en', v_token_expira
    ),
    NULL,
    NULL,
    p_ip_address,
    p_user_agent
  );

  RETURN nueva_sesion_id;
END;
$$;

CREATE OR REPLACE FUNCTION registrar_fin_sesion(
  p_sesion_id UUID,
  p_estado TEXT DEFAULT 'cerrada'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usuario_id UUID;
  v_usuario_info RECORD;
BEGIN
  UPDATE public.sys_sesiones
  SET
    estado = p_estado,
    fin_sesion = now(),
    actualizado_en = now()
  WHERE id = p_sesion_id AND estado = 'activa'
  RETURNING usuario_id INTO v_usuario_id;

  IF FOUND THEN
    SELECT correo, nombre_completo INTO v_usuario_info
    FROM public.perfiles
    WHERE id = v_usuario_id;

    PERFORM registrar_auditoria_sistema(
      CASE p_estado
        WHEN 'cerrada' THEN 'logout'
        WHEN 'expirada' THEN 'sesion_expirada'
        ELSE 'logout'
      END,
      'sesion',
      p_sesion_id,
      jsonb_build_object(
        'usuario_id', v_usuario_id,
        'usuario_correo', v_usuario_info.correo,
        'usuario_nombre', v_usuario_info.nombre_completo
      )
    );

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION actualizar_actividad_sesion(
  p_sesion_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.sys_sesiones
  SET
    ultima_actividad = now(),
    acciones_realizadas = acciones_realizadas + 1,
    actualizado_en = now()
  WHERE id = p_sesion_id AND estado = 'activa';

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION cerrar_sesiones_inactivas(
  p_minutos_inactividad INTEGER DEFAULT 60
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sesiones_cerradas INTEGER;
BEGIN
  WITH sesiones_a_cerrar AS (
    UPDATE public.sys_sesiones
    SET
      estado = 'expirada',
      fin_sesion = now(),
      actualizado_en = now()
    WHERE estado = 'activa'
      AND ultima_actividad < (now() - (p_minutos_inactividad || ' minutes')::INTERVAL)
    RETURNING id, usuario_id
  )
  SELECT COUNT(*) INTO sesiones_cerradas FROM sesiones_a_cerrar;

  RETURN sesiones_cerradas;
END;
$$;

CREATE OR REPLACE FUNCTION cerrar_sesiones_token_expirado()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sesiones_cerradas INTEGER;
BEGIN
  WITH sesiones_a_cerrar AS (
    UPDATE public.sys_sesiones
    SET
      estado = 'expirada',
      fin_sesion = now(),
      actualizado_en = now()
    WHERE estado = 'activa'
      AND token_expira_en IS NOT NULL
      AND token_expira_en < now()
    RETURNING id, usuario_id
  )
  SELECT COUNT(*) INTO sesiones_cerradas FROM sesiones_a_cerrar;

  IF sesiones_cerradas > 0 THEN
    PERFORM registrar_auditoria_sistema(
      'sesiones_token_expirado',
      'sistema',
      NULL,
      jsonb_build_object(
        'sesiones_cerradas', sesiones_cerradas
      )
    );
  END IF;

  RETURN sesiones_cerradas;
END;
$$;

CREATE OR REPLACE FUNCTION superadmin_cerrar_sesion(
  p_sesion_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usuario_id UUID;
  v_usuario_info RECORD;
  v_admin_info RECORD;
BEGIN
  SELECT rol_global INTO v_admin_info
  FROM public.perfiles
  WHERE id = p_admin_id;

  IF v_admin_info.rol_global != 'superadmin' THEN
    RAISE EXCEPTION 'Solo superadmins pueden cerrar sesiones manualmente';
  END IF;

  UPDATE public.sys_sesiones
  SET
    estado = 'forzada_cierre',
    fin_sesion = now(),
    actualizado_en = now()
  WHERE id = p_sesion_id AND estado = 'activa'
  RETURNING usuario_id INTO v_usuario_id;

  IF FOUND THEN
    SELECT correo, nombre_completo INTO v_usuario_info
    FROM public.perfiles
    WHERE id = v_usuario_id;

    PERFORM registrar_auditoria_sistema(
      'sesion_cerrada_por_admin',
      'sesion',
      p_sesion_id,
      jsonb_build_object(
        'usuario_id', v_usuario_id,
        'usuario_correo', v_usuario_info.correo,
        'usuario_nombre', v_usuario_info.nombre_completo,
        'admin_id', p_admin_id
      )
    );

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION obtener_sesion_activa(p_usuario_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT id FROM public.sys_sesiones
    WHERE usuario_id = p_usuario_id AND estado = 'activa'
    ORDER BY inicio_sesion DESC
    LIMIT 1
  );
END;
$$;

COMMENT ON FUNCTION extraer_exp_de_jwt IS
  'Extrae el campo exp (expiración) de un token JWT de Supabase y lo convierte a timestamp';

COMMENT ON FUNCTION registrar_inicio_sesion IS
  'Función para registrar un nuevo inicio de sesión. Crea una sesión activa y registra en auditoría.';

COMMENT ON FUNCTION registrar_fin_sesion IS
  'Función para registrar el fin de una sesión (logout, expiración, o cierre forzado)';

COMMENT ON FUNCTION actualizar_actividad_sesion IS
  'Función para actualizar la última actividad de una sesión activa';

COMMENT ON FUNCTION cerrar_sesiones_inactivas IS
  'Función para cerrar automáticamente sesiones inactivas después de X minutos. Retorna el número de sesiones cerradas.';

COMMENT ON FUNCTION obtener_sesion_activa IS
  'Función para obtener el ID de la sesión activa más reciente de un usuario';
