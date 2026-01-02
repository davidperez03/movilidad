-- ============================================================================
-- MEJORA: Validación real de expiración de tokens
-- ============================================================================

-- Agregar columna para almacenar la fecha de expiración del token
ALTER TABLE public.sys_sesiones
ADD COLUMN IF NOT EXISTS token_expira_en TIMESTAMP WITH TIME ZONE;

-- Crear índice para consultas por expiración de token
CREATE INDEX IF NOT EXISTS idx_sys_sesiones_token_expira
  ON public.sys_sesiones(token_expira_en)
  WHERE estado = 'activa';

-- Función para cerrar sesiones con token expirado
-- Esta función es llamada manualmente desde el panel de superadmin
CREATE OR REPLACE FUNCTION cerrar_sesiones_token_expirado()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
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

  -- Registrar en auditoría las sesiones cerradas automáticamente
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

-- Función para que el superadmin cierre sesiones huérfanas manualmente
CREATE OR REPLACE FUNCTION superadmin_cerrar_sesion(
  p_sesion_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_usuario_id UUID;
  v_usuario_info RECORD;
  v_admin_info RECORD;
BEGIN
  -- Verificar que quien ejecuta es superadmin
  SELECT rol_global INTO v_admin_info
  FROM public.perfiles
  WHERE id = p_admin_id;

  IF v_admin_info.rol_global != 'superadmin' THEN
    RAISE EXCEPTION 'Solo superadmins pueden cerrar sesiones manualmente';
  END IF;

  -- Cerrar la sesión
  UPDATE public.sys_sesiones
  SET
    estado = 'forzada_cierre',
    fin_sesion = now(),
    actualizado_en = now()
  WHERE id = p_sesion_id AND estado = 'activa'
  RETURNING usuario_id INTO v_usuario_id;

  IF FOUND THEN
    -- Obtener información del usuario
    SELECT correo, nombre_completo INTO v_usuario_info
    FROM public.perfiles
    WHERE id = v_usuario_id;

    -- Registrar en auditoría
    PERFORM registrar_auditoria_sistema(
      'sesion_cerrada_por_admin',
      'sesion',
      p_sesion_id,
      jsonb_build_object(
        'usuario_id', v_usuario_id,
        'usuario_correo', v_usuario_info.correo,
        'usuario_nombre', v_usuario_info.nombre_completo,
        'admin_id', p_admin_id
      ),
      NULL,
      p_admin_id
    );

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Función auxiliar para extraer el exp de un JWT
-- Nota: Esta función decodifica el payload del JWT (segunda parte)
CREATE OR REPLACE FUNCTION extraer_exp_de_jwt(p_token TEXT)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  payload_b64 TEXT;
  payload_json JSONB;
  exp_timestamp BIGINT;
BEGIN
  -- El JWT tiene formato: header.payload.signature
  -- Extraer la segunda parte (payload)
  payload_b64 := split_part(p_token, '.', 2);

  IF payload_b64 IS NULL OR payload_b64 = '' THEN
    RETURN NULL;
  END IF;

  -- Decodificar base64url a JSON
  -- PostgreSQL tiene decode pero necesitamos ajustar base64url a base64
  payload_b64 := replace(replace(payload_b64, '-', '+'), '_', '/');

  -- Agregar padding si es necesario
  WHILE length(payload_b64) % 4 != 0 LOOP
    payload_b64 := payload_b64 || '=';
  END LOOP;

  -- Decodificar y parsear JSON
  BEGIN
    payload_json := convert_from(decode(payload_b64, 'base64'), 'UTF8')::JSONB;
    exp_timestamp := (payload_json->>'exp')::BIGINT;

    -- Convertir Unix timestamp a timestamp with time zone
    RETURN to_timestamp(exp_timestamp);
  EXCEPTION WHEN OTHERS THEN
    -- Si hay error al decodificar, retornar NULL
    RETURN NULL;
  END;
END;
$$;

-- Mejorar la función de registro de inicio de sesión para extraer el exp del token
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
AS $$
DECLARE
  nueva_sesion_id UUID;
  v_token_expira TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Extraer fecha de expiración del token si está disponible
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

  -- Registrar en auditoría
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

-- Comentarios
COMMENT ON COLUMN public.sys_sesiones.token_expira_en IS
  'Fecha de expiración del token extraída del campo exp del JWT';

COMMENT ON FUNCTION extraer_exp_de_jwt IS
  'Extrae el campo exp (expiración) de un token JWT de Supabase y lo convierte a timestamp';
