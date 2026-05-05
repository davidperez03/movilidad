-- Vista UNION de traslados y radicaciones completadas.
-- Consolida 2 queries + merge/sort/filtros en memoria → 1 query a la vista.
CREATE OR REPLACE VIEW public.mov_vista_procesos_completados
WITH (security_invoker = true)
AS
SELECT
  'traslado'::text AS proceso_tipo,
  t.id AS proceso_id,
  t.cuenta_id,
  cv.placa,
  cv.numero_cuenta,
  cv.tipo_servicio,
  t.estado,
  t.fecha_tramite,
  t.fecha_completado,
  CEIL(EXTRACT(EPOCH FROM (t.fecha_completado - t.creado_en)) / 86400)::integer AS duracion_dias,
  COALESCE(ot.nombre, '') AS organismo,
  COALESCE(p.nombre_completo, '') AS responsable,
  t.observaciones,
  t.creado_en
FROM public.mov_traslados t
JOIN public.mov_cuentas_vehiculos cv ON cv.id = t.cuenta_id
LEFT JOIN public.mov_organismos_transito ot ON ot.id = t.organismo_destino_id
LEFT JOIN public.perfiles p ON p.id = t.creado_por
WHERE t.estado IN ('trasladado', 'devuelto')
  AND t.fecha_completado IS NOT NULL

UNION ALL

SELECT
  'radicacion'::text,
  r.id,
  r.cuenta_id,
  cv.placa,
  cv.numero_cuenta,
  cv.tipo_servicio,
  r.estado,
  r.fecha_tramite,
  r.fecha_completado,
  CEIL(EXTRACT(EPOCH FROM (r.fecha_completado - r.creado_en)) / 86400)::integer,
  COALESCE(ot.nombre, ''),
  COALESCE(p.nombre_completo, ''),
  r.observaciones,
  r.creado_en
FROM public.mov_radicaciones r
JOIN public.mov_cuentas_vehiculos cv ON cv.id = r.cuenta_id
LEFT JOIN public.mov_organismos_transito ot ON ot.id = r.organismo_origen_id
LEFT JOIN public.perfiles p ON p.id = r.creado_por
WHERE r.estado IN ('radicado', 'devuelto')
  AND r.fecha_completado IS NOT NULL;

COMMENT ON VIEW public.mov_vista_procesos_completados
  IS 'UNION de traslados y radicaciones completadas con placa, organismo, responsable y duración';
