-- ============================================================================
-- SISTEMA DE USUARIOS - PERFILES BASE
-- Tabla de perfiles de usuario
-- ============================================================================

-- Crear tabla perfiles
-- Esta tabla extiende auth.users con información adicional del usuario
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  correo TEXT NOT NULL,
  nombre_completo TEXT,
  rol_global TEXT NOT NULL DEFAULT 'usuario'
    CHECK (rol_global IN ('usuario', 'superadmin')),
  url_avatar TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Crear índice para búsquedas por correo
CREATE INDEX IF NOT EXISTS idx_perfiles_correo ON public.perfiles(correo);
CREATE INDEX IF NOT EXISTS idx_perfiles_rol_global ON public.perfiles(rol_global);

-- Habilitar Row Level Security
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- Políticas de perfiles
DROP POLICY IF EXISTS "Los usuarios pueden ver todos los perfiles" ON public.perfiles;
CREATE POLICY "Los usuarios pueden ver todos los perfiles"
  ON public.perfiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.perfiles;
CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.perfiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Los usuarios pueden insertar su propio perfil" ON public.perfiles;
CREATE POLICY "Los usuarios pueden insertar su propio perfil"
  ON public.perfiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- NOTA: La política de superadmin fue removida porque causaba recursión infinita en RLS
-- Los superadmins deben modificar perfiles desde:
-- 1. Dashboard de Supabase directamente
-- 2. Funciones SECURITY DEFINER específicas
DROP POLICY IF EXISTS "Los superadmins pueden modificar perfiles" ON public.perfiles;

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION actualizar_timestamp_perfiles()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp
DROP TRIGGER IF EXISTS trigger_actualizar_perfiles ON public.perfiles;
CREATE TRIGGER trigger_actualizar_perfiles
  BEFORE UPDATE ON public.perfiles
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp_perfiles();

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
