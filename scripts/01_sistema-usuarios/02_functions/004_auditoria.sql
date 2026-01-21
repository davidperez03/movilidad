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
