-- ============================================================
-- Migración 004: Función registrar_login_fallido
-- ============================================================
-- Permite registrar intentos de login fallidos en sys_auditoria
-- incluso sin usuario autenticado (GRANT TO anon).
-- La función es restrictiva: solo inserta 'login_fallido',
-- no permite insertar otros tipos de acción.
-- ============================================================

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
    NULL,      -- sin auth.uid() en contexto anon
    p_ip_address,
    p_user_agent
  );
END;
$$;

-- Callable por anon (usuario no autenticado) y authenticated
GRANT EXECUTE ON FUNCTION registrar_login_fallido TO anon;
GRANT EXECUTE ON FUNCTION registrar_login_fallido TO authenticated;

COMMENT ON FUNCTION registrar_login_fallido IS
  'Registra intentos de login fallidos. Solo inserta login_fallido — no permite otros tipos de acción. GRANT TO anon para llamarla sin sesión activa.';

-- ============================================================
-- ROLLBACK:
--   DROP FUNCTION IF EXISTS registrar_login_fallido;
-- ============================================================
