
CREATE OR REPLACE VIEW sys_vista_auditoria_completa AS
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
  NULL::UUID AS cuenta_id,
  NULL::TEXT AS proceso_tipo,
  NULL::UUID AS proceso_id
FROM public.sys_auditoria s
LEFT JOIN public.perfiles p ON s.realizado_por = p.id

UNION ALL

SELECT
  m.id,
  'movilidad' AS modulo,
  m.accion,
  CASE
    WHEN m.proceso_tipo IS NULL THEN 'cuenta'
    WHEN m.proceso_tipo = 'traslado' THEN 'traslado'
    WHEN m.proceso_tipo = 'radicacion' THEN 'radicacion'
    ELSE m.proceso_tipo
  END AS entidad_tipo,
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
  m.cuenta_id,
  m.proceso_tipo,
  m.proceso_id
FROM public.mov_historial_acciones m
LEFT JOIN public.perfiles p ON m.realizado_por = p.id

ORDER BY creado_en DESC;

COMMENT ON VIEW sys_vista_auditoria_completa IS
  'Vista unificada de toda la auditoría del sistema. Combina auditoría administrativa (sys_auditoria) con auditoría de módulos (mov_historial_acciones). Permite al superadmin ver todas las acciones en un solo lugar.';
