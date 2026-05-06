-- Migración 023: Auditoría del módulo Estudios NUNC
-- Crea nunc_historial_acciones + triggers en nunc_sesiones/nunc_registros
-- + actualiza sys_vista_auditoria_completa con bloque NUNC
--
-- Versión: v1.24.0

BEGIN;

-- =========================================================================
-- 1. Tabla nunc_historial_acciones
-- =========================================================================
CREATE TABLE public.nunc_historial_acciones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id   UUID REFERENCES public.nunc_sesiones(id) ON DELETE SET NULL,
  registro_id UUID REFERENCES public.nunc_registros(id) ON DELETE SET NULL,

  accion TEXT NOT NULL CHECK (accion IN (
    'nunc_sesion_creada',
    'nunc_sesion_cerrada',
    'nunc_sesion_expirada',
    'nunc_registro_creado',
    'nunc_registro_editado',
    'nunc_registro_eliminado'
  )),

  detalles      JSONB DEFAULT '{}'::jsonb,
  valor_anterior TEXT,
  valor_nuevo    TEXT,

  -- NULL cuando la acción la hace un oficial externo sin cuenta
  realizado_por UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
  ip_address    INET,
  user_agent    TEXT,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT now(),
  hash_anterior TEXT,
  hash_registro TEXT
);

CREATE INDEX IF NOT EXISTS idx_nunc_historial_sesion
  ON public.nunc_historial_acciones(sesion_id);
CREATE INDEX IF NOT EXISTS idx_nunc_historial_registro
  ON public.nunc_historial_acciones(registro_id);
CREATE INDEX IF NOT EXISTS idx_nunc_historial_accion
  ON public.nunc_historial_acciones(accion);
CREATE INDEX IF NOT EXISTS idx_nunc_historial_realizado_por
  ON public.nunc_historial_acciones(realizado_por);
CREATE INDEX IF NOT EXISTS idx_nunc_historial_creado_en
  ON public.nunc_historial_acciones(creado_en DESC);

ALTER TABLE public.nunc_historial_acciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nunc_historial_select_auth"
  ON public.nunc_historial_acciones FOR SELECT
  TO authenticated USING (true);

COMMENT ON TABLE public.nunc_historial_acciones IS
  'Auditoría del módulo Estudios NUNC. realizado_por es NULL para acciones de oficiales externos sin cuenta.';

