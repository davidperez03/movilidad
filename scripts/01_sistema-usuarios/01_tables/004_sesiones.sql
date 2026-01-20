CREATE TABLE IF NOT EXISTS public.sys_sesiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,

  token_sesion TEXT,
  token_expira_en TIMESTAMP WITH TIME ZONE,

  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN (
    'activa',
    'cerrada',
    'expirada',
    'forzada_cierre'
  )),

  inicio_sesion TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  fin_sesion TIMESTAMP WITH TIME ZONE,
  duracion_minutos INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN fin_sesion IS NOT NULL
      THEN EXTRACT(EPOCH FROM (fin_sesion - inicio_sesion)) / 60
      ELSE NULL
    END
  ) STORED,

  ip_address INET,
  user_agent TEXT,
  dispositivo TEXT,

  ultima_actividad TIMESTAMP WITH TIME ZONE DEFAULT now(),
  acciones_realizadas INTEGER DEFAULT 0,

  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sys_sesiones_usuario_id
  ON public.sys_sesiones(usuario_id);

CREATE INDEX IF NOT EXISTS idx_sys_sesiones_estado
  ON public.sys_sesiones(estado);

CREATE INDEX IF NOT EXISTS idx_sys_sesiones_inicio
  ON public.sys_sesiones(inicio_sesion DESC);

CREATE INDEX IF NOT EXISTS idx_sys_sesiones_ultima_actividad
  ON public.sys_sesiones(ultima_actividad DESC);

CREATE INDEX IF NOT EXISTS idx_sys_sesiones_usuario_estado
  ON public.sys_sesiones(usuario_id, estado);

CREATE INDEX IF NOT EXISTS idx_sys_sesiones_token_expira
  ON public.sys_sesiones(token_expira_en)
  WHERE estado = 'activa';

DROP VIEW IF EXISTS sys_vista_sesiones_activas;
CREATE VIEW sys_vista_sesiones_activas
WITH (security_invoker = true) AS
SELECT
  s.id,
  s.usuario_id,
  p.correo,
  p.nombre_completo,
  s.inicio_sesion,
  s.ultima_actividad,
  EXTRACT(EPOCH FROM (now() - s.ultima_actividad)) / 60 AS minutos_inactivo,
  s.ip_address,
  s.dispositivo,
  s.acciones_realizadas,
  s.token_expira_en
FROM public.sys_sesiones s
JOIN public.perfiles p ON s.usuario_id = p.id
WHERE s.estado = 'activa'
ORDER BY s.ultima_actividad DESC;

DROP VIEW IF EXISTS sys_vista_resumen_sesiones;
CREATE VIEW sys_vista_resumen_sesiones
WITH (security_invoker = true) AS
SELECT
  p.id AS usuario_id,
  p.correo,
  p.nombre_completo,
  COUNT(*) AS total_sesiones,
  COUNT(*) FILTER (WHERE s.estado = 'activa') AS sesiones_activas,
  MAX(s.inicio_sesion) AS ultima_sesion,
  AVG(s.duracion_minutos) FILTER (WHERE s.duracion_minutos IS NOT NULL) AS duracion_promedio_minutos,
  SUM(s.duracion_minutos) FILTER (WHERE s.duracion_minutos IS NOT NULL) AS tiempo_total_minutos
FROM public.perfiles p
LEFT JOIN public.sys_sesiones s ON p.id = s.usuario_id
GROUP BY p.id, p.correo, p.nombre_completo;

COMMENT ON TABLE public.sys_sesiones IS
  'Registro de todas las sesiones de usuarios. Rastrea inicio, fin, duración, y actividad de cada sesión para análisis y auditoría.';

COMMENT ON COLUMN public.sys_sesiones.id IS
  'Identificador único de la sesión';

COMMENT ON COLUMN public.sys_sesiones.usuario_id IS
  'ID del usuario propietario de la sesión';

COMMENT ON COLUMN public.sys_sesiones.token_sesion IS
  'Token de sesión de Supabase (si está disponible)';

COMMENT ON COLUMN public.sys_sesiones.token_expira_en IS
  'Fecha de expiración del token extraída del campo exp del JWT';

COMMENT ON COLUMN public.sys_sesiones.estado IS
  'Estado actual de la sesión (activa, cerrada, expirada, forzada_cierre)';

COMMENT ON COLUMN public.sys_sesiones.inicio_sesion IS
  'Fecha y hora de inicio de la sesión (login)';

COMMENT ON COLUMN public.sys_sesiones.fin_sesion IS
  'Fecha y hora de fin de la sesión (logout o expiración)';

COMMENT ON COLUMN public.sys_sesiones.duracion_minutos IS
  'Duración total de la sesión en minutos (calculado automáticamente)';

COMMENT ON COLUMN public.sys_sesiones.ip_address IS
  'Dirección IP del cliente';

COMMENT ON COLUMN public.sys_sesiones.user_agent IS
  'Información del navegador/cliente utilizado';

COMMENT ON COLUMN public.sys_sesiones.dispositivo IS
  'Tipo de dispositivo (web, mobile, tablet)';

COMMENT ON COLUMN public.sys_sesiones.ultima_actividad IS
  'Fecha y hora de la última actividad registrada en esta sesión';

COMMENT ON COLUMN public.sys_sesiones.acciones_realizadas IS
  'Contador de acciones realizadas durante la sesión';

COMMENT ON VIEW sys_vista_sesiones_activas IS
  'Vista de todas las sesiones actualmente activas con información de usuario e inactividad';

COMMENT ON VIEW sys_vista_resumen_sesiones IS
  'Vista de resumen estadístico de sesiones por usuario (total, activas, tiempo promedio)';
