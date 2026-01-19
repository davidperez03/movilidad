CREATE TABLE IF NOT EXISTS public.modulos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  icono TEXT,
  ruta TEXT,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_modulos_activo ON public.modulos(activo);

CREATE TABLE IF NOT EXISTS public.roles_modulo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id TEXT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  permisos JSONB NOT NULL DEFAULT '{}',
  nivel INTEGER DEFAULT 0,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(modulo_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_roles_modulo_modulo_id ON public.roles_modulo(modulo_id);
CREATE INDEX IF NOT EXISTS idx_roles_modulo_codigo ON public.roles_modulo(codigo);

CREATE TABLE IF NOT EXISTS public.usuarios_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  modulo_id TEXT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  rol_id UUID NOT NULL REFERENCES roles_modulo(id) ON DELETE CASCADE,
  asignado_por UUID REFERENCES perfiles(id),
  asignado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(usuario_id, modulo_id)
);

CREATE INDEX IF NOT EXISTS idx_usuarios_roles_usuario ON public.usuarios_roles(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_modulo ON public.usuarios_roles(modulo_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_rol ON public.usuarios_roles(rol_id);

COMMENT ON TABLE public.modulos IS
  'Catálogo de módulos del sistema. Cada módulo representa una funcionalidad principal (ej: movilidad, reportes). Los módulos pueden activarse/desactivarse y tener roles específicos.';

COMMENT ON COLUMN public.modulos.id IS
  'Identificador único del módulo (texto). Ejemplos: "movilidad", "reportes", "tickets"';

COMMENT ON COLUMN public.modulos.nombre IS
  'Nombre descriptivo del módulo para mostrar en la interfaz';

COMMENT ON COLUMN public.modulos.descripcion IS
  'Descripción detallada de la funcionalidad del módulo';

COMMENT ON COLUMN public.modulos.icono IS
  'Nombre del icono para representar el módulo en la interfaz';

COMMENT ON COLUMN public.modulos.ruta IS
  'Ruta base del módulo en la aplicación (ej: /movilidad, /reportes)';

COMMENT ON COLUMN public.modulos.activo IS
  'Indica si el módulo está activo y disponible para los usuarios';

COMMENT ON COLUMN public.modulos.orden IS
  'Orden de presentación del módulo en menús y listados (menor número = mayor prioridad)';

COMMENT ON COLUMN public.modulos.creado_en IS
  'Fecha y hora de creación del módulo';

COMMENT ON COLUMN public.modulos.actualizado_en IS
  'Fecha y hora de la última actualización del módulo (actualizado automáticamente)';

COMMENT ON TABLE public.roles_modulo IS
  'Definición de roles disponibles por módulo. Cada rol tiene un conjunto de permisos específicos (almacenados en JSONB) y un nivel de jerarquía. Ejemplos: mov_usuario, mov_operador, mov_administrador.';

COMMENT ON COLUMN public.roles_modulo.id IS
  'Identificador único del rol (UUID)';

COMMENT ON COLUMN public.roles_modulo.modulo_id IS
  'ID del módulo al que pertenece este rol (referencia a modulos.id)';

COMMENT ON COLUMN public.roles_modulo.codigo IS
  'Código único del rol (ej: mov_usuario, mov_operador). Debe ser único por módulo.';

COMMENT ON COLUMN public.roles_modulo.nombre IS
  'Nombre descriptivo del rol para mostrar en la interfaz (ej: "Usuario de Movilidad")';

COMMENT ON COLUMN public.roles_modulo.descripcion IS
  'Descripción detallada de las capacidades y responsabilidades del rol';

COMMENT ON COLUMN public.roles_modulo.permisos IS
  'Objeto JSONB con permisos específicos del rol. Estructura: {"permiso1": true/false, "permiso2": true/false, ...}. Ejemplo: {"ver": true, "crear_cuentas": false, "editar_cuentas": false}';

COMMENT ON COLUMN public.roles_modulo.nivel IS
  'Nivel jerárquico del rol (0=básico, 1=intermedio, 2=administrador). Se usa para comparar niveles de acceso.';

COMMENT ON COLUMN public.roles_modulo.creado_en IS
  'Fecha y hora de creación del rol';

COMMENT ON COLUMN public.roles_modulo.actualizado_en IS
  'Fecha y hora de la última actualización del rol (actualizado automáticamente)';

COMMENT ON TABLE public.usuarios_roles IS
  'Asignación de roles a usuarios por módulo. Establece la relación entre usuarios y sus roles en cada módulo. Un usuario solo puede tener un rol por módulo.';

COMMENT ON COLUMN public.usuarios_roles.id IS
  'Identificador único de la asignación (UUID)';

COMMENT ON COLUMN public.usuarios_roles.usuario_id IS
  'ID del usuario al que se asigna el rol (referencia a perfiles.id)';

COMMENT ON COLUMN public.usuarios_roles.modulo_id IS
  'ID del módulo en el que se asigna el rol (referencia a modulos.id)';

COMMENT ON COLUMN public.usuarios_roles.rol_id IS
  'ID del rol asignado (referencia a roles_modulo.id)';

COMMENT ON COLUMN public.usuarios_roles.asignado_por IS
  'ID del usuario (generalmente superadmin) que realizó la asignación del rol';

COMMENT ON COLUMN public.usuarios_roles.asignado_en IS
  'Fecha y hora en que se asignó el rol';