-- =========================================================================
-- 2. Función central de auditoría NUNC
-- =========================================================================
CREATE OR REPLACE FUNCTION registrar_auditoria_nunc(
  p_sesion_id    UUID  DEFAULT NULL,
  p_registro_id  UUID  DEFAULT NULL,
  p_accion       TEXT  DEFAULT NULL,
  p_detalles     JSONB DEFAULT NULL,
  p_valor_anterior TEXT DEFAULT NULL,
  p_valor_nuevo    TEXT DEFAULT NULL,
  p_realizado_por  UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nuevo_id UUID;
BEGIN
  INSERT INTO public.nunc_historial_acciones (
    sesion_id, registro_id, accion, detalles,
    valor_anterior, valor_nuevo, realizado_por
  ) VALUES (
    p_sesion_id, p_registro_id, p_accion, p_detalles,
    p_valor_anterior, p_valor_nuevo,
    COALESCE(p_realizado_por, auth.uid())
  )
  RETURNING id INTO nuevo_id;
  RETURN nuevo_id;
END;
$$;

-- =========================================================================
-- 3. Trigger functions
-- =========================================================================

CREATE OR REPLACE FUNCTION trigger_nunc_sesion_creada()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM registrar_auditoria_nunc(
    NEW.id, NULL, 'nunc_sesion_creada',
    jsonb_build_object(
      'codigo',         NEW.codigo,
      'entidad_nombre', NEW.entidad_nombre,
      'nombre_peritos', NEW.nombre_peritos,
      'expira_en',      NEW.expira_en
    ),
    NULL, 'activa',
    NEW.generado_por
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_nunc_sesion_estado()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    PERFORM registrar_auditoria_nunc(
      NEW.id, NULL,
      CASE WHEN NEW.estado = 'cerrada' THEN 'nunc_sesion_cerrada' ELSE 'nunc_sesion_expirada' END,
      jsonb_build_object(
        'codigo',         NEW.codigo,
        'entidad_nombre', NEW.entidad_nombre
      ),
      OLD.estado, NEW.estado
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_nunc_registro_creado()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_codigo TEXT;
BEGIN
  SELECT codigo INTO v_codigo FROM public.nunc_sesiones WHERE id = NEW.sesion_id;
  PERFORM registrar_auditoria_nunc(
    NEW.sesion_id, NEW.id, 'nunc_registro_creado',
    jsonb_build_object(
      'origen',       'EXTERNO',
      'codigo_sesion', v_codigo,
      'placa',         NEW.placa,
      'nunc',          NEW.nunc_dpto || '-' || NEW.nunc_municipio || '-' || NEW.nunc_entidad || '-' ||
                       NEW.nunc_unidad || '-' || NEW.nunc_anio || '-' || NEW.nunc_consecutivo
    ),
    NULL, NEW.placa
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_nunc_registro_editado()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_codigo TEXT;
BEGIN
  SELECT codigo INTO v_codigo FROM public.nunc_sesiones WHERE id = NEW.sesion_id;
  PERFORM registrar_auditoria_nunc(
    NEW.sesion_id, NEW.id, 'nunc_registro_editado',
    jsonb_build_object(
      'origen',        'EXTERNO',
      'codigo_sesion',  v_codigo,
      'placa_anterior', OLD.placa,
      'placa_nueva',    NEW.placa,
      'nunc_anterior',  OLD.nunc_dpto || '-' || OLD.nunc_municipio || '-' || OLD.nunc_entidad || '-' ||
                        OLD.nunc_unidad || '-' || OLD.nunc_anio || '-' || OLD.nunc_consecutivo,
      'nunc_nuevo',     NEW.nunc_dpto || '-' || NEW.nunc_municipio || '-' || NEW.nunc_entidad || '-' ||
                        NEW.nunc_unidad || '-' || NEW.nunc_anio || '-' || NEW.nunc_consecutivo
    ),
    OLD.placa, NEW.placa
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_nunc_registro_eliminado()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_codigo TEXT;
BEGIN
  SELECT codigo INTO v_codigo FROM public.nunc_sesiones WHERE id = OLD.sesion_id;
  PERFORM registrar_auditoria_nunc(
    OLD.sesion_id, OLD.id, 'nunc_registro_eliminado',
    jsonb_build_object(
      'origen',        'EXTERNO',
      'codigo_sesion',  v_codigo,
      'placa',          OLD.placa,
      'nunc',           OLD.nunc_dpto || '-' || OLD.nunc_municipio || '-' || OLD.nunc_entidad || '-' ||
                        OLD.nunc_unidad || '-' || OLD.nunc_anio || '-' || OLD.nunc_consecutivo
    ),
    OLD.placa, NULL
  );
  RETURN OLD;
END;
$$;

-- =========================================================================
-- 4. Triggers
-- =========================================================================
DROP TRIGGER IF EXISTS trg_nunc_sesion_creada ON public.nunc_sesiones;
CREATE TRIGGER trg_nunc_sesion_creada
  AFTER INSERT ON public.nunc_sesiones
  FOR EACH ROW EXECUTE FUNCTION trigger_nunc_sesion_creada();

DROP TRIGGER IF EXISTS trg_nunc_sesion_estado ON public.nunc_sesiones;
CREATE TRIGGER trg_nunc_sesion_estado
  AFTER UPDATE ON public.nunc_sesiones
  FOR EACH ROW EXECUTE FUNCTION trigger_nunc_sesion_estado();

DROP TRIGGER IF EXISTS trg_nunc_registro_creado ON public.nunc_registros;
CREATE TRIGGER trg_nunc_registro_creado
  AFTER INSERT ON public.nunc_registros
  FOR EACH ROW EXECUTE FUNCTION trigger_nunc_registro_creado();

DROP TRIGGER IF EXISTS trg_nunc_registro_editado ON public.nunc_registros;
CREATE TRIGGER trg_nunc_registro_editado
  AFTER UPDATE ON public.nunc_registros
  FOR EACH ROW EXECUTE FUNCTION trigger_nunc_registro_editado();

DROP TRIGGER IF EXISTS trg_nunc_registro_eliminado ON public.nunc_registros;
CREATE TRIGGER trg_nunc_registro_eliminado
  AFTER DELETE ON public.nunc_registros
  FOR EACH ROW EXECUTE FUNCTION trigger_nunc_registro_eliminado();

-- =========================================================================
-- 5. Actualizar sys_vista_auditoria_completa con bloque NUNC
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
  'inventarios'           AS modulo,
  'inv_' || im.tipo       AS accion,
  'movimiento_inventario' AS entidad_tipo,
  im.id                   AS entidad_id,
  jsonb_build_object(
    'item_id',  im.item_id,
    'tipo',     im.tipo,
    'origen',   im.origen,
    'destino',  im.destino,
    'cantidad', im.cantidad,
    'modulo',   im.modulo,
    'notas',    im.notas
  )                       AS detalles,
  im.origen               AS valor_anterior,
  im.destino              AS valor_nuevo,
  im.creado_por           AS usuario_id,
  p.correo                AS usuario_correo,
  p.nombre_completo       AS usuario_nombre,
  NULL::INET              AS ip_address,
  NULL::TEXT              AS user_agent,
  im.creado_en,
  im.sesion_id,
  NULL::BIGINT            AS secuencia,
  NULL::TEXT              AS hash_registro,
  NULL::UUID              AS cuenta_id,
  NULL::TEXT              AS proceso_tipo,
  NULL::UUID              AS proceso_id,
  NULL::TEXT              AS placa
FROM public.inv_movimientos im
LEFT JOIN public.perfiles p ON im.creado_por = p.id

UNION ALL

SELECT
  h.id,
  'nunc'            AS modulo,
  h.accion,
  CASE
    WHEN h.registro_id IS NOT NULL THEN 'nunc_registro'
    ELSE 'nunc_sesion'
  END               AS entidad_tipo,
  COALESCE(h.registro_id, h.sesion_id) AS entidad_id,
  h.detalles,
  h.valor_anterior,
  h.valor_nuevo,
  h.realizado_por   AS usuario_id,
  p.correo          AS usuario_correo,
  COALESCE(p.nombre_completo, 'EXTERNO') AS usuario_nombre,
  h.ip_address,
  h.user_agent,
  h.creado_en,
  NULL::UUID        AS sesion_id,
  NULL::BIGINT      AS secuencia,
  NULL::TEXT        AS hash_registro,
  NULL::UUID        AS cuenta_id,
  NULL::TEXT        AS proceso_tipo,
  NULL::UUID        AS proceso_id,
  h.detalles->>'placa' AS placa
FROM public.nunc_historial_acciones h
LEFT JOIN public.perfiles p ON h.realizado_por = p.id

ORDER BY creado_en DESC;

ALTER VIEW public.sys_vista_auditoria_completa SET (security_invoker = true);

COMMENT ON VIEW public.sys_vista_auditoria_completa IS
  'Vista unificada de auditoría: sistema + movilidad + parqueadero + inventarios + nunc.';

COMMIT;

-- ROLLBACK:
-- BEGIN;
-- DROP TRIGGER IF EXISTS trg_nunc_sesion_creada ON public.nunc_sesiones;
-- DROP TRIGGER IF EXISTS trg_nunc_sesion_estado ON public.nunc_sesiones;
-- DROP TRIGGER IF EXISTS trg_nunc_registro_creado ON public.nunc_registros;
-- DROP TRIGGER IF EXISTS trg_nunc_registro_editado ON public.nunc_registros;
-- DROP TRIGGER IF EXISTS trg_nunc_registro_eliminado ON public.nunc_registros;
-- DROP FUNCTION IF EXISTS trigger_nunc_sesion_creada();
-- DROP FUNCTION IF EXISTS trigger_nunc_sesion_estado();
-- DROP FUNCTION IF EXISTS trigger_nunc_registro_creado();
-- DROP FUNCTION IF EXISTS trigger_nunc_registro_editado();
-- DROP FUNCTION IF EXISTS trigger_nunc_registro_eliminado();
-- DROP FUNCTION IF EXISTS registrar_auditoria_nunc(UUID,UUID,TEXT,JSONB,TEXT,TEXT,UUID);
-- DROP TABLE IF EXISTS public.nunc_historial_acciones;
-- -- Restaurar sys_vista_auditoria_completa sin bloque NUNC (ver migración 015)
-- COMMIT;
