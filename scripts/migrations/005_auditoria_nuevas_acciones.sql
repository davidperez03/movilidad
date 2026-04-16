-- Migración 005: Agregar nuevas acciones de auditoría
-- Agrega 'password_cambiado' y 'usuario_aprobado' al CHECK constraint de sys_auditoria
-- y otorga permiso de ejecución a usuarios autenticados para llamar la función desde API routes.
--
-- Versión: v1.16.0
-- Fecha: 2026-04-16

BEGIN;

-- 1. Actualizar CHECK constraint en sys_auditoria.accion
ALTER TABLE public.sys_auditoria
  DROP CONSTRAINT IF EXISTS sys_auditoria_accion_check;

ALTER TABLE public.sys_auditoria
  ADD CONSTRAINT sys_auditoria_accion_check CHECK (accion IN (
    'usuario_creado',
    'usuario_editado',
    'usuario_eliminado',
    'usuario_activado',
    'usuario_desactivado',
    'usuario_aprobado',
    'rol_global_cambiado',
    'rol_modulo_asignado',
    'rol_modulo_removido',
    'rol_modulo_cambiado',
    'password_reseteado',
    'password_cambiado',
    'modulo_activado',
    'modulo_desactivado',
    'configuracion_modificada',
    'login_exitoso',
    'login_fallido',
    'logout',
    'sesion_expirada',
    'sesion_cerrada_por_admin',
    'sesiones_token_expirado'
  ));

-- 2. Otorgar permiso de ejecución a usuarios autenticados
--    (necesario para llamar via supabase.rpc() desde API routes del servidor)
GRANT EXECUTE ON FUNCTION public.registrar_auditoria_sistema TO authenticated;

COMMIT;

-- ROLLBACK:
-- BEGIN;
-- ALTER TABLE public.sys_auditoria DROP CONSTRAINT IF EXISTS sys_auditoria_accion_check;
-- ALTER TABLE public.sys_auditoria ADD CONSTRAINT sys_auditoria_accion_check CHECK (accion IN (
--   'usuario_creado','usuario_editado','usuario_eliminado','usuario_activado','usuario_desactivado',
--   'rol_global_cambiado','rol_modulo_asignado','rol_modulo_removido','rol_modulo_cambiado',
--   'password_reseteado','modulo_activado','modulo_desactivado','configuracion_modificada',
--   'login_exitoso','login_fallido','logout','sesion_expirada','sesion_cerrada_por_admin','sesiones_token_expirado'
-- ));
-- REVOKE EXECUTE ON FUNCTION public.registrar_auditoria_sistema FROM authenticated;
-- COMMIT;
