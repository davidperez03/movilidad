-- ============================================================================
-- SISTEMA DE AUDITORÍA GLOBAL
-- Registro de acciones administrativas del sistema
-- ============================================================================

-- ============================================================================
-- TABLA: sys_auditoria
-- Descripción: Registra todas las acciones administrativas del sistema
--              (creación/edición de usuarios, cambios de roles, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sys_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tipo de acción realizada
  accion TEXT NOT NULL CHECK (accion IN (
    'usuario_creado',
    'usuario_editado',
    'usuario_eliminado',
    'usuario_activado',
    'usuario_desactivado',
    'rol_global_cambiado',
    'rol_modulo_asignado',
    'rol_modulo_removido',
    'password_reseteado',
    'modulo_activado',
    'modulo_desactivado',
    'configuracion_modificada',
    'login_exitoso',
    'login_fallido',
    'logout',
    'sesion_expirada'
  )),

  -- Entidad afectada
  entidad_tipo TEXT CHECK (entidad_tipo IN (
    'usuario',
    'rol',
    'modulo',
    'configuracion',
    'sesion'
  )),
  entidad_id UUID,  -- ID de la entidad afectada (usuario_id, modulo_id, etc.)

  -- Detalles adicionales en formato JSON
  detalles JSONB DEFAULT '{}'::jsonb,

  -- Valores anteriores y nuevos (para cambios)
  valor_anterior TEXT,
  valor_nuevo TEXT,

  -- Usuario que realizó la acción
  realizado_por UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,

  -- Información de contexto
  ip_address INET,  -- Dirección IP desde donde se realizó la acción
  user_agent TEXT,  -- Navegador/cliente utilizado

  -- Timestamp
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_sys_auditoria_accion
  ON public.sys_auditoria(accion);

CREATE INDEX IF NOT EXISTS idx_sys_auditoria_entidad
  ON public.sys_auditoria(entidad_tipo, entidad_id);

CREATE INDEX IF NOT EXISTS idx_sys_auditoria_realizado_por
  ON public.sys_auditoria(realizado_por);

CREATE INDEX IF NOT EXISTS idx_sys_auditoria_creado_en
  ON public.sys_auditoria(creado_en DESC);

-- Índice GIN para búsquedas en el campo JSONB detalles
CREATE INDEX IF NOT EXISTS idx_sys_auditoria_detalles_gin
  ON public.sys_auditoria USING gin(detalles);

-- ============================================================================
-- FUNCIONES AUXILIARES
-- ============================================================================

-- Función para registrar auditoría
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

-- ============================================================================
-- TRIGGERS AUTOMÁTICOS
-- ============================================================================

-- Trigger para registrar cambios en perfiles (MEJORADO)
CREATE OR REPLACE FUNCTION trigger_auditoria_perfiles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Registro de creación de usuario
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

  -- Registro de actualización de usuario
  IF (TG_OP = 'UPDATE') THEN
    -- Si cambió el estado activo
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

    -- Si cambió el rol global
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

    -- Si cambió el nombre o correo
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

  -- Registro de eliminación de usuario
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

DROP TRIGGER IF EXISTS trigger_auditoria_perfiles ON public.perfiles;

CREATE TRIGGER trigger_auditoria_perfiles
  AFTER INSERT OR UPDATE OR DELETE ON public.perfiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auditoria_perfiles();

-- Trigger para registrar cambios en usuarios_roles (MEJORADO)
CREATE OR REPLACE FUNCTION trigger_auditoria_usuarios_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rol_info RECORD;
  v_usuario_info RECORD;
BEGIN
  -- Obtener información del usuario afectado
  SELECT correo, nombre_completo INTO v_usuario_info
  FROM public.perfiles
  WHERE id = COALESCE(NEW.usuario_id, OLD.usuario_id);

  -- Asignación de rol
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

  -- Remoción de rol
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

  -- Actualización de rol (cambio de rol en mismo módulo)
  IF (TG_OP = 'UPDATE' AND OLD.rol_id != NEW.rol_id) THEN
    DECLARE
      v_rol_anterior RECORD;
    BEGIN
      -- Obtener información del rol anterior
      SELECT nombre, codigo, nivel INTO v_rol_anterior
      FROM public.roles_modulo
      WHERE id = OLD.rol_id;

      -- Obtener información del rol nuevo
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

DROP TRIGGER IF EXISTS trigger_auditoria_usuarios_roles ON public.usuarios_roles;

CREATE TRIGGER trigger_auditoria_usuarios_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.usuarios_roles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auditoria_usuarios_roles();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.sys_auditoria ENABLE ROW LEVEL SECURITY;

-- Solo superadmins pueden ver la auditoría del sistema
DROP POLICY IF EXISTS "Solo superadmins pueden ver auditoría" ON public.sys_auditoria;
CREATE POLICY "Solo superadmins pueden ver auditoría"
  ON public.sys_auditoria FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol_global = 'superadmin'
    )
  );

-- Solo el sistema puede insertar (vía triggers y funciones)
DROP POLICY IF EXISTS "Solo sistema puede insertar auditoría" ON public.sys_auditoria;
CREATE POLICY "Solo sistema puede insertar auditoría"
  ON public.sys_auditoria FOR INSERT
  WITH CHECK (false);  -- Solo funciones SECURITY DEFINER pueden insertar

-- ============================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE public.sys_auditoria IS
  'Registro de auditoría para acciones administrativas del sistema. Incluye creación/edición de usuarios, cambios de roles, modificaciones de configuración, y eventos de autenticación.';

COMMENT ON COLUMN public.sys_auditoria.id IS
  'Identificador único del registro de auditoría';

COMMENT ON COLUMN public.sys_auditoria.accion IS
  'Tipo de acción realizada (usuario_creado, rol_global_cambiado, login_exitoso, etc.)';

COMMENT ON COLUMN public.sys_auditoria.entidad_tipo IS
  'Tipo de entidad afectada (usuario, rol, modulo, configuracion, sesion)';

COMMENT ON COLUMN public.sys_auditoria.entidad_id IS
  'ID de la entidad afectada (UUID del usuario, módulo, etc.)';

COMMENT ON COLUMN public.sys_auditoria.detalles IS
  'Información adicional en formato JSON (varía según el tipo de acción)';

COMMENT ON COLUMN public.sys_auditoria.valor_anterior IS
  'Valor antes del cambio (para acciones de actualización)';

COMMENT ON COLUMN public.sys_auditoria.valor_nuevo IS
  'Valor después del cambio (para acciones de actualización)';

COMMENT ON COLUMN public.sys_auditoria.realizado_por IS
  'ID del usuario que realizó la acción (NULL si fue el sistema)';

COMMENT ON COLUMN public.sys_auditoria.ip_address IS
  'Dirección IP desde donde se realizó la acción';

COMMENT ON COLUMN public.sys_auditoria.user_agent IS
  'Información del navegador/cliente utilizado';

COMMENT ON COLUMN public.sys_auditoria.creado_en IS
  'Fecha y hora en que se realizó la acción';

COMMENT ON FUNCTION registrar_auditoria_sistema IS
  'Función para registrar manualmente una acción en la auditoría del sistema. Captura automáticamente el usuario autenticado.';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
