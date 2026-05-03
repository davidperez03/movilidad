CREATE OR REPLACE FUNCTION registrar_auditoria_sistema(
  p_accion TEXT,
  p_entidad_tipo TEXT DEFAULT NULL,
  p_entidad_id UUID DEFAULT NULL,
  p_detalles JSONB DEFAULT NULL,
  p_valor_anterior TEXT DEFAULT NULL,
  p_valor_nuevo TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nuevo_id UUID;
BEGIN
  INSERT INTO public.sys_auditoria (
    accion,
    entidad_tipo,
    entidad_id,
    detalles,
    valor_anterior,
    valor_nuevo,
    realizado_por,
    ip_address,
    user_agent
  ) VALUES (
    p_accion,
    p_entidad_tipo,
    p_entidad_id,
    p_detalles,
    p_valor_anterior,
    p_valor_nuevo,
    auth.uid(),
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO nuevo_id;

  RETURN nuevo_id;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_auditoria_perfiles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM registrar_auditoria_sistema(
      'usuario_creado',
      'usuario',
      NEW.id,
      jsonb_build_object(
        'correo', NEW.correo,
        'nombre_completo', NEW.nombre_completo,
        'rol_global', NEW.rol_global,
        'activo', COALESCE(NEW.activo, true)
      )
    );
    RETURN NEW;
  END IF;

  IF (TG_OP = 'UPDATE') THEN
    IF (OLD.activo IS DISTINCT FROM NEW.activo) THEN
      PERFORM registrar_auditoria_sistema(
        CASE WHEN COALESCE(NEW.activo, true) THEN 'usuario_activado' ELSE 'usuario_desactivado' END,
        'usuario',
        NEW.id,
        jsonb_build_object(
          'correo', NEW.correo,
          'nombre_completo', NEW.nombre_completo,
          'razon_suspension', NEW.razon_suspension
        ),
        COALESCE(OLD.activo, true)::text,
        COALESCE(NEW.activo, true)::text
      );
    END IF;

    IF (OLD.rol_global != NEW.rol_global) THEN
      PERFORM registrar_auditoria_sistema(
        'rol_global_cambiado',
        'usuario',
        NEW.id,
        jsonb_build_object(
          'correo', NEW.correo,
          'nombre_completo', NEW.nombre_completo,
          'rol_anterior', OLD.rol_global,
          'rol_nuevo', NEW.rol_global
        ),
        OLD.rol_global,
        NEW.rol_global
      );
    END IF;

    IF (OLD.nombre_completo IS DISTINCT FROM NEW.nombre_completo OR OLD.correo != NEW.correo) THEN
      PERFORM registrar_auditoria_sistema(
        'usuario_editado',
        'usuario',
        NEW.id,
        jsonb_build_object(
          'correo_anterior', OLD.correo,
          'correo_nuevo', NEW.correo,
          'nombre_anterior', OLD.nombre_completo,
          'nombre_nuevo', NEW.nombre_completo
        )
      );
    END IF;

    RETURN NEW;
  END IF;

  IF (TG_OP = 'DELETE') THEN
    PERFORM registrar_auditoria_sistema(
      'usuario_eliminado',
      'usuario',
      OLD.id,
      jsonb_build_object(
        'correo', OLD.correo,
        'nombre_completo', OLD.nombre_completo,
        'rol_global', OLD.rol_global,
        'activo', COALESCE(OLD.activo, true)
      )
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_auditoria_usuarios_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rol_info RECORD;
  v_usuario_info RECORD;
BEGIN
  SELECT correo, nombre_completo INTO v_usuario_info
  FROM public.perfiles
  WHERE id = COALESCE(NEW.usuario_id, OLD.usuario_id);

  IF (TG_OP = 'INSERT') THEN
    SELECT rm.nombre, rm.codigo, rm.modulo_id, rm.nivel
    INTO v_rol_info
    FROM public.roles_modulo rm
    WHERE rm.id = NEW.rol_id;

    PERFORM registrar_auditoria_sistema(
      'rol_modulo_asignado',
      'usuario',
      NEW.usuario_id,
      jsonb_build_object(
        'usuario_correo', v_usuario_info.correo,
        'usuario_nombre', v_usuario_info.nombre_completo,
        'modulo_id', NEW.modulo_id,
        'rol_id', NEW.rol_id,
        'rol_codigo', v_rol_info.codigo,
        'rol_nombre', v_rol_info.nombre,
        'rol_nivel', v_rol_info.nivel,
        'asignado_por', NEW.asignado_por
      )
    );
    RETURN NEW;
  END IF;

  IF (TG_OP = 'DELETE') THEN
    SELECT rm.nombre, rm.codigo, rm.modulo_id, rm.nivel
    INTO v_rol_info
    FROM public.roles_modulo rm
    WHERE rm.id = OLD.rol_id;

    PERFORM registrar_auditoria_sistema(
      'rol_modulo_removido',
      'usuario',
      OLD.usuario_id,
      jsonb_build_object(
        'usuario_correo', v_usuario_info.correo,
        'usuario_nombre', v_usuario_info.nombre_completo,
        'modulo_id', OLD.modulo_id,
        'rol_id', OLD.rol_id,
        'rol_codigo', v_rol_info.codigo,
        'rol_nombre', v_rol_info.nombre,
        'rol_nivel', v_rol_info.nivel
      )
    );
    RETURN OLD;
  END IF;

  IF (TG_OP = 'UPDATE' AND OLD.rol_id != NEW.rol_id) THEN
    DECLARE
      v_rol_anterior RECORD;
    BEGIN
      SELECT nombre, codigo, nivel INTO v_rol_anterior
      FROM public.roles_modulo
      WHERE id = OLD.rol_id;

      SELECT nombre, codigo, nivel INTO v_rol_info
      FROM public.roles_modulo
      WHERE id = NEW.rol_id;

      PERFORM registrar_auditoria_sistema(
        'rol_modulo_cambiado',
        'usuario',
        NEW.usuario_id,
        jsonb_build_object(
          'usuario_correo', v_usuario_info.correo,
          'usuario_nombre', v_usuario_info.nombre_completo,
          'modulo_id', NEW.modulo_id,
          'rol_anterior_codigo', v_rol_anterior.codigo,
          'rol_anterior_nombre', v_rol_anterior.nombre,
          'rol_nuevo_codigo', v_rol_info.codigo,
          'rol_nuevo_nombre', v_rol_info.nombre,
          'asignado_por', NEW.asignado_por
        ),
        v_rol_anterior.nombre,
        v_rol_info.nombre
      );
    END;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION registrar_auditoria_sistema IS
  'Función para registrar manualmente una acción en la auditoría del sistema. Captura automáticamente el usuario autenticado.';

CREATE OR REPLACE FUNCTION registrar_login_fallido(
  p_correo TEXT,
  p_razon TEXT DEFAULT 'Credenciales inválidas',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.sys_auditoria (
    accion,
    entidad_tipo,
    detalles,
    realizado_por,
    ip_address,
    user_agent
  ) VALUES (
    'login_fallido',
    'sesion',
    jsonb_build_object(
      'correo', p_correo,
      'razon', p_razon
    ),
    NULL,
    p_ip_address,
    p_user_agent
  );
END;
$$;

GRANT EXECUTE ON FUNCTION registrar_login_fallido TO anon;
GRANT EXECUTE ON FUNCTION registrar_login_fallido TO authenticated;

COMMENT ON FUNCTION registrar_login_fallido IS
  'Registra intentos de login fallidos. Solo inserta login_fallido — callable por anon sin sesión activa.';

-- Permitir que usuarios autenticados llamen registrar_auditoria_sistema desde API routes del servidor
GRANT EXECUTE ON FUNCTION registrar_auditoria_sistema(TEXT,TEXT,UUID,JSONB,TEXT,TEXT,INET,TEXT,UUID) TO authenticated;

-- =========================================================================
-- Hash chain para no repudio (SHA-256 encadenado)
-- Requiere pgcrypto en schema extensions (Supabase Dashboard → Extensions).
-- =========================================================================

-- Versión con sesion_id (9 parámetros) — reemplaza la de 8 para evitar ambigüedad
DROP FUNCTION IF EXISTS public.registrar_auditoria_sistema(TEXT, TEXT, UUID, JSONB, TEXT, TEXT, INET, TEXT);

CREATE OR REPLACE FUNCTION registrar_auditoria_sistema(
  p_accion         TEXT,
  p_entidad_tipo   TEXT  DEFAULT NULL,
  p_entidad_id     UUID  DEFAULT NULL,
  p_detalles       JSONB DEFAULT NULL,
  p_valor_anterior TEXT  DEFAULT NULL,
  p_valor_nuevo    TEXT  DEFAULT NULL,
  p_ip_address     INET  DEFAULT NULL,
  p_user_agent     TEXT  DEFAULT NULL,
  p_sesion_id      UUID  DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nuevo_id    UUID;
  v_sesion_id UUID;
BEGIN
  IF p_sesion_id IS NOT NULL THEN
    v_sesion_id := p_sesion_id;
  ELSE
    BEGIN
      v_sesion_id := NULLIF(current_setting('app.current_session_id', true), '')::UUID;
    EXCEPTION WHEN OTHERS THEN
      v_sesion_id := NULL;
    END;
  END IF;

  INSERT INTO public.sys_auditoria (
    accion, entidad_tipo, entidad_id, detalles,
    valor_anterior, valor_nuevo,
    realizado_por, sesion_id,
    ip_address, user_agent
  ) VALUES (
    p_accion, p_entidad_tipo, p_entidad_id, p_detalles,
    p_valor_anterior, p_valor_nuevo,
    auth.uid(), v_sesion_id,
    p_ip_address, p_user_agent
  )
  RETURNING id INTO nuevo_id;

  RETURN nuevo_id;
END;
$$;

GRANT EXECUTE ON FUNCTION registrar_auditoria_sistema(TEXT,TEXT,UUID,JSONB,TEXT,TEXT,INET,TEXT,UUID) TO authenticated;

-- Función de cómputo SHA-256 (IMMUTABLE, reutilizable por trigger y verificación)
CREATE OR REPLACE FUNCTION _auditoria_compute_hash(
  p_id UUID, p_accion TEXT, p_entidad_tipo TEXT, p_entidad_id UUID,
  p_detalles JSONB, p_valor_ant TEXT, p_valor_nuevo TEXT,
  p_realizado_por UUID, p_ip INET, p_creado_en TIMESTAMPTZ, p_hash_ant TEXT
)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE PARALLEL SAFE
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog
AS $$
  SELECT encode(
    digest(
      p_id::text || '|' || p_accion || '|' ||
      COALESCE(p_entidad_tipo,'') || '|' || COALESCE(p_entidad_id::text,'') || '|' ||
      COALESCE(p_detalles::text,'{}') || '|' || COALESCE(p_valor_ant,'') || '|' ||
      COALESCE(p_valor_nuevo,'') || '|' || COALESCE(p_realizado_por::text,'') || '|' ||
      COALESCE(p_ip::text,'') || '|' || p_creado_en::text || '|' ||
      COALESCE(p_hash_ant,'GENESIS'),
      'sha256'
    ), 'hex'
  );
$$;

GRANT EXECUTE ON FUNCTION _auditoria_compute_hash(UUID,TEXT,TEXT,UUID,JSONB,TEXT,TEXT,UUID,INET,TIMESTAMPTZ,TEXT) TO authenticated;

-- Trigger BEFORE INSERT: asigna hash_anterior y computa hash_registro (orden creado_en)
CREATE OR REPLACE FUNCTION _auditoria_asignar_hash()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash_ant TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('sys_auditoria_chain'));

  SELECT hash_registro INTO v_hash_ant
  FROM   public.sys_auditoria
  ORDER  BY creado_en DESC, id DESC
  LIMIT  1;

  NEW.hash_anterior := COALESCE(v_hash_ant, 'GENESIS');
  NEW.hash_registro := _auditoria_compute_hash(
    NEW.id, NEW.accion, NEW.entidad_tipo, NEW.entidad_id,
    NEW.detalles, NEW.valor_anterior, NEW.valor_nuevo,
    NEW.realizado_por, NEW.ip_address,
    COALESCE(NEW.creado_en, now()),
    NEW.hash_anterior
  );
  RETURN NEW;
END;
$$;

-- Trigger de inmutabilidad: bloquea UPDATE y DELETE en sys_auditoria
CREATE OR REPLACE FUNCTION _auditoria_inmutable()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION
    'AUDIT_IMMUTABLE: registro inmutable (accion=%, secuencia=%). Operación % denegada.',
    COALESCE(OLD.accion,'?'), COALESCE(OLD.secuencia::text,'?'), TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

-- Verificación de integridad del hash chain (con detalle del primer registro corrupto)
DROP FUNCTION IF EXISTS verificar_integridad_auditoria(TIMESTAMPTZ, TIMESTAMPTZ);

CREATE OR REPLACE FUNCTION verificar_integridad_auditoria(
  p_desde TIMESTAMPTZ DEFAULT NULL,
  p_hasta TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE(
  total_registros           BIGINT,
  registros_integros        BIGINT,
  registros_corruptos       BIGINT,
  cadena_integra            BOOLEAN,
  primer_secuencia_corrupta BIGINT,
  primer_accion_corrupta    TEXT,
  primer_fecha_corrupta     TIMESTAMPTZ,
  primer_usuario_corrupto   UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total     BIGINT := 0;  v_integros  BIGINT := 0;  v_corruptos BIGINT := 0;
  v_primer_seq BIGINT := NULL; v_primer_acc TEXT := NULL;
  v_primer_fec TIMESTAMPTZ := NULL; v_primer_usr UUID := NULL;
  v_prev_hash TEXT := 'GENESIS';
  rec RECORD; v_hash_esp TEXT;
BEGIN
  FOR rec IN
    SELECT * FROM public.sys_auditoria
    WHERE (p_desde IS NULL OR creado_en >= p_desde)
      AND (p_hasta IS NULL OR creado_en <= p_hasta)
    ORDER BY creado_en ASC, id ASC
  LOOP
    v_total := v_total + 1;
    v_hash_esp := _auditoria_compute_hash(
      rec.id, rec.accion, rec.entidad_tipo, rec.entidad_id,
      rec.detalles, rec.valor_anterior, rec.valor_nuevo,
      rec.realizado_por, rec.ip_address, rec.creado_en, rec.hash_anterior
    );
    IF rec.hash_registro = v_hash_esp AND rec.hash_anterior = v_prev_hash THEN
      v_integros := v_integros + 1;
    ELSE
      v_corruptos := v_corruptos + 1;
      IF v_primer_seq IS NULL THEN
        v_primer_seq := rec.secuencia; v_primer_acc := rec.accion;
        v_primer_fec := rec.creado_en; v_primer_usr := rec.realizado_por;
      END IF;
    END IF;
    v_prev_hash := COALESCE(rec.hash_registro, v_prev_hash);
  END LOOP;
  RETURN QUERY SELECT v_total, v_integros, v_corruptos, (v_corruptos = 0),
    v_primer_seq, v_primer_acc, v_primer_fec, v_primer_usr;
END;
$$;

GRANT EXECUTE ON FUNCTION verificar_integridad_auditoria(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
COMMENT ON FUNCTION verificar_integridad_auditoria IS
  'Verifica hash chain de sys_auditoria. Detecta registros corruptos o modificados. Solo superadmin vía API.';
