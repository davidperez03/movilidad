-- Migración 013: sesion_id en tablas de historial por módulo
-- Vincula cada evento de auditoría con la sesión activa en sys_sesiones.
-- Permite reconstruir: "qué hizo el usuario X durante la sesión Y".
--
-- Versión: v1.21.0

BEGIN;

-- =========================================================================
-- 1. mov_historial_acciones — historial del módulo de movilidad
-- =========================================================================
ALTER TABLE public.mov_historial_acciones
  ADD COLUMN IF NOT EXISTS sesion_id UUID REFERENCES public.sys_sesiones(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_mov_historial_sesion_id
  ON public.mov_historial_acciones(sesion_id);

COMMENT ON COLUMN public.mov_historial_acciones.sesion_id IS
  'Sesión activa (sys_sesiones) al momento del evento — vincula acción con sesión de usuario';

-- =========================================================================
-- 2. parq_historial_acciones — historial del módulo de parqueadero
-- =========================================================================
ALTER TABLE public.parq_historial_acciones
  ADD COLUMN IF NOT EXISTS sesion_id UUID REFERENCES public.sys_sesiones(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_parq_historial_sesion_id
  ON public.parq_historial_acciones(sesion_id);

COMMENT ON COLUMN public.parq_historial_acciones.sesion_id IS
  'Sesión activa (sys_sesiones) al momento del evento — vincula acción con sesión de usuario';

-- =========================================================================
-- 3. Actualizar sys_vista_auditoria_completa para exponer sesion_id
--    DROP + CREATE porque la vista existente tiene diferente orden de columnas
--    y CREATE OR REPLACE no permite reordenarlas.
-- =========================================================================
DROP VIEW IF EXISTS public.sys_vista_auditoria_completa;
CREATE VIEW sys_vista_auditoria_completa AS
SELECT
  s.id,
  'sistema'              AS modulo,
  s.accion,
  s.entidad_tipo,
  s.entidad_id,
  s.detalles,
  s.valor_anterior,
  s.valor_nuevo,
  s.realizado_por        AS usuario_id,
  p.correo               AS usuario_correo,
  p.nombre_completo      AS usuario_nombre,
  s.ip_address,
  s.user_agent,
  s.creado_en,
  s.sesion_id,
  s.secuencia,
  s.hash_registro,
  NULL::UUID             AS cuenta_id,
  NULL::TEXT             AS proceso_tipo,
  NULL::UUID             AS proceso_id,
  NULL::TEXT             AS placa
FROM public.sys_auditoria s
LEFT JOIN public.perfiles p ON s.realizado_por = p.id

UNION ALL

SELECT
  m.id,
  'movilidad'            AS modulo,
  m.accion,
  CASE
    WHEN m.proceso_tipo IS NULL    THEN 'cuenta'
    WHEN m.proceso_tipo = 'traslado'   THEN 'traslado'
    WHEN m.proceso_tipo = 'radicacion' THEN 'radicacion'
    ELSE m.proceso_tipo
  END                    AS entidad_tipo,
  COALESCE(m.proceso_id, m.cuenta_id) AS entidad_id,
  m.detalles,
  m.estado_anterior      AS valor_anterior,
  m.estado_nuevo         AS valor_nuevo,
  m.realizado_por        AS usuario_id,
  p.correo               AS usuario_correo,
  p.nombre_completo      AS usuario_nombre,
  m.ip_address,
  m.user_agent,
  m.creado_en,
  m.sesion_id,
  NULL::BIGINT           AS secuencia,
  NULL::TEXT             AS hash_registro,
  m.cuenta_id,
  m.proceso_tipo,
  m.proceso_id,
  cv.placa               AS placa
FROM public.mov_historial_acciones m
LEFT JOIN public.perfiles p            ON m.realizado_por = p.id
LEFT JOIN public.mov_cuentas_vehiculos cv ON m.cuenta_id = cv.id

UNION ALL

SELECT
  ph.id,
  'parqueadero'          AS modulo,
  ph.accion,
  CASE
    WHEN ph.inspeccion_id IS NOT NULL THEN 'inspeccion'
    WHEN ph.vehiculo_id   IS NOT NULL THEN 'vehiculo'
    ELSE 'personal'
  END                    AS entidad_tipo,
  COALESCE(ph.inspeccion_id, ph.vehiculo_id) AS entidad_id,
  ph.detalles,
  ph.valor_anterior,
  ph.valor_nuevo,
  ph.realizado_por       AS usuario_id,
  p.correo               AS usuario_correo,
  p.nombre_completo      AS usuario_nombre,
  ph.ip_address,
  ph.user_agent,
  ph.creado_en,
  ph.sesion_id,
  NULL::BIGINT           AS secuencia,
  NULL::TEXT             AS hash_registro,
  NULL::UUID             AS cuenta_id,
  NULL::TEXT             AS proceso_tipo,
  NULL::UUID             AS proceso_id,
  COALESCE(v.placa, ph.detalles->>'placa') AS placa
FROM public.parq_historial_acciones ph
LEFT JOIN public.perfiles    p ON ph.realizado_por = p.id
LEFT JOIN public.parq_vehiculos v ON ph.vehiculo_id = v.id

ORDER BY creado_en DESC;

ALTER VIEW sys_vista_auditoria_completa SET (security_invoker = true);

COMMENT ON VIEW sys_vista_auditoria_completa IS
  'Vista unificada de toda la auditoría del sistema. Incluye sesion_id, secuencia y hash_registro.';

COMMIT;

-- ROLLBACK:
-- BEGIN;
-- ALTER TABLE public.mov_historial_acciones  DROP COLUMN IF EXISTS sesion_id;
-- ALTER TABLE public.parq_historial_acciones DROP COLUMN IF EXISTS sesion_id;
-- COMMIT;
