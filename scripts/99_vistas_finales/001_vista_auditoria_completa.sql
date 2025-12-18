-- ============================================================================
-- VISTA UNIFICADA DE AUDITORÍA
-- Combina auditorías de sistema y módulos en una sola vista
-- ============================================================================

-- ============================================================================
-- VISTA: sys_vista_auditoria_completa
-- Descripción: Vista unificada que combina sys_auditoria y mov_historial_acciones
--              para dar al superadmin una visión completa de todas las acciones
-- ============================================================================

CREATE OR REPLACE VIEW sys_vista_auditoria_completa AS
-- ============================================================================
-- AUDITORÍA DEL SISTEMA (acciones administrativas)
-- ============================================================================
SELECT
  s.id,
  'sistema' AS modulo,
  s.accion,
  s.entidad_tipo,
  s.entidad_id,
  s.detalles,
  s.valor_anterior,
  s.valor_nuevo,
  s.realizado_por AS usuario_id,
  p.correo AS usuario_correo,
  p.nombre_completo AS usuario_nombre,
  s.ip_address,
  s.user_agent,
  s.creado_en,
  -- Campos específicos para compatibilidad (NULL para sistema)
  NULL::UUID AS cuenta_id,
  NULL::TEXT AS proceso_tipo,
  NULL::UUID AS proceso_id
FROM public.sys_auditoria s
LEFT JOIN public.perfiles p ON s.realizado_por = p.id

UNION ALL

-- ============================================================================
-- AUDITORÍA DE MOVILIDAD (acciones del módulo)
-- ============================================================================
SELECT
  m.id,
  'movilidad' AS modulo,
  m.accion,
  -- Mapear tipo de entidad basado en el proceso
  CASE
    WHEN m.proceso_tipo IS NULL THEN 'cuenta'
    WHEN m.proceso_tipo = 'traslado' THEN 'traslado'
    WHEN m.proceso_tipo = 'radicacion' THEN 'radicacion'
    ELSE m.proceso_tipo
  END AS entidad_tipo,
  -- Usar proceso_id como entidad_id si existe, sino cuenta_id
  COALESCE(m.proceso_id, m.cuenta_id) AS entidad_id,
  m.detalles,
  m.estado_anterior AS valor_anterior,
  m.estado_nuevo AS valor_nuevo,
  m.realizado_por AS usuario_id,
  p.correo AS usuario_correo,
  p.nombre_completo AS usuario_nombre,
  NULL::INET AS ip_address,
  NULL::TEXT AS user_agent,
  m.creado_en,
  -- Campos específicos de movilidad
  m.cuenta_id,
  m.proceso_tipo,
  m.proceso_id
FROM public.mov_historial_acciones m
LEFT JOIN public.perfiles p ON m.realizado_por = p.id

-- Ordenar por fecha descendente (más reciente primero)
ORDER BY creado_en DESC;

-- ============================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON VIEW sys_vista_auditoria_completa IS
  'Vista unificada de toda la auditoría del sistema. Combina auditoría administrativa (sys_auditoria) con auditoría de módulos (mov_historial_acciones). Permite al superadmin ver todas las acciones en un solo lugar.';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================











