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

-- Superadmins pueden modificar cualquier perfil
DROP POLICY IF EXISTS "Los superadmins pueden modificar perfiles" ON public.perfiles;
CREATE POLICY "Los superadmins pueden modificar perfiles"
  ON public.perfiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol_global = 'superadmin'
    )
  );

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
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE public.perfiles IS
  'Perfiles de usuarios del sistema. Extiende auth.users de Supabase con información adicional. Cada usuario tiene un rol global (usuario o superadmin) que determina su nivel de acceso base.';

COMMENT ON COLUMN public.perfiles.id IS
  'Identificador único del perfil (UUID). Referencia a auth.users(id) de Supabase';

COMMENT ON COLUMN public.perfiles.correo IS
  'Correo electrónico del usuario (único)';

COMMENT ON COLUMN public.perfiles.nombre_completo IS
  'Nombre completo del usuario para mostrar en la interfaz';

COMMENT ON COLUMN public.perfiles.rol_global IS
  'Rol global del usuario: "usuario" (acceso regular) o "superadmin" (acceso administrativo completo)';

COMMENT ON COLUMN public.perfiles.url_avatar IS
  'URL de la imagen de perfil del usuario (opcional)';

COMMENT ON COLUMN public.perfiles.creado_en IS
  'Fecha y hora de creación del perfil';

COMMENT ON COLUMN public.perfiles.actualizado_en IS
  'Fecha y hora de la última actualización del perfil (actualizado automáticamente)';

COMMENT ON FUNCTION actualizar_timestamp_perfiles() IS
  'Trigger function que actualiza automáticamente el campo actualizado_en al modificar un perfil';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
