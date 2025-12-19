-- ============================================================================
-- SISTEMA DE SESIONES DE USUARIOS
-- Registro y seguimiento de sesiones activas e históricas
-- ============================================================================

-- ============================================================================
-- TABLA: sys_sesiones
-- Descripción: Registra todas las sesiones de usuarios (login, logout, duración)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sys_sesiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Usuario de la sesión
  usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,

  -- Información de la sesión
  token_sesion TEXT,  -- Token de sesión de Supabase (si está disponible)

  -- Estado de la sesión
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN (
    'activa',
    'cerrada',
    'expirada',
    'forzada_cierre'  -- Cerrada por administrador
  )),

  -- Timestamps
  inicio_sesion TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  fin_sesion TIMESTAMP WITH TIME ZONE,
  duracion_minutos INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN fin_sesion IS NOT NULL
      THEN EXTRACT(EPOCH FROM (fin_sesion - inicio_sesion)) / 60
      ELSE NULL
    END
  ) STORED,

  -- Información de contexto
  ip_address INET,  -- Dirección IP del cliente
  user_agent TEXT,  -- Navegador/cliente utilizado
  dispositivo TEXT,  -- Tipo de dispositivo (web, mobile, tablet)
  ubicacion JSONB,  -- Información de geolocalización (opcional)

  -- Actividad de la sesión
  ultima_actividad TIMESTAMP WITH TIME ZONE DEFAULT now(),
  paginas_visitadas INTEGER DEFAULT 0,
  acciones_realizadas INTEGER DEFAULT 0,

  -- Metadatos
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_sys_sesiones_usuario_id
  ON public.sys_sesiones(usuario_id);

CREATE INDEX IF NOT EXISTS idx_sys_sesiones_estado
  ON public.sys_sesiones(estado);

CREATE INDEX IF NOT EXISTS idx_sys_sesiones_inicio
  ON public.sys_sesiones(inicio_sesion DESC);

CREATE INDEX IF NOT EXISTS idx_sys_sesiones_ultima_actividad
  ON public.sys_sesiones(ultima_actividad DESC);

-- Índice compuesto para buscar sesiones activas por usuario
CREATE INDEX IF NOT EXISTS idx_sys_sesiones_usuario_estado
  ON public.sys_sesiones(usuario_id, estado);

-- ============================================================================
-- VISTAS
-- ============================================================================

-- Vista de sesiones activas
CREATE OR REPLACE VIEW sys_vista_sesiones_activas AS
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
  s.paginas_visitadas,
  s.acciones_realizadas
FROM public.sys_sesiones s
JOIN public.perfiles p ON s.usuario_id = p.id
WHERE s.estado = 'activa'
ORDER BY s.ultima_actividad DESC;

-- Vista de resumen de sesiones por usuario
CREATE OR REPLACE VIEW sys_vista_resumen_sesiones AS
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

-- ============================================================================
-- FUNCIONES AUXILIARES
-- ============================================================================

