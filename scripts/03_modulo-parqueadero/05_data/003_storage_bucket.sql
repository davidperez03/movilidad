-- Bucket de storage para parqueadero (fotos de inspecciones)
INSERT INTO storage.buckets (id, name, public)
VALUES ('parqueadero', 'parqueadero', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir archivos parqueadero" ON storage.objects;
DROP POLICY IF EXISTS "Archivos públicos de parqueadero" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar archivos parqueadero" ON storage.objects;

-- Permitir uploads a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden subir archivos parqueadero"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'parqueadero');

-- Permitir lectura pública
CREATE POLICY "Archivos públicos de parqueadero"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'parqueadero');

-- Permitir eliminar archivos (usuarios autenticados)
CREATE POLICY "Usuarios pueden eliminar archivos parqueadero"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'parqueadero');
