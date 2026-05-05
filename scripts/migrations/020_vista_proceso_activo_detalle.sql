-- Vista que extiende mov_vista_proceso_activo con todos los campos del proceso (traslado o
-- radicación), nombres de usuarios y notificación de radicación en una sola query.
-- Reemplaza 3 round trips secuenciales en obtenerProcesoActivo por 1.
CREATE OR REPLACE VIEW public.mov_vista_proceso_activo_detalle
WITH (security_invoker = true)
AS
SELECT
  vpa.*,
  -- Campos del proceso (COALESCE cubre traslado o radicación según proceso_tipo)
  COALESCE(t.observaciones, r.observaciones)                     AS observaciones,
  COALESCE(t.actualizado_en, r.actualizado_en)                   AS actualizado_en,
  COALESCE(t.numero_guia, r.numero_guia)                         AS numero_guia,
  COALESCE(t.empresa_transportadora_id, r.empresa_transportadora_id) AS empresa_transportadora_id,
  t.fecha_aprobacion,
  -- Nombres de usuarios (flat, se reensamblan como objetos en TypeScript)
  cp.nombre_completo   AS proceso_creador_nombre,
  up.nombre_completo   AS proceso_actualizador_nombre,
  -- Empresa transportadora
  et.id     AS empresa_transporte_id,
  et.nombre AS empresa_transporte_nombre,
  -- Notificación de radicación (NULL para traslados)
  nr.id                        AS notificacion_radicacion_id,
  nr.solicitante_notificado    AS notificacion_solicitante_notificado,
  nr.notificado_en             AS notificacion_notificado_en,
  nr.observaciones             AS notificacion_observaciones
FROM public.mov_vista_proceso_activo vpa
LEFT JOIN public.mov_traslados t
  ON vpa.proceso_tipo = 'traslado'   AND t.id = vpa.proceso_id
LEFT JOIN public.mov_radicaciones r
  ON vpa.proceso_tipo = 'radicacion' AND r.id = vpa.proceso_id
LEFT JOIN public.perfiles cp
  ON COALESCE(t.creado_por, r.creado_por) = cp.id
LEFT JOIN public.perfiles up
  ON COALESCE(t.actualizado_por, r.actualizado_por) = up.id
LEFT JOIN public.mov_empresas_transporte et
  ON COALESCE(t.empresa_transportadora_id, r.empresa_transportadora_id) = et.id
LEFT JOIN public.mov_notificaciones_radicacion nr
  ON vpa.proceso_tipo = 'radicacion' AND nr.radicacion_id = vpa.proceso_id;

COMMENT ON VIEW public.mov_vista_proceso_activo_detalle
  IS 'Proceso activo con detalles completos (campos proceso, usuarios, empresa, notificación) en una sola query';
