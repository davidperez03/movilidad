-- ============================================================
-- Migración 002: Sistema de múltiples fotos en inspecciones
-- ============================================================
-- Agrega soporte para múltiples fotos con timestamps en:
-- - Items de inspección (máximo 3 fotos)
-- - Observaciones generales (máximo 5 fotos)
--
-- IMPORTANTE: Esta migración es idempotente y segura para
-- ejecutar en producción. Preserva todos los datos existentes.
-- ============================================================

-- 1. Agregar columna JSONB para múltiples fotos en items
ALTER TABLE public.parq_items_inspeccion
ADD COLUMN IF NOT EXISTS fotos JSONB DEFAULT '[]'::jsonb;

-- 2. Migrar datos existentes de foto_url a formato JSONB
-- Solo si la columna fotos está vacía (evita duplicar en re-ejecuciones)
-- Usar la fecha de la inspección como timestamp (mejor que NOW() para datos históricos)
UPDATE public.parq_items_inspeccion pi
SET fotos = jsonb_build_array(
  jsonb_build_object(
    'url', pi.foto_url,
    'timestamp', COALESCE(
      (SELECT (i.fecha::text || 'T' || i.hora::text)
       FROM public.parq_inspecciones i
       WHERE i.id = pi.inspeccion_id),
      NOW()::text
    )
  )
)
WHERE pi.foto_url IS NOT NULL
  AND pi.foto_url != ''
  AND (pi.fotos IS NULL OR pi.fotos = '[]'::jsonb);

-- 3. Agregar fotos en observaciones generales
ALTER TABLE public.parq_inspecciones
ADD COLUMN IF NOT EXISTS observaciones_fotos JSONB DEFAULT '[]'::jsonb;

-- 4. Agregar constraints de límites (DROP IF EXISTS para idempotencia)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_fotos_max_3'
  ) THEN
    ALTER TABLE public.parq_items_inspeccion
    ADD CONSTRAINT check_fotos_max_3
    CHECK (jsonb_array_length(fotos) <= 3);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_observaciones_fotos_max_5'
  ) THEN
    ALTER TABLE public.parq_inspecciones
    ADD CONSTRAINT check_observaciones_fotos_max_5
    CHECK (jsonb_array_length(observaciones_fotos) <= 5);
  END IF;
END $$;

-- 5. Agregar índice para queries de items con fotos
CREATE INDEX IF NOT EXISTS idx_parq_items_inspeccion_con_fotos
ON public.parq_items_inspeccion((jsonb_array_length(fotos) > 0))
WHERE estado IN ('regular', 'malo');

-- 6. Comentarios
COMMENT ON COLUMN public.parq_items_inspeccion.fotos IS
'Array JSONB de fotos con timestamps: [{url: string, timestamp: string}]. Máximo 3.';

COMMENT ON COLUMN public.parq_inspecciones.observaciones_fotos IS
'Array JSONB de fotos para observaciones generales: [{url: string, timestamp: string}]. Máximo 5.';

COMMENT ON COLUMN public.parq_items_inspeccion.foto_url IS
'DEPRECATED desde v1.9.0: Usar columna "fotos" (JSONB). Se mantiene para retrocompatibilidad.';

-- ============================================================
-- ROLLBACK (ejecutar solo si se necesita revertir):
-- ============================================================
-- ALTER TABLE public.parq_items_inspeccion DROP COLUMN IF EXISTS fotos;
-- ALTER TABLE public.parq_inspecciones DROP COLUMN IF EXISTS observaciones_fotos;
-- DROP INDEX IF EXISTS idx_parq_items_inspeccion_con_fotos;
-- COMMENT ON COLUMN public.parq_items_inspeccion.foto_url IS 'URL de foto de evidencia (para novedades)';