-- Función para registrar inicio de sesión
CREATE OR REPLACE FUNCTION registrar_inicio_sesion(
  p_usuario_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_dispositivo TEXT DEFAULT 'web'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  nueva_sesion_id UUID;
BEGIN
  INSERT INTO public.sys_sesiones (
    usuario_id,
    estado,
    inicio_sesion,
    ip_address,
    user_agent,
    dispositivo,
    ultima_actividad
  ) VALUES (
    p_usuario_id,
    'activa',
    now(),
    p_ip_address,
    p_user_agent,
    p_dispositivo,
    now()
  )
  RETURNING id INTO nueva_sesion_id;

  -- Registrar en auditoría
  PERFORM registrar_auditoria_sistema(
    'login_exitoso',
    'sesion',
    nueva_sesion_id,
    jsonb_build_object(
      'usuario_id', p_usuario_id,
      'ip_address', p_ip_address::text,
      'dispositivo', p_dispositivo
    ),
    NULL,
    NULL,
    p_ip_address,
    p_user_agent
  );

  RETURN nueva_sesion_id;
END;
$$;

-- Función para registrar fin de sesión
CREATE OR REPLACE FUNCTION registrar_fin_sesion(
  p_sesion_id UUID,
  p_estado TEXT DEFAULT 'cerrada'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_usuario_id UUID;
BEGIN
  UPDATE public.sys_sesiones
  SET
    estado = p_estado,
    fin_sesion = now(),
    actualizado_en = now()
  WHERE id = p_sesion_id AND estado = 'activa'
  RETURNING usuario_id INTO v_usuario_id;

  IF FOUND THEN
    -- Registrar en auditoría
    PERFORM registrar_auditoria_sistema(
      CASE p_estado
        WHEN 'cerrada' THEN 'logout'
        WHEN 'expirada' THEN 'sesion_expirada'
        ELSE 'logout'
      END,
      'sesion',
      p_sesion_id,
      jsonb_build_object('usuario_id', v_usuario_id)
    );

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Función para actualizar actividad de sesión
CREATE OR REPLACE FUNCTION actualizar_actividad_sesion(
  p_sesion_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.sys_sesiones
  SET
    ultima_actividad = now(),
    acciones_realizadas = acciones_realizadas + 1,
    actualizado_en = now()
  WHERE id = p_sesion_id AND estado = 'activa';

  RETURN FOUND;
END;
$$;

-- Función para cerrar sesiones inactivas (expiradas)
CREATE OR REPLACE FUNCTION cerrar_sesiones_inactivas(
  p_minutos_inactividad INTEGER DEFAULT 60
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sesiones_cerradas INTEGER;
BEGIN
  WITH sesiones_a_cerrar AS (
    UPDATE public.sys_sesiones
    SET
      estado = 'expirada',
      fin_sesion = now(),
      actualizado_en = now()
    WHERE estado = 'activa'
      AND ultima_actividad < (now() - (p_minutos_inactividad || ' minutes')::INTERVAL)
    RETURNING id, usuario_id
  )
  SELECT COUNT(*) INTO sesiones_cerradas FROM sesiones_a_cerrar;

  RETURN sesiones_cerradas;
END;
$$;

-- Función para obtener sesión activa de un usuario
CREATE OR REPLACE FUNCTION obtener_sesion_activa(p_usuario_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sesion_id UUID;
BEGIN
  SELECT id INTO sesion_id
  FROM public.sys_sesiones
  WHERE usuario_id = p_usuario_id
    AND estado = 'activa'
  ORDER BY inicio_sesion DESC
  LIMIT 1;

  RETURN sesion_id;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para actualizar timestamp
CREATE OR REPLACE FUNCTION trigger_actualizar_timestamp_sesiones()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_actualizar_sesiones ON public.sys_sesiones;

CREATE TRIGGER trigger_actualizar_sesiones
  BEFORE UPDATE ON public.sys_sesiones
  FOR EACH ROW
  EXECUTE FUNCTION trigger_actualizar_timestamp_sesiones();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.sys_sesiones ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propias sesiones
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias sesiones" ON public.sys_sesiones;
CREATE POLICY "Usuarios pueden ver sus propias sesiones"
  ON public.sys_sesiones FOR SELECT
  USING (
    usuario_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol_global = 'superadmin'
    )
  );

-- Solo el sistema puede insertar/actualizar sesiones
DROP POLICY IF EXISTS "Solo sistema puede modificar sesiones" ON public.sys_sesiones;
CREATE POLICY "Solo sistema puede modificar sesiones"
  ON public.sys_sesiones FOR INSERT
  WITH CHECK (false);  -- Solo funciones SECURITY DEFINER pueden insertar

DROP POLICY IF EXISTS "Solo sistema puede actualizar sesiones" ON public.sys_sesiones;
CREATE POLICY "Solo sistema puede actualizar sesiones"
  ON public.sys_sesiones FOR UPDATE
  USING (false);  -- Solo funciones SECURITY DEFINER pueden actualizar

-- ============================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE public.sys_sesiones IS
  'Registro de todas las sesiones de usuarios. Rastrea inicio, fin, duración, y actividad de cada sesión para análisis y auditoría.';

COMMENT ON COLUMN public.sys_sesiones.id IS
  'Identificador único de la sesión';

COMMENT ON COLUMN public.sys_sesiones.usuario_id IS
  'ID del usuario propietario de la sesión';

COMMENT ON COLUMN public.sys_sesiones.token_sesion IS
  'Token de sesión de Supabase (si está disponible)';

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

COMMENT ON COLUMN public.sys_sesiones.ubicacion IS
  'Información de geolocalización en formato JSON (opcional)';

COMMENT ON COLUMN public.sys_sesiones.ultima_actividad IS
  'Fecha y hora de la última actividad registrada en esta sesión';

COMMENT ON COLUMN public.sys_sesiones.paginas_visitadas IS
  'Contador de páginas visitadas durante la sesión';

COMMENT ON COLUMN public.sys_sesiones.acciones_realizadas IS
  'Contador de acciones realizadas durante la sesión';

COMMENT ON VIEW sys_vista_sesiones_activas IS
  'Vista de todas las sesiones actualmente activas con información de usuario e inactividad';

COMMENT ON VIEW sys_vista_resumen_sesiones IS
  'Vista de resumen estadístico de sesiones por usuario (total, activas, tiempo promedio)';

COMMENT ON FUNCTION registrar_inicio_sesion IS
  'Función para registrar un nuevo inicio de sesión. Crea una sesión activa y registra en auditoría.';

COMMENT ON FUNCTION registrar_fin_sesion IS
  'Función para registrar el fin de una sesión (logout, expiración, o cierre forzado)';

COMMENT ON FUNCTION actualizar_actividad_sesion IS
  'Función para actualizar la última actividad de una sesión activa';

COMMENT ON FUNCTION cerrar_sesiones_inactivas IS
  'Función para cerrar automáticamente sesiones inactivas después de X minutos. Retorna el número de sesiones cerradas.';

COMMENT ON FUNCTION obtener_sesion_activa IS
  'Función para obtener el ID de la sesión activa más reciente de un usuario';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
