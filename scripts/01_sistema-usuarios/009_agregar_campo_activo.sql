-- ============================================================================
-- AGREGAR CAMPO ACTIVO A PERFILES
-- Permite activar/desactivar usuarios sin eliminarlos
-- ============================================================================

-- Agregar campo activo si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'perfiles'
    AND column_name = 'activo'
  ) THEN
    ALTER TABLE public.perfiles
    ADD COLUMN activo BOOLEAN DEFAULT true NOT NULL;
  END IF;
END $$;

-- Agregar índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_perfiles_activo ON public.perfiles(activo);

-- Agregar campo suspendido_hasta para suspensiones temporales
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'perfiles'
    AND column_name = 'suspendido_hasta'
  ) THEN
    ALTER TABLE public.perfiles
    ADD COLUMN suspendido_hasta TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Agregar campo razon_suspension para registrar el motivo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'perfiles'
    AND column_name = 'razon_suspension'
  ) THEN
    ALTER TABLE public.perfiles
    ADD COLUMN razon_suspension TEXT;
  END IF;
END $$;

-- Agregar campo ultima_conexion
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'perfiles'
    AND column_name = 'ultima_conexion'
  ) THEN
    ALTER TABLE public.perfiles
    ADD COLUMN ultima_conexion TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- ============================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON COLUMN public.perfiles.activo IS
  'Indica si el usuario está activo en el sistema. Si es false, no puede iniciar sesión.';

COMMENT ON COLUMN public.perfiles.suspendido_hasta IS
  'Fecha hasta la cual el usuario está suspendido. NULL si no está suspendido.';

COMMENT ON COLUMN public.perfiles.razon_suspension IS
  'Motivo de la suspensión o desactivación del usuario.';

COMMENT ON COLUMN public.perfiles.ultima_conexion IS
  'Fecha y hora del último inicio de sesión exitoso del usuario.';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
