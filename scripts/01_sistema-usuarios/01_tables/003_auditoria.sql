CREATE TABLE IF NOT EXISTS public.sys_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

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

  entidad_tipo TEXT CHECK (entidad_tipo IN (
    'usuario',
    'rol',
    'modulo',
    'configuracion',
    'sesion'
  )),
  entidad_id UUID,

  detalles JSONB DEFAULT '{}'::jsonb,

  valor_anterior TEXT,
  valor_nuevo TEXT,

  realizado_por UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,

  ip_address INET,
  user_agent TEXT,

  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sys_auditoria_accion
  ON public.sys_auditoria(accion);

CREATE INDEX IF NOT EXISTS idx_sys_auditoria_entidad
  ON public.sys_auditoria(entidad_tipo, entidad_id);

CREATE INDEX IF NOT EXISTS idx_sys_auditoria_realizado_por
  ON public.sys_auditoria(realizado_por);

CREATE INDEX IF NOT EXISTS idx_sys_auditoria_creado_en
  ON public.sys_auditoria(creado_en DESC);

CREATE INDEX IF NOT EXISTS idx_sys_auditoria_detalles_gin
  ON public.sys_auditoria USING gin(detalles);

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
