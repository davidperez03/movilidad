-- ============================================================
-- Migration 026: Sistema de control de asistencia por QR
-- - Mueve documento_tipo/numero de parq_datos_personal → perfiles
-- - Crea asist_datos_empleado y asist_registros
-- ============================================================

-- 1. Agregar documento a perfiles (general para todos los módulos)
ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS documento_tipo   text CHECK (documento_tipo IN ('CC', 'CE', 'TI', 'PP')),
  ADD COLUMN IF NOT EXISTS documento_numero text;

CREATE INDEX IF NOT EXISTS idx_perfiles_documento_numero
  ON public.perfiles(documento_numero) WHERE documento_numero IS NOT NULL;

-- 2. Migrar datos existentes de parq_datos_personal → perfiles
UPDATE public.perfiles p
SET
  documento_tipo   = dp.documento_tipo,
  documento_numero = dp.documento_numero
FROM public.parq_datos_personal dp
WHERE dp.perfil_id = p.id
  AND (dp.documento_tipo IS NOT NULL OR dp.documento_numero IS NOT NULL);

-- 3. Quitar columnas de parq_datos_personal (ya migradas a perfiles)
--    Primero se elimina la vista que depende de ellas, se recrea en el paso 4
DROP VIEW IF EXISTS public.parq_vista_personal;

ALTER TABLE public.parq_datos_personal
  DROP COLUMN IF EXISTS documento_tipo,
  DROP COLUMN IF EXISTS documento_numero;

-- 4. Recrear vista parq_vista_personal (documento ahora viene de perfiles)
CREATE VIEW public.parq_vista_personal AS
  SELECT
    p.id,
    p.nombre_completo,
    p.correo,
    p.documento_tipo,
    p.documento_numero,
    rm.codigo  AS rol_codigo,
    rm.nombre  AS rol_nombre,
    dp.licencia_numero,
    dp.licencia_categoria,
    dp.licencia_vencimiento,
    dp.licencia_restricciones,
    dp.telefono,
    dp.contacto_emergencia,
    dp.telefono_emergencia,
    dp.observaciones,
    CASE WHEN rm.codigo = 'parq_auxiliar' THEN 'no_aplica'
         ELSE parq_estado_documento(dp.licencia_vencimiento)
    END AS estado_licencia
  FROM public.usuarios_roles           ur
  JOIN public.roles_modulo             rm ON ur.rol_id = rm.id
  JOIN public.perfiles                  p ON ur.usuario_id = p.id
  LEFT JOIN public.parq_datos_personal dp ON dp.perfil_id = p.id
  WHERE ur.modulo_id = 'parqueadero'
    AND COALESCE(p.activo, true) = true;

ALTER VIEW public.parq_vista_personal SET (security_invoker = true);
COMMENT ON VIEW public.parq_vista_personal IS 'Vista del personal de parqueadero con estado de licencia';

