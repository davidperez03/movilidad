CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  correo TEXT NOT NULL,
  nombre_completo TEXT,
  rol_global TEXT NOT NULL DEFAULT 'usuario'
    CHECK (rol_global IN ('usuario', 'superadmin')),
  url_avatar TEXT,
  activo BOOLEAN DEFAULT true NOT NULL,
  suspendido_hasta TIMESTAMP WITH TIME ZONE,
  razon_suspension TEXT,
  ultima_conexion TIMESTAMP WITH TIME ZONE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_perfiles_correo ON public.perfiles(correo);
CREATE INDEX IF NOT EXISTS idx_perfiles_rol_global ON public.perfiles(rol_global);
CREATE INDEX IF NOT EXISTS idx_perfiles_activo ON public.perfiles(activo);

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

COMMENT ON COLUMN public.perfiles.activo IS
  'Indica si el usuario está activo en el sistema. Si es false, no puede iniciar sesión.';

COMMENT ON COLUMN public.perfiles.suspendido_hasta IS
  'Fecha hasta la cual el usuario está suspendido. NULL si no está suspendido.';

COMMENT ON COLUMN public.perfiles.razon_suspension IS
  'Motivo de la suspensión o desactivación del usuario.';

COMMENT ON COLUMN public.perfiles.ultima_conexion IS
  'Fecha y hora del último inicio de sesión exitoso del usuario.';

COMMENT ON COLUMN public.perfiles.creado_en IS
  'Fecha y hora de creación del perfil';

COMMENT ON COLUMN public.perfiles.actualizado_en IS
  'Fecha y hora de la última actualización del perfil (actualizado automáticamente)';
