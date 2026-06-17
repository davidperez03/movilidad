-- ============================================================
-- Migration 027: Módulo de turnos operativos de parqueadero
-- - Tabla parq_turnos y parq_turno_novedades
-- - Agrega turno_id y km_inicio a parq_inspecciones
-- ============================================================

-- 1. Tabla principal de turnos
CREATE TABLE IF NOT EXISTS public.parq_turnos (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_turno     text        NOT NULL CHECK (tipo_turno IN ('diurno', 'nocturno')),
  fecha          date        NOT NULL,
  vehiculo_id    uuid        NOT NULL REFERENCES public.parq_vehiculos(id),
  hora_inicio    timestamptz NOT NULL,
  hora_fin       timestamptz,
  km_fin         integer,
  estado         text        NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado')),
  creado_por     uuid        REFERENCES public.perfiles(id),
  creado_en      timestamptz DEFAULT now() NOT NULL,
  actualizado_en timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_parq_turnos_fecha       ON public.parq_turnos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_parq_turnos_vehiculo_id ON public.parq_turnos(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_parq_turnos_estado      ON public.parq_turnos(estado);

-- Un solo turno por vehículo + fecha + tipo
ALTER TABLE public.parq_turnos
  ADD CONSTRAINT uq_parq_turnos_vehiculo_fecha_tipo
  UNIQUE (vehiculo_id, fecha, tipo_turno);

COMMENT ON TABLE public.parq_turnos IS
  'Turnos operativos de grúas. Agrupa inspecciones y registra kilometraje y horas de operación.';

-- 2. Novedades/salidas de operación por turno (descuentos de horas)
CREATE TABLE IF NOT EXISTS public.parq_turno_novedades (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  turno_id    uuid        NOT NULL REFERENCES public.parq_turnos(id) ON DELETE CASCADE,
  motivo      text        NOT NULL,
  hora_inicio timestamptz NOT NULL,
  hora_fin    timestamptz,
  creado_en   timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_parq_turno_novedades_turno_id ON public.parq_turno_novedades(turno_id);

COMMENT ON TABLE public.parq_turno_novedades IS
  'Salidas de operación durante un turno (averías, mantenimiento, etc.) que descuentan horas operadas.';

-- 3. Agregar turno_id y km_inicio a parq_inspecciones
ALTER TABLE public.parq_inspecciones
  ADD COLUMN IF NOT EXISTS turno_id  uuid REFERENCES public.parq_turnos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS km_inicio integer;

CREATE INDEX IF NOT EXISTS idx_parq_inspecciones_turno_id ON public.parq_inspecciones(turno_id);

-- 4. RLS
ALTER TABLE public.parq_turnos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parq_turno_novedades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados gestionan parq_turnos"
  ON public.parq_turnos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Autenticados gestionan parq_turno_novedades"
  ON public.parq_turno_novedades FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Trigger timestamps
CREATE OR REPLACE FUNCTION public.parq_turno_actualizar_timestamp()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.actualizado_en = now(); RETURN NEW; END; $$;

CREATE TRIGGER parq_turnos_actualizado_en
  BEFORE UPDATE ON public.parq_turnos
  FOR EACH ROW EXECUTE FUNCTION public.parq_turno_actualizar_timestamp();

-- 6. Vista de turnos con datos calculados
CREATE OR REPLACE VIEW public.parq_vista_turnos AS
  SELECT
    t.id,
    t.tipo_turno,
    t.fecha,
    t.hora_inicio,
    t.hora_fin,
    t.km_fin,
    t.estado,
    t.creado_en,
    v.id    AS vehiculo_id,
    v.placa,
    v.marca,
    v.modelo,
    -- KM inicio: del primer km_inicio registrado en las inspecciones del turno
    (SELECT i.km_inicio FROM public.parq_inspecciones i
     WHERE i.turno_id = t.id AND i.km_inicio IS NOT NULL
     ORDER BY i.creado_en ASC LIMIT 1) AS km_inicio,
    -- KM recorridos calculado
    t.km_fin - (SELECT i.km_inicio FROM public.parq_inspecciones i
                WHERE i.turno_id = t.id AND i.km_inicio IS NOT NULL
                ORDER BY i.creado_en ASC LIMIT 1) AS km_recorridos,
    -- Horas brutas (sin descontar novedades)
    EXTRACT(EPOCH FROM (t.hora_fin - t.hora_inicio)) / 3600.0 AS horas_brutas,
    -- Total horas fuera de operación
    COALESCE((SELECT SUM(EXTRACT(EPOCH FROM (n.hora_fin - n.hora_inicio)) / 3600.0)
              FROM public.parq_turno_novedades n
              WHERE n.turno_id = t.id AND n.hora_fin IS NOT NULL), 0) AS horas_novedades,
    -- Horas operadas netas
    CASE WHEN t.hora_fin IS NOT NULL THEN
      EXTRACT(EPOCH FROM (t.hora_fin - t.hora_inicio)) / 3600.0
      - COALESCE((SELECT SUM(EXTRACT(EPOCH FROM (n.hora_fin - n.hora_inicio)) / 3600.0)
                  FROM public.parq_turno_novedades n
                  WHERE n.turno_id = t.id AND n.hora_fin IS NOT NULL), 0)
    ELSE NULL END AS horas_operadas,
    -- Inspecciones del turno
    (SELECT COUNT(*) FROM public.parq_inspecciones i WHERE i.turno_id = t.id) AS total_inspecciones,
    -- Operadores (nombres separados por coma)
    (SELECT STRING_AGG(DISTINCT parq_get_nombre_perfil(i.operador_id), ', ')
     FROM public.parq_inspecciones i WHERE i.turno_id = t.id) AS operadores
  FROM public.parq_turnos t
  JOIN public.parq_vehiculos v ON v.id = t.vehiculo_id
  ORDER BY t.fecha DESC, t.hora_inicio DESC;

ALTER VIEW public.parq_vista_turnos SET (security_invoker = true);

-- 7. Actualizar parq_vista_inspecciones para incluir turno_id y km_inicio
DROP VIEW IF EXISTS public.parq_vista_inspecciones;
CREATE VIEW public.parq_vista_inspecciones AS
SELECT
  i.id, i.consecutivo, i.fecha, i.hora, i.turno, i.es_apto, i.observaciones, i.creado_en,
  i.turno_id, i.km_inicio,
  v.id as vehiculo_id, v.placa, v.marca, v.modelo, v.tipo as vehiculo_tipo,
  coalesce(i.snapshot_soat_vencimiento, v.soat_vencimiento) as soat_vencimiento,
  coalesce(i.snapshot_tecnomecanica_vencimiento, v.tecnomecanica_vencimiento) as tecnomecanica_vencimiento,
  parq_estado_documento(coalesce(i.snapshot_soat_vencimiento, v.soat_vencimiento), i.fecha) as estado_soat,
  parq_estado_documento(coalesce(i.snapshot_tecnomecanica_vencimiento, v.tecnomecanica_vencimiento), i.fecha) as estado_tecnomecanica,
  i.operador_id,
  parq_get_nombre_perfil(i.operador_id) as operador_nombre,
  coalesce(i.snapshot_licencia_vencimiento, dp.licencia_vencimiento) as operador_licencia_vencimiento,
  coalesce(i.snapshot_licencia_categoria, dp.licencia_categoria) as operador_licencia_categoria,
  parq_estado_documento(coalesce(i.snapshot_licencia_vencimiento, dp.licencia_vencimiento), i.fecha) as operador_estado_licencia,
  i.auxiliar_id,
  parq_get_nombre_perfil(i.auxiliar_id) as auxiliar_nombre,
  i.inspector_id,
  parq_get_nombre_perfil(i.inspector_id) as inspector_nombre,
  (select count(*) from parq_items_inspeccion ii where ii.inspeccion_id = i.id and ii.estado = 'bueno') as items_buenos,
  (select count(*) from parq_items_inspeccion ii where ii.inspeccion_id = i.id and ii.estado = 'regular') as items_regulares,
  (select count(*) from parq_items_inspeccion ii where ii.inspeccion_id = i.id and ii.estado = 'malo') as items_malos
FROM public.parq_inspecciones i
JOIN public.parq_vehiculos v ON v.id = i.vehiculo_id
LEFT JOIN public.parq_datos_personal dp ON dp.perfil_id = i.operador_id;

ALTER VIEW public.parq_vista_inspecciones SET (security_invoker = true);
