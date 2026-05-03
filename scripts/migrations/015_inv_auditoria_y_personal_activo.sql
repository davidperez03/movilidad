-- Migración 015: Auditoría de inventarios + personal activo en parqueadero
-- 1. Agrega sesion_id a inv_movimientos (completa el ciclo de auditoría)
-- 2. Actualiza parq_vista_personal para ocultar usuarios inactivos
-- 3. Actualiza sys_vista_auditoria_completa con módulo inventarios + nuevos campos
-- 4. Actualiza el tipo de ModuloAuditoria en el CHECK del filtro de la API
--
-- Versión: v1.21.0

BEGIN;

-- =========================================================================
-- 1. sesion_id en inv_movimientos
-- =========================================================================
ALTER TABLE public.inv_movimientos
  ADD COLUMN IF NOT EXISTS sesion_id UUID REFERENCES public.sys_sesiones(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inv_movimientos_sesion
  ON public.inv_movimientos(sesion_id);

CREATE INDEX IF NOT EXISTS idx_inv_movimientos_creado_por
  ON public.inv_movimientos(creado_por);

COMMENT ON COLUMN public.inv_movimientos.sesion_id IS
  'Sesión activa (sys_sesiones) al momento del movimiento de inventario';

-- =========================================================================
-- 2. parq_vista_personal: ocultar usuarios inactivos
--    Los registros históricos siguen en parq_datos_personal y
--    parq_historial_acciones — solo se excluyen de la vista operativa.
-- =========================================================================
DROP VIEW IF EXISTS public.parq_vista_personal;

CREATE VIEW public.parq_vista_personal AS
SELECT
  p.id,
  p.nombre_completo,
  p.correo,
  rm.codigo            AS rol_codigo,
  rm.nombre            AS rol_nombre,
  dp.licencia_numero,
  dp.licencia_categoria,
  dp.licencia_vencimiento,
  dp.licencia_restricciones,
  dp.documento_tipo,
  dp.documento_numero,
  dp.telefono,
  CASE
    WHEN rm.codigo = 'parq_auxiliar' THEN 'no_aplica'
    ELSE parq_estado_documento(dp.licencia_vencimiento)
  END                  AS estado_licencia
FROM public.usuarios_roles ur
JOIN public.roles_modulo      rm ON ur.rol_id     = rm.id
JOIN public.perfiles           p  ON ur.usuario_id = p.id
LEFT JOIN public.parq_datos_personal dp ON dp.perfil_id = p.id
WHERE ur.modulo_id = 'parqueadero'
  AND COALESCE(p.activo, true) = true;

ALTER VIEW public.parq_vista_personal SET (security_invoker = true);

COMMENT ON VIEW public.parq_vista_personal IS
  'Personal activo del parqueadero con estado de licencia. '
  'Solo muestra usuarios con activo = true. El historial permanece en parq_historial_acciones.';

-- =========================================================================
-- 3. sys_vista_auditoria_completa: agrega inventarios + sesion_id/secuencia/hash
--    DROP + CREATE porque CREATE OR REPLACE no permite reordenar columnas.
-- =========================================================================
DROP VIEW IF EXISTS public.sys_vista_auditoria_completa;
CREATE VIEW sys_vista_auditoria_completa AS

SELECT
  s.id,
  'sistema'         AS modulo,
  s.accion,
  s.entidad_tipo,
  s.entidad_id,
  s.detalles,
  s.valor_anterior,
  s.valor_nuevo,
  s.realizado_por   AS usuario_id,
  p.correo          AS usuario_correo,
  p.nombre_completo AS usuario_nombre,
  s.ip_address,
  s.user_agent,
  s.creado_en,
  s.sesion_id,
  s.secuencia,
  s.hash_registro,
  NULL::UUID        AS cuenta_id,
  NULL::TEXT        AS proceso_tipo,
  NULL::UUID        AS proceso_id,
  NULL::TEXT        AS placa
FROM public.sys_auditoria s
LEFT JOIN public.perfiles p ON s.realizado_por = p.id

UNION ALL

SELECT
  m.id,
  'movilidad'       AS modulo,
  m.accion,
  CASE
    WHEN m.proceso_tipo IS NULL        THEN 'cuenta'
    WHEN m.proceso_tipo = 'traslado'   THEN 'traslado'
    WHEN m.proceso_tipo = 'radicacion' THEN 'radicacion'
    ELSE m.proceso_tipo
  END               AS entidad_tipo,
  COALESCE(m.proceso_id, m.cuenta_id) AS entidad_id,
  m.detalles,
  m.estado_anterior AS valor_anterior,
  m.estado_nuevo    AS valor_nuevo,
  m.realizado_por   AS usuario_id,
  p.correo          AS usuario_correo,
  p.nombre_completo AS usuario_nombre,
  m.ip_address,
  m.user_agent,
  m.creado_en,
  m.sesion_id,
  NULL::BIGINT      AS secuencia,
  NULL::TEXT        AS hash_registro,
  m.cuenta_id,
  m.proceso_tipo,
  m.proceso_id,
  cv.placa          AS placa
FROM public.mov_historial_acciones m
LEFT JOIN public.perfiles              p  ON m.realizado_por = p.id
LEFT JOIN public.mov_cuentas_vehiculos cv ON m.cuenta_id    = cv.id

UNION ALL

SELECT
  ph.id,
  'parqueadero'     AS modulo,
  ph.accion,
  CASE
    WHEN ph.inspeccion_id IS NOT NULL THEN 'inspeccion'
    WHEN ph.vehiculo_id   IS NOT NULL THEN 'vehiculo'
    ELSE 'personal'
  END               AS entidad_tipo,
  COALESCE(ph.inspeccion_id, ph.vehiculo_id) AS entidad_id,
  ph.detalles,
  ph.valor_anterior,
  ph.valor_nuevo,
  ph.realizado_por  AS usuario_id,
  p.correo          AS usuario_correo,
  p.nombre_completo AS usuario_nombre,
  ph.ip_address,
  ph.user_agent,
  ph.creado_en,
  ph.sesion_id,
  NULL::BIGINT      AS secuencia,
  NULL::TEXT        AS hash_registro,
  NULL::UUID        AS cuenta_id,
  NULL::TEXT        AS proceso_tipo,
  NULL::UUID        AS proceso_id,
  COALESCE(v.placa, ph.detalles->>'placa') AS placa
FROM public.parq_historial_acciones ph
LEFT JOIN public.perfiles       p ON ph.realizado_por = p.id
LEFT JOIN public.parq_vehiculos v ON ph.vehiculo_id  = v.id

UNION ALL

SELECT
  im.id,
  'inventarios'          AS modulo,
  'inv_' || im.tipo      AS accion,
  'movimiento_inventario' AS entidad_tipo,
  im.id                  AS entidad_id,
  jsonb_build_object(
    'item_id',  im.item_id,
    'tipo',     im.tipo,
    'origen',   im.origen,
    'destino',  im.destino,
    'cantidad', im.cantidad,
    'modulo',   im.modulo,
    'notas',    im.notas
  )                      AS detalles,
  im.origen              AS valor_anterior,
  im.destino             AS valor_nuevo,
  im.creado_por          AS usuario_id,
  p.correo               AS usuario_correo,
  p.nombre_completo      AS usuario_nombre,
  NULL::INET             AS ip_address,
  NULL::TEXT             AS user_agent,
  im.creado_en,
  im.sesion_id,
  NULL::BIGINT           AS secuencia,
  NULL::TEXT             AS hash_registro,
  NULL::UUID             AS cuenta_id,
  NULL::TEXT             AS proceso_tipo,
  NULL::UUID             AS proceso_id,
  NULL::TEXT             AS placa
FROM public.inv_movimientos im
LEFT JOIN public.perfiles p ON im.creado_por = p.id

ORDER BY creado_en DESC;

ALTER VIEW sys_vista_auditoria_completa SET (security_invoker = true);

COMMENT ON VIEW sys_vista_auditoria_completa IS
  'Vista unificada de auditoría: sistema + movilidad + parqueadero + inventarios. '
  'Incluye sesion_id, secuencia y hash_registro para trazabilidad legal completa.';

COMMIT;

-- ROLLBACK:
-- BEGIN;
-- ALTER TABLE public.inv_movimientos DROP COLUMN IF EXISTS sesion_id;
-- -- Restaurar parq_vista_personal sin el filtro activo (ver 003_vista_personal.sql original)
-- -- Restaurar sys_vista_auditoria_completa sin inventarios (ver respaldo en git)
-- COMMIT;
