-- Índices de rendimiento: gaps identificados en queries frecuentes de middleware y dashboards.

-- sys_sesiones: fin_sesion sin índice, consultado en middleware y session-provider
-- con gte(fin_sesion, lastSignIn) en cada navegación autenticada.
CREATE INDEX IF NOT EXISTS idx_sys_sesiones_fin_sesion
  ON public.sys_sesiones(fin_sesion DESC)
  WHERE fin_sesion IS NOT NULL;

-- sys_sesiones: el compuesto (usuario_id, estado) existente no cubre ORDER BY inicio_sesion.
-- El middleware busca la sesión activa más reciente por usuario con LIMIT 1.
DROP INDEX IF EXISTS idx_sys_sesiones_usuario_estado;
CREATE INDEX IF NOT EXISTS idx_sys_sesiones_usuario_estado_inicio
  ON public.sys_sesiones(usuario_id, estado, inicio_sesion DESC);

-- parq_inspecciones: el dashboard filtra por fecha y ordena por creado_en.
-- El índice actual en fecha solo cubre el filtro; este compuesto elimina el sort.
CREATE INDEX IF NOT EXISTS idx_parq_inspecciones_fecha_creado
  ON public.parq_inspecciones(fecha DESC, creado_en DESC);

-- mov_novedades: el dashboard siempre cuenta estado != 'resuelta'.
-- Índice parcial más pequeño y rápido que el índice completo en estado.
CREATE INDEX IF NOT EXISTS idx_mov_novedades_pendientes
  ON public.mov_novedades(creado_en DESC)
  WHERE estado != 'resuelta';