-- 5. Tabla de datos de empleado para asistencia (solo el PIN)
CREATE TABLE IF NOT EXISTS public.asist_datos_empleado (
  perfil_id      uuid        PRIMARY KEY REFERENCES public.perfiles(id) ON DELETE CASCADE,
  pin_hash       text        NOT NULL,
  creado_en      timestamptz DEFAULT now() NOT NULL,
  actualizado_en timestamptz DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.asist_datos_empleado IS
  'PIN de acceso rápido por QR para el sistema de asistencia. Solo aplica a personal de parqueadero.';

-- 6. Tabla de registros de asistencia
CREATE TABLE IF NOT EXISTS public.asist_registros (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id  uuid        NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  tipo        text        NOT NULL CHECK (tipo IN ('INGRESO', 'SALIDA')),
  timestamp   timestamptz NOT NULL DEFAULT now(),
  punto       text        NOT NULL DEFAULT 'entrada-principal',
  user_agent  text
);

CREATE INDEX IF NOT EXISTS idx_asist_registros_usuario_id ON public.asist_registros(usuario_id);
CREATE INDEX IF NOT EXISTS idx_asist_registros_timestamp  ON public.asist_registros(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_asist_registros_usuario_ts ON public.asist_registros(usuario_id, timestamp DESC);

COMMENT ON TABLE public.asist_registros IS
  'Registros de ingreso y salida del personal de parqueadero, generados por escaneo de QR fijo en la entrada.';

-- 7. RLS
ALTER TABLE public.asist_datos_empleado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asist_registros       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados gestionan asist_datos_empleado"
  ON public.asist_datos_empleado FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Autenticados leen asist_registros"
  ON public.asist_registros FOR SELECT TO authenticated USING (true);

CREATE POLICY "Autenticados insertan asist_registros"
  ON public.asist_registros FOR INSERT TO authenticated WITH CHECK (true);

-- 8. Trigger timestamps
CREATE OR REPLACE FUNCTION public.asist_actualizar_timestamp()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER asist_datos_empleado_actualizado_en
  BEFORE UPDATE ON public.asist_datos_empleado
  FOR EACH ROW EXECUTE FUNCTION public.asist_actualizar_timestamp();

-- 9. Vista para panel admin de asistencia
CREATE OR REPLACE VIEW public.asist_vista_registros AS
  SELECT
    r.id,
    r.tipo,
    r.timestamp,
    r.punto,
    r.user_agent,
    p.id              AS usuario_id,
    p.documento_tipo,
    p.documento_numero,
    p.nombre_completo,
    p.url_avatar,
    rm.nombre         AS rol_nombre
  FROM public.asist_registros          r
  JOIN public.perfiles                  p ON p.id = r.usuario_id
  LEFT JOIN public.usuarios_roles      ur ON ur.usuario_id = p.id AND ur.modulo_id = 'parqueadero'
  LEFT JOIN public.roles_modulo        rm ON rm.id = ur.rol_id
  ORDER BY r.timestamp DESC;

ALTER VIEW public.asist_vista_registros SET (security_invoker = true);

-- 10. Fix trigger de auditoría de parqueadero:
--     documento_tipo/numero ya no están en parq_datos_personal → se eliminan del INSERT audit
CREATE OR REPLACE FUNCTION public.trigger_parq_personal_actualizado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nombre text;
  v_correo text;
  v_detalles jsonb := '{}'::jsonb;
BEGIN
  SELECT nombre_completo, correo INTO v_nombre, v_correo
  FROM public.perfiles WHERE id = new.perfil_id;

  IF (TG_OP = 'INSERT') THEN
    v_detalles := jsonb_build_object(
      'nombre',                v_nombre,
      'correo',                v_correo,
      'licencia_numero',       new.licencia_numero,
      'licencia_categoria',    new.licencia_categoria,
      'licencia_vencimiento',  new.licencia_vencimiento
    );
  ELSE
    v_detalles := jsonb_build_object('nombre', v_nombre, 'correo', v_correo);

    IF old.licencia_numero IS DISTINCT FROM new.licencia_numero THEN
      v_detalles := v_detalles || jsonb_build_object('licencia_numero_anterior', old.licencia_numero, 'licencia_numero_nueva', new.licencia_numero);
    END IF;
    IF old.licencia_categoria IS DISTINCT FROM new.licencia_categoria THEN
      v_detalles := v_detalles || jsonb_build_object('licencia_categoria_anterior', old.licencia_categoria, 'licencia_categoria_nueva', new.licencia_categoria);
    END IF;
    IF old.licencia_vencimiento IS DISTINCT FROM new.licencia_vencimiento THEN
      v_detalles := v_detalles || jsonb_build_object('licencia_vencimiento_anterior', old.licencia_vencimiento, 'licencia_vencimiento_nueva', new.licencia_vencimiento);
    END IF;
  END IF;

  PERFORM registrar_auditoria_parqueadero(
    NULL, NULL,
    new.perfil_id,
    CASE WHEN TG_OP = 'INSERT' THEN 'personal_creado' ELSE 'personal_actualizado' END,
    v_detalles
  );

  RETURN new;
END;
$$;
