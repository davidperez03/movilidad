-- Vista unificada de auditoría del sistema
-- Combina sys_auditoria (sistema), mov_historial_acciones (movilidad),
-- parq_historial_acciones (parqueadero) e inv_movimientos (inventarios).
-- Incluye sesion_id, secuencia y hash_registro para trazabilidad completa.

CREATE OR REPLACE VIEW sys_vista_auditoria_completa AS

-- ── SISTEMA: usuarios, roles, autenticación ──────────────────────────────────
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

-- ── MOVILIDAD: traslados, radicaciones, cuentas ──────────────────────────────
SELECT
  m.id,
  'movilidad'            AS modulo,
  m.accion,
  CASE
    WHEN m.proceso_tipo IS NULL        THEN 'cuenta'
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
LEFT JOIN public.perfiles              p  ON m.realizado_por = p.id
LEFT JOIN public.mov_cuentas_vehiculos cv ON m.cuenta_id    = cv.id

UNION ALL

-- ── PARQUEADERO: vehículos, inspecciones, personal ───────────────────────────
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
LEFT JOIN public.perfiles      p ON ph.realizado_por = p.id
LEFT JOIN public.parq_vehiculos v ON ph.vehiculo_id  = v.id

UNION ALL

-- ── INVENTARIOS: ingresos y traslados de insumos ─────────────────────────────
SELECT
  im.id,
  'inventarios'          AS modulo,
  'inv_' || im.tipo      AS accion,
  'movimiento_inventario' AS entidad_tipo,
  im.id                  AS entidad_id,
  jsonb_build_object(
    'item_id',   im.item_id,
    'tipo',      im.tipo,
    'origen',    im.origen,
    'destino',   im.destino,
    'cantidad',  im.cantidad,
    'modulo',    im.modulo,
    'notas',     im.notas
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
  'Incluye sesion_id, secuencia (hash chain) y hash_registro para trazabilidad legal.';
