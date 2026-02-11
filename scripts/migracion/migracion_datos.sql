-- ============================================================
-- MIGRACIÓN DE DATOS DESDE EXCEL
-- Generado: 2026-02-11 04:50:00
-- Cuentas: 615
-- Traslados: 595
-- Radicaciones activas: 29
-- Organismos: 121
-- ============================================================
-- INSTRUCCIONES:
-- 1. Reemplazar 'admin@admin.com' con el email del admin:
--      sed -i "s/admin@admin.com/correo@real.com/g" migracion_datos.sql
-- 2. Ejecutar con psql (URL non-pooling, puerto 5432):
--      psql "$SUPABASE_POSTGRES_URL_NON_POOLING" -f migracion_datos.sql
-- 3. Verificar que al final aparezca COMMIT y los conteos.
-- ============================================================

BEGIN;

-- ══════════════════════════════════════════════════════════════
-- PASO 0: Configuración
-- ══════════════════════════════════════════════════════════════

-- Tabla temporal con configuración de migración
CREATE TEMP TABLE _mig_config (key text PRIMARY KEY, val uuid);

DO $$
DECLARE
  v_admin uuid;
  v_empresa uuid;
BEGIN
  -- ⚠️  CAMBIAR ESTE EMAIL POR EL DEL ADMINISTRADOR
  SELECT id INTO v_admin FROM public.perfiles
  WHERE correo = 'admin@admin.com' LIMIT 1;  -- columna real en perfiles

  IF v_admin IS NULL THEN
    RAISE EXCEPTION 'No se encontró el usuario administrador. Verificar el email.';
  END IF;

  INSERT INTO _mig_config VALUES ('admin_id', v_admin);

  -- Empresa transportadora Interrapidísimo
  SELECT id INTO v_empresa FROM public.mov_empresas_transporte
  WHERE nombre = 'INTERRAPIDISIMO' LIMIT 1;

  IF v_empresa IS NOT NULL THEN
    INSERT INTO _mig_config VALUES ('empresa_interrapidisimo', v_empresa);
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════
-- PASO 1: Desactivar triggers problemáticos
-- ══════════════════════════════════════════════════════════════

-- Cuentas: desactivar todos (generaremos numero_cuenta manualmente)
ALTER TABLE public.mov_cuentas_vehiculos DISABLE TRIGGER USER;

-- Traslados: desactivar validaciones y historial
ALTER TABLE public.mov_traslados DISABLE TRIGGER USER;

-- Radicaciones: desactivar validaciones y historial
ALTER TABLE public.mov_radicaciones DISABLE TRIGGER USER;

-- ══════════════════════════════════════════════════════════════
-- PASO 2: Insertar organismos de tránsito
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA MCPAL TTOYTTE LA PLATA', 'municipal', 'LA PLATA', 'HUILA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA MCPAL TTOYTTE LA PLATA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INST TTOYTTE MCPAL SOGAMOSO', 'municipal', 'SOGAMOSO', 'BOYACÁ'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INST TTOYTTE MCPAL SOGAMOSO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA', 'municipal', 'BOGOTA, D.C.', 'BOGOTÁ, D. C.'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'SUBSTRIA TTOYTTE DPTAL NARIÑO/SANDONA', 'municipal', 'SANDONA', 'NARIÑO'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'SUBSTRIA TTOYTTE DPTAL NARIÑO/SANDONA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA MCPAL TTEYTTO MONTERIA', 'municipal', 'MONTERIA', 'CÓRDOBA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA MCPAL TTEYTTO MONTERIA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA DE TTOYTTE MCPAL DE SAN SEBASTIAN DE MARIQUITA TOLIMA', 'municipal', 'MARIQUITA', 'TOLIMA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA DE TTOYTTE MCPAL DE SAN SEBASTIAN DE MARIQUITA TOLIMA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'SECRETARÍA DE MOVILIDAD DEL MUNICIPIO DE MOSQUERA', 'municipal', 'MOSQUERA', 'CUNDINAMARCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'SECRETARÍA DE MOVILIDAD DEL MUNICIPIO DE MOSQUERA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL NARIÑO', 'municipal', 'NARIÑO', 'NARIÑO'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL NARIÑO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL FUNZA', 'municipal', 'FUNZA', 'CUNDINAMARCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL FUNZA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'SECRETARÍA DE MOVILIDAD DE MANIZALES', 'municipal', 'MANIZALES', 'CALDAS'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'SECRETARÍA DE MOVILIDAD DE MANIZALES');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'ITBOY - DIST DE TTO SANTA ROSA DE VITERBO', 'municipal', 'SANTA ROSA DE VITERBO', 'BOYACÁ'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'ITBOY - DIST DE TTO SANTA ROSA DE VITERBO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYMOV PIEDECUESTA/SANTANDER', 'municipal', 'PIEDECUESTA', 'SANTANDER'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'DPTO ADTVO TTOYTTE MCPAL PASTO', 'municipal', 'PASTO', 'NARIÑO'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'DPTO ADTVO TTOYTTE MCPAL PASTO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA DE TTOYTTE MEDELLIN', 'municipal', 'MEDELLIN', 'ANTIOQUIA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA DE TTOYTTE MEDELLIN');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'DIR TTOYTTE FLORIDABLANCA', 'municipal', 'FLORIDABLANCA', 'SANTANDER'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'DIR TTOYTTE FLORIDABLANCA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'SUBSTRIA TTOYTTE DPTAL NARIÑO/LA UNION', 'municipal', 'LA UNION', 'NARIÑO'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'SUBSTRIA TTOYTTE DPTAL NARIÑO/LA UNION');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'DPTO ADTVO TTEYTTO VILLA DEL ROSARIO', 'municipal', 'VILLA DEL ROSARIO', 'NORTE DE SANTANDER'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'DPTO ADTVO TTEYTTO VILLA DEL ROSARIO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL GUACARI', 'municipal', 'GUACARI', 'VALLE DEL CAUCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL GUACARI');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTEYMOV CUND/CHOCONTA', 'municipal', 'CHOCONTA', 'CUNDINAMARCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTEYMOV CUND/CHOCONTA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'SECRETARIA DE  MOVILIDAD MUNICIPAL DE CHIA', 'municipal', 'CHIA', 'CUNDINAMARCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'SECRETARIA DE  MOVILIDAD MUNICIPAL DE CHIA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'SECRETARIA DE MOVILIDAD DE NEIVA', 'municipal', 'NEIVA', 'HUILA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'SECRETARIA DE MOVILIDAD DE NEIVA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA MCPAL TTOYTTE GIRON', 'municipal', 'GIRON', 'SANTANDER'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA MCPAL TTOYTTE GIRON');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTEYTTO ENVIGADO', 'municipal', 'ENVIGADO', 'ANTIOQUIA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTEYTTO ENVIGADO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INST DPTAL TTOYTTE META/GUAMAL', 'municipal', 'GUAMAL', 'META'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INST DPTAL TTOYTTE META/GUAMAL');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'ITBOY - DIST TTO NO. 7/SOATA', 'municipal', 'SOATA', 'BOYACÁ'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'ITBOY - DIST TTO NO. 7/SOATA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INST DPTAL TTOYTTE  META/RESTREPO', 'municipal', 'RESTREPO', 'META'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INST DPTAL TTOYTTE  META/RESTREPO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL LA ESTRELLA', 'municipal', 'LA ESTRELLA', 'ANTIOQUIA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL LA ESTRELLA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA DE TTOYTTE CARTAGO', 'municipal', 'CARTAGO', 'VALLE DEL CAUCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA DE TTOYTTE CARTAGO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA MCPAL TTOYTTE IBAGUE', 'municipal', 'IBAGUE', 'TOLIMA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA MCPAL TTOYTTE IBAGUE');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INST TTOYTTE ACACIAS', 'municipal', 'ACACIAS', 'META'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INST TTOYTTE ACACIAS');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA MCPAL TTOYTTE DUITAMA', 'municipal', 'DUITAMA', 'BOYACÁ'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA MCPAL TTOYTTE DUITAMA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'UND MCPAL TTOYTTE PALERMO', 'municipal', 'PALERMO', 'HUILA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'UND MCPAL TTOYTTE PALERMO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL TIMBIO', 'municipal', 'TIMBIO', 'CAUCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL TIMBIO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE PALMIRA', 'municipal', 'PALMIRA', 'VALLE DEL CAUCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE PALMIRA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INST TTOYTTE DPTAL HUILA/TIMANA', 'municipal', 'TIMANA', 'HUILA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INST TTOYTTE DPTAL HUILA/TIMANA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE YUMBO', 'municipal', 'YUMBO', 'VALLE DEL CAUCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE YUMBO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'SDT SUBSECRETARÍA DE MOVILIDAD RIONEGRO', 'municipal', 'RIONEGRO', 'ANTIOQUIA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'SDT SUBSECRETARÍA DE MOVILIDAD RIONEGRO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INST MCPAL TTOYTTE AGUACHICA', 'municipal', 'AGUACHICA', 'CESAR'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INST MCPAL TTOYTTE AGUACHICA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTEYMOV CUND/EL ROSAL', 'municipal', 'EL ROSAL', 'CUNDINAMARCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTEYMOV CUND/EL ROSAL');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA DE MOVILIDAD MPAL FUSAGASUGA', 'municipal', 'FUSAGASUGA', 'CUNDINAMARCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA DE MOVILIDAD MPAL FUSAGASUGA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL VILLAVICENCIO', 'municipal', 'VILLAVICENCIO', 'META'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL VILLAVICENCIO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'DIR TTOYTTE BUCARAMANGA', 'municipal', 'BUCARAMANGA', 'SANTANDER'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'DIR TTOYTTE BUCARAMANGA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL POPAYAN', 'municipal', 'POPAYAN', 'CAUCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL POPAYAN');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTO DPTAL NTE SANTANDER/EL ZULIA', 'municipal', 'EL ZULIA', 'NORTE DE SANTANDER'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTO DPTAL NTE SANTANDER/EL ZULIA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL BARICHARA/SANTANDER', 'municipal', 'BARICHARA', 'SANTANDER'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL BARICHARA/SANTANDER');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INSTITUTO DE MOVILIDAD DE PEREIRA', 'municipal', 'PEREIRA', 'RISARALDA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INSTITUTO DE MOVILIDAD DE PEREIRA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'ITBOY - DIST TTO NO 1/COMBITA', 'municipal', 'COMBITA', 'BOYACÁ'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'ITBOY - DIST TTO NO 1/COMBITA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'DIR TTEYTTO  MCPAL BARBOSA', 'municipal', 'BARBOSA', 'ANTIOQUIA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'DIR TTEYTTO  MCPAL BARBOSA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL DE MADRID', 'municipal', 'MADRID', 'CUNDINAMARCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL DE MADRID');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'DPTO ADTVO TTOYTTE TOLIMA/ORTEGA', 'municipal', 'ORTEGA', 'TOLIMA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'DPTO ADTVO TTOYTTE TOLIMA/ORTEGA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA MCPAL TTOYTTE ESPINAL', 'municipal', 'ESPINAL', 'TOLIMA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA MCPAL TTOYTTE ESPINAL');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL FRESNO', 'municipal', 'FRESNO', 'TOLIMA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL FRESNO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTEYTTO BELLO', 'municipal', 'BELLO', 'ANTIOQUIA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTEYTTO BELLO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'ITBOY - DIST TTO NO. 5/MONIQUIRA', 'municipal', 'MONIQUIRA', 'BOYACÁ'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'ITBOY - DIST TTO NO. 5/MONIQUIRA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL UBATE', 'municipal', 'VILLA DE SAN DIEGO DE UBATE', 'CUNDINAMARCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL UBATE');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTEYMOV CUND/CHIPAQUE', 'municipal', 'CHIPAQUE', 'CUNDINAMARCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTEYMOV CUND/CHIPAQUE');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTO Y GOB MCPAL SANTA ROSA CABAL', 'municipal', 'SANTA ROSA DE CABAL', 'RISARALDA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTO Y GOB MCPAL SANTA ROSA CABAL');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA DE TTOYTTE MCPAL ARMENIA', 'municipal', 'ARMENIA', 'QUINDÍO'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA DE TTOYTTE MCPAL ARMENIA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE FLORIDA', 'municipal', 'FLORIDA', 'VALLE DEL CAUCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE FLORIDA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL LA PAZ', 'municipal', 'LA PAZ', 'CESAR'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL LA PAZ');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INSTITUTO DE TRANSPORTES Y TRÁNSITO DEL HUILA/RIVERA', 'municipal', 'RIVERA', 'HUILA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INSTITUTO DE TRANSPORTES Y TRÁNSITO DEL HUILA/RIVERA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA DE TTOYTTE MCPAL DE GINEBRA', 'municipal', 'GINEBRA', 'VALLE DEL CAUCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA DE TTOYTTE MCPAL DE GINEBRA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'ITBOY - DIST TTO NO. 10/VILLA DE LEYVA', 'municipal', 'VILLA DE LEYVA', 'BOYACÁ'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'ITBOY - DIST TTO NO. 10/VILLA DE LEYVA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INSP TTOYTTE MCPAL PUERTO BOYACA', 'municipal', 'PUERTO BOYACA', 'BOYACÁ'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INSP TTOYTTE MCPAL PUERTO BOYACA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INST DTAL DE TTO CESAR/SAN DIEGO', 'municipal', 'SAN DIEGO', 'CESAR'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INST DTAL DE TTO CESAR/SAN DIEGO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA DE TTOYTTE TUNJA', 'municipal', 'TUNJA', 'BOYACÁ'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA DE TTOYTTE TUNJA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA MCPAL TTOYTTE PAMPLONA', 'municipal', 'PAMPLONA', 'NORTE DE SANTANDER'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA MCPAL TTOYTTE PAMPLONA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INSP TTO MCPAL LA CEJA', 'municipal', 'LA CEJA', 'ANTIOQUIA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INSP TTO MCPAL LA CEJA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL SABANETA', 'municipal', 'SABANETA', 'ANTIOQUIA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL SABANETA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'ITBOY - DIST TTO NO. 2/ NOBSA', 'municipal', 'NOBSA', 'BOYACÁ'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'ITBOY - DIST TTO NO. 2/ NOBSA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'SECRETARIA DE TRANSITO Y TRANSPORTE MUNICIPIO DE SILVANIA', 'municipal', 'SILVANIA', 'CUNDINAMARCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'SECRETARIA DE TRANSITO Y TRANSPORTE MUNICIPIO DE SILVANIA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'DPTO ADTVO TTOYTTE MCPAL CUCUTA', 'municipal', 'CUCUTA', 'NORTE DE SANTANDER'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'DPTO ADTVO TTOYTTE MCPAL CUCUTA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INS MCPAL DE TYTO DE COROZAL', 'municipal', 'COROZAL', 'SUCRE'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INS MCPAL DE TYTO DE COROZAL');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL PAIPA', 'municipal', 'PAIPA', 'BOYACÁ'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL PAIPA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTEY MOV CUND/SIBATE', 'municipal', 'SIBATE', 'CUNDINAMARCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTEY MOV CUND/SIBATE');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INS DE TTOYTTE QUIMBAYA', 'municipal', 'QUIMBAYA', 'QUINDÍO'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INS DE TTOYTTE QUIMBAYA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL BUENAVENTURA', 'municipal', 'BUENAVENTURA', 'VALLE DEL CAUCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL BUENAVENTURA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INST TTOYTTE DEL MUNICIPIO DE LOS PATIOS', 'municipal', 'LOS PATIOS', 'NORTE DE SANTANDER'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INST TTOYTTE DEL MUNICIPIO DE LOS PATIOS');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL SAN JOSE GUAVIARE', 'municipal', 'SAN JOSE DEL GUAVIARE', 'GUAVIARE'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL SAN JOSE GUAVIARE');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA MCPAL DE SOACHA', 'municipal', 'SOACHA', 'CUNDINAMARCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA MCPAL DE SOACHA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA MCPAL TTO CALI', 'municipal', 'CALI', 'VALLE DEL CAUCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA MCPAL TTO CALI');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'ITBOY - DIST TTO NO. 4/SABOYA', 'municipal', 'SABOYA', 'BOYACÁ'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'ITBOY - DIST TTO NO. 4/SABOYA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INST TTOYTTE DE PITALITO - INTRAPITALITO', 'municipal', 'PITALITO', 'HUILA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INST TTOYTTE DE PITALITO - INTRAPITALITO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'ITBOY - DIST TTO NO. 11/RAMIRIQUI', 'municipal', 'RAMIRIQUI', 'BOYACÁ'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'ITBOY - DIST TTO NO. 11/RAMIRIQUI');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'DPTO ADTVO TTOYTTE TOLIMA/GUAYABAL', 'municipal', 'ARMERO', 'TOLIMA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'DPTO ADTVO TTOYTTE TOLIMA/GUAYABAL');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE DPTAL TANGUA/NARIÑO', 'municipal', 'TANGUA', 'NARIÑO'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE DPTAL TANGUA/NARIÑO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INSP TTOYTTE CALARCA', 'municipal', 'CALARCA', 'QUINDÍO'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INSP TTOYTTE CALARCA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTEYTTO MCPAL SANTA FE ANTIOQUIA', 'municipal', 'SANTAFE DE ANTIOQUIA', 'ANTIOQUIA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTEYTTO MCPAL SANTA FE ANTIOQUIA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYMOV MCPAL SOPO/CUND', 'municipal', 'SOPO', 'CUNDINAMARCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYMOV MCPAL SOPO/CUND');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE CAUCASIA', 'municipal', 'CAUCASIA', 'ANTIOQUIA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE CAUCASIA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTEYMOV CUND/VILLETA', 'municipal', 'VILLETA', 'CUNDINAMARCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTEYMOV CUND/VILLETA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA MOVYTTE DPTAL VALLE DEL CAUCA/ALCALA', 'municipal', 'ALCALA', 'VALLE DEL CAUCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA MOVYTTE DPTAL VALLE DEL CAUCA/ALCALA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA DE TTOYTTE DEL MCPIO DE MARINILLA', 'municipal', 'MARINILLA', 'ANTIOQUIA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA DE TTOYTTE DEL MCPIO DE MARINILLA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTEYTTO MCPAL CALDAS/ANTIOQUIA', 'municipal', 'CALDAS', 'ANTIOQUIA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTEYTTO MCPAL CALDAS/ANTIOQUIA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INST TTOYTTE DE CERETE', 'municipal', 'CERETE', 'CÓRDOBA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INST TTOYTTE DE CERETE');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA GOB TTOYTTE MELGAR', 'municipal', 'MELGAR', 'TOLIMA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA GOB TTOYTTE MELGAR');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INST TTOYTTE  ARAUCA/ARAUCA', 'municipal', 'ARAUCA', 'ARAUCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INST TTOYTTE  ARAUCA/ARAUCA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTEYTTO COPACABANA', 'municipal', 'COPACABANA', 'ANTIOQUIA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTEYTTO COPACABANA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL PIENDAMO', 'municipal', 'PIENDAMO', 'CAUCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL PIENDAMO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'DPTO ADTVO TTOYTTE TOLIMA/PURIFICACIÓN', 'municipal', 'PURIFICACION', 'TOLIMA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'DPTO ADTVO TTOYTTE TOLIMA/PURIFICACIÓN');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'DIR TTOYTTE DPTAL CAQUETA/BELEN DE LOS ANDAQUIES', 'municipal', 'BELEN DE LOS ANDAQUIES', 'CAQUETÁ'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'DIR TTOYTTE DPTAL CAQUETA/BELEN DE LOS ANDAQUIES');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'UND TTO CALDAS/ARANZAZU', 'municipal', 'ARANZAZU', 'CALDAS'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'UND TTO CALDAS/ARANZAZU');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTEY MOV CUND/CAQUEZA', 'municipal', 'CAQUEZA', 'CUNDINAMARCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTEY MOV CUND/CAQUEZA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA MCPAL TTEYTTO SINCELEJO', 'municipal', 'SINCELEJO', 'SUCRE'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA MCPAL TTEYTTO SINCELEJO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INST DPTAL DE TTO QUINDIO/CIRCASIA', 'municipal', 'CIRCASIA', 'QUINDÍO'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INST DPTAL DE TTO QUINDIO/CIRCASIA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA MCPAL TTOYTTE HONDA', 'municipal', 'HONDA', 'TOLIMA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA MCPAL TTOYTTE HONDA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA MCPAL TTEYTTO APARTADO', 'municipal', 'APARTADO', 'ANTIOQUIA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA MCPAL TTEYTTO APARTADO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTEYTTO ANSERMA', 'municipal', 'ANSERMA', 'CALDAS'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTEYTTO ANSERMA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL PRADERA', 'municipal', 'PRADERA', 'VALLE DEL CAUCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL PRADERA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL GIRARDOT', 'municipal', 'GIRARDOT', 'CUNDINAMARCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL GIRARDOT');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'DPTO ADTVO TTOYTTE TOLIMA/ ALVARADO', 'municipal', 'ALVARADO', 'TOLIMA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'DPTO ADTVO TTOYTTE TOLIMA/ ALVARADO');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL JAMUNDI', 'municipal', 'JAMUNDI', 'VALLE DEL CAUCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL JAMUNDI');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'SECRETARIA DE TRANSPORTE Y MOVILIDAD DE ZIPAQUIRA', 'municipal', 'ZIPAQUIRA', 'CUNDINAMARCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'SECRETARIA DE TRANSPORTE Y MOVILIDAD DE ZIPAQUIRA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'TRÁNSITO DPTAL NARIÑO/YACUANQUER', 'municipal', 'YACUANQUER', 'NARIÑO'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'TRÁNSITO DPTAL NARIÑO/YACUANQUER');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'ITBOY - DIST TTO NO. 9/MIRAFLORES', 'municipal', 'MIRAFLORES', 'BOYACÁ'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'ITBOY - DIST TTO NO. 9/MIRAFLORES');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'INSP MCPAL TTOYTTE BARBOSA/STDER', 'municipal', 'BARBOSA', 'SANTANDER'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'INSP MCPAL TTOYTTE BARBOSA/STDER');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL IPIALES', 'municipal', 'IPIALES', 'NARIÑO'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL IPIALES');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA MCPAL TTOYTTE PUERTO COLOMBIA', 'municipal', 'PUERTO COLOMBIA', 'ATLÁNTICO'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA MCPAL TTOYTTE PUERTO COLOMBIA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA MCPAL TTOYTTE GARZON', 'municipal', 'GARZON', 'HUILA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA MCPAL TTOYTTE GARZON');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA MOVYTTO OCAÑA', 'municipal', 'OCAÑA', 'NORTE DE SANTANDER'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA MOVYTTO OCAÑA');

INSERT INTO public.mov_organismos_transito (nombre, tipo, municipio, departamento)
SELECT 'STRIA TTOYTTE MCPAL SARAVENA', 'municipal', 'SARAVENA', 'ARAUCA'
WHERE NOT EXISTS (SELECT 1 FROM public.mov_organismos_transito WHERE nombre = 'STRIA TTOYTTE MCPAL SARAVENA');

-- ══════════════════════════════════════════════════════════════
-- PASO 3: Insertar cuentas de vehículos
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP511', '20260211-00001', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP511');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOM666', '20260211-00002', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOM666');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'TMI330', '20260211-00003', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'TMI330');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'VZO61E', '20260211-00004', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'VZO61E');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVM036', '20260211-00005', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVM036');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'ZVF41F', '20260211-00006', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'ZVF41F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT315', '20260211-00007', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT315');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOM145', '20260211-00008', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOM145');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'PCG43E', '20260211-00009', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'PCG43E');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JQT23G', '20260211-00010', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JQT23G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'HZZ859', '20260211-00011', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'HZZ859');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVK442', '20260211-00012', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVK442');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'OFF80G', '20260211-00013', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'OFF80G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'OFJ831', '20260211-00014', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'OFJ831');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL700', '20260211-00015', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL700');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'SPQ21D', '20260211-00016', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'SPQ21D');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'ESQ24G', '20260211-00017', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'ESQ24G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOK965', '20260211-00018', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOK965');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'SPX04D', '20260211-00019', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'SPX04D');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP664', '20260211-00020', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP664');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'VZH12E', '20260211-00021', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'VZH12E');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'OEV68G', '20260211-00022', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'OEV68G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT884', '20260211-00023', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT884');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVM651', '20260211-00024', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVM651');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW021', '20260211-00025', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW021');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LZQ667', '20260211-00026', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LZQ667');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'ZVE34F', '20260211-00027', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'ZVE34F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UYK365', '20260211-00028', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UYK365');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU164', '20260211-00029', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU164');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FWY420', '20260211-00030', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FWY420');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAN112', '20260211-00031', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAN112');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL757', '20260211-00032', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL757');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL916', '20260211-00033', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL916');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'OEU77G', '20260211-00034', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'OEU77G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DGQ119', '20260211-00035', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DGQ119');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP569', '20260211-00036', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP569');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM101', '20260211-00037', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM101');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP569', '20260211-00038', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP569');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM689', '20260211-00039', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM689');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KST811', '20260211-00040', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KST811');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW187', '20260211-00041', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW187');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM473', '20260211-00042', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM473');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ088', '20260211-00043', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ088');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOM568', '20260211-00044', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOM568');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP309', '20260211-00045', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP309');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ016', '20260211-00046', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ016');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP451', '20260211-00047', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP451');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MBU583', '20260211-00048', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MBU583');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DYM256', '20260211-00049', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DYM256');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP073', '20260211-00050', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP073');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JRF73G', '20260211-00051', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JRF73G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOM038', '20260211-00052', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOM038');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'OER25G', '20260211-00053', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'OER25G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FWY585', '20260211-00054', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FWY585');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'HZZ589', '20260211-00055', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'HZZ589');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FWY728', '20260211-00056', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FWY728');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU549', '20260211-00057', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU549');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM227', '20260211-00058', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM227');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FWY712', '20260211-00059', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FWY712');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CPE379', '20260211-00060', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CPE379');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO466', '20260211-00061', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO466');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP920', '20260211-00062', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP920');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXX478', '20260211-00063', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXX478');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL520', '20260211-00064', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL520');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MC079267', '20260211-00065', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MC079267');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MC076383', '20260211-00066', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MC076383');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP270', '20260211-00067', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP270');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LZQ682', '20260211-00068', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LZQ682');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXX734', '20260211-00069', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXX734');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KST821', '20260211-00070', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KST821');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'NMP04D', '20260211-00071', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'NMP04D');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW957', '20260211-00072', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW957');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO558', '20260211-00073', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO558');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM276', '20260211-00074', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM276');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ154', '20260211-00075', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ154');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ526', '20260211-00076', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ526');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'INZ803', '20260211-00077', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'INZ803');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'INZ726', '20260211-00078', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'INZ726');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXX022', '20260211-00079', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXX022');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXX231', '20260211-00080', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXX231');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW031', '20260211-00081', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW031');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JHJ285', '20260211-00082', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JHJ285');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL164', '20260211-00083', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL164');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP469', '20260211-00084', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP469');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FDU18H', '20260211-00085', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FDU18H');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVM153', '20260211-00086', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVM153');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL591', '20260211-00087', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL591');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL633', '20260211-00088', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL633');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO852', '20260211-00089', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO852');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL799', '20260211-00090', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL799');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM061', '20260211-00091', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM061');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WMG10G', '20260211-00092', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WMG10G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXM196', '20260211-00093', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXM196');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW783', '20260211-00094', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW783');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KST805', '20260211-00095', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KST805');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOM117', '20260211-00096', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOM117');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ034', '20260211-00097', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ034');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'GAA31F', '20260211-00098', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'GAA31F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT660', '20260211-00099', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT660');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FWY503', '20260211-00100', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FWY503');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXX338', '20260211-00101', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXX338');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'OEO07G', '20260211-00102', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'OEO07G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL460', '20260211-00103', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL460');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'HZZ821', '20260211-00104', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'HZZ821');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW325', '20260211-00105', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW325');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXM132', '20260211-00106', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXM132');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU340', '20260211-00107', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU340');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOQ098', '20260211-00108', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOQ098');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL603', '20260211-00109', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL603');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'HZZ938', '20260211-00110', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'HZZ938');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP095', '20260211-00111', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP095');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'HZZ670', '20260211-00112', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'HZZ670');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT '895ABO', '20260211-00113', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = '895ABO');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP491', '20260211-00114', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP491');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO992', '20260211-00115', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO992');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'AAE95E', '20260211-00116', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'AAE95E');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT530', '20260211-00117', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT530');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP258', '20260211-00118', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP258');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'HZZ662', '20260211-00119', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'HZZ662');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXM197', '20260211-00120', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXM197');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU237', '20260211-00121', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU237');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW462', '20260211-00122', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW462');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXX216', '20260211-00123', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXX216');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KST205', '20260211-00124', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KST205');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOK922', '20260211-00125', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOK922');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'RSF14G', '20260211-00126', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'RSF14G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'OEI41G', '20260211-00127', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'OEI41G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAN143', '20260211-00128', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAN143');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL951', '20260211-00129', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL951');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ178', '20260211-00130', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ178');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KIS60F', '20260211-00131', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KIS60F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ787', '20260211-00132', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ787');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'PSP15F', '20260211-00133', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'PSP15F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL923', '20260211-00134', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL923');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UFI89A', '20260211-00135', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UFI89A');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KJB92F', '20260211-00136', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KJB92F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'NMB28D', '20260211-00137', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'NMB28D');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LZQ218', '20260211-00138', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LZQ218');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOK932', '20260211-00139', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOK932');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DYM726', '20260211-00140', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DYM726');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOQ286', '20260211-00141', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOQ286');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU961', '20260211-00142', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU961');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL353', '20260211-00143', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL353');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU416', '20260211-00144', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU416');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU476', '20260211-00145', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU476');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT601', '20260211-00146', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT601');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'HZZ642', '20260211-00147', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'HZZ642');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'ZUX35F', '20260211-00148', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'ZUX35F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM665', '20260211-00149', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM665');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAN070', '20260211-00150', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAN070');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXM018', '20260211-00151', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXM018');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CRK032', '20260211-00152', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CRK032');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVK404', '20260211-00153', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVK404');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL024', '20260211-00154', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL024');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOK900', '20260211-00155', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOK900');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP292', '20260211-00156', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP292');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO864', '20260211-00157', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO864');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT336', '20260211-00158', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT336');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO551', '20260211-00159', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO551');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM085', '20260211-00160', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM085');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXX023', '20260211-00161', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXX023');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DYM229', '20260211-00162', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DYM229');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UFU571', '20260211-00163', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UFU571');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW703', '20260211-00164', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW703');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP367', '20260211-00165', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP367');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'PWV51B', '20260211-00166', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'PWV51B');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOM141', '20260211-00167', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOM141');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LZQ061', '20260211-00168', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LZQ061');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOM005', '20260211-00169', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOM005');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSQ027', '20260211-00170', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSQ027');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAN184', '20260211-00171', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAN184');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOQ160', '20260211-00172', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOQ160');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'OEE85G', '20260211-00173', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'OEE85G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM801', '20260211-00174', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM801');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'HZZ676', '20260211-00175', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'HZZ676');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU916', '20260211-00176', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU916');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO851', '20260211-00177', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO851');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JJN957', '20260211-00178', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JJN957');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JJN585', '20260211-00179', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JJN585');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LZQ307', '20260211-00180', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LZQ307');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'GPZ05D', '20260211-00181', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'GPZ05D');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU760', '20260211-00182', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU760');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'AVB97H', '20260211-00183', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'AVB97H');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'HZZ881', '20260211-00184', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'HZZ881');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JRO98G', '20260211-00185', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JRO98G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO552', '20260211-00186', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO552');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL811', '20260211-00187', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL811');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO438', '20260211-00188', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO438');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JRF95G', '20260211-00189', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JRF95G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXM071', '20260211-00190', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXM071');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ067', '20260211-00191', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ067');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FWY912', '20260211-00192', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FWY912');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'INZ575', '20260211-00193', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'INZ575');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LZP938', '20260211-00194', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LZP938');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM827', '20260211-00195', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM827');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP100', '20260211-00196', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP100');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL721', '20260211-00197', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL721');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO650', '20260211-00198', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO650');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UOB77F', '20260211-00199', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UOB77F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVM088', '20260211-00200', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVM088');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MC069678', '20260211-00201', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MC069678');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXM193', '20260211-00202', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXM193');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ456', '20260211-00203', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ456');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KST593', '20260211-00204', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KST593');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT481', '20260211-00205', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT481');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'RRO14G', '20260211-00206', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'RRO14G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW737', '20260211-00207', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW737');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WLX233', '20260211-00208', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WLX233');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KST362', '20260211-00209', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KST362');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO496', '20260211-00210', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO496');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL859', '20260211-00211', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL859');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'BHZ09F', '20260211-00212', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'BHZ09F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW792', '20260211-00213', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW792');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOM092', '20260211-00214', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOM092');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVM732', '20260211-00215', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVM732');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXX453', '20260211-00216', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXX453');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL055', '20260211-00217', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL055');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ959', '20260211-00218', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ959');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CRK402', '20260211-00219', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CRK402');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU706', '20260211-00220', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU706');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'VZZ64E', '20260211-00221', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'VZZ64E');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CMZ828', '20260211-00222', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CMZ828');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO846', '20260211-00223', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO846');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ736', '20260211-00224', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ736');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KST416', '20260211-00225', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KST416');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT302', '20260211-00226', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT302');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'AVD74H', '20260211-00227', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'AVD74H');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FWY802', '20260211-00228', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FWY802');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP106', '20260211-00229', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP106');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'RRG87G', '20260211-00230', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'RRG87G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UDX100', '20260211-00231', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UDX100');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'PES916', '20260211-00232', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'PES916');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CRK451', '20260211-00233', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CRK451');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FWY749', '20260211-00234', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FWY749');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'VZB03E', '20260211-00235', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'VZB03E');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU635', '20260211-00236', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU635');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO589', '20260211-00237', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO589');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP355', '20260211-00238', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP355');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL891', '20260211-00239', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL891');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'GUF26E', '20260211-00240', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'GUF26E');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MC608437', '20260211-00241', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MC608437');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IFX799', '20260211-00242', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IFX799');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOM170', '20260211-00243', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOM170');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOL933', '20260211-00244', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOL933');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'QHQ453', '20260211-00245', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'QHQ453');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LZQ668', '20260211-00246', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LZQ668');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KJC07F', '20260211-00247', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KJC07F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP793', '20260211-00248', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP793');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MC050791', '20260211-00249', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MC050791');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'ABG56E', '20260211-00250', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'ABG56E');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVK954', '20260211-00251', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVK954');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FZY13F', '20260211-00252', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FZY13F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT536', '20260211-00253', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT536');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP892', '20260211-00254', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP892');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KST391', '20260211-00255', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KST391');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DBV484', '20260211-00256', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DBV484');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOM555', '20260211-00257', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOM555');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ395', '20260211-00258', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ395');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOL235', '20260211-00259', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOL235');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'AVF31H', '20260211-00260', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'AVF31H');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'GPR04D', '20260211-00261', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'GPR04D');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL834', '20260211-00262', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL834');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'HZZ831', '20260211-00263', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'HZZ831');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ914', '20260211-00264', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ914');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IBZ892', '20260211-00265', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IBZ892');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CRK486', '20260211-00266', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CRK486');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'HZZ688', '20260211-00267', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'HZZ688');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP487', '20260211-00268', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP487');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT '012ABP', '20260211-00269', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = '012ABP');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL569', '20260211-00270', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL569');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UNO70F', '20260211-00271', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UNO70F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WMM37G', '20260211-00272', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WMM37G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOQ214', '20260211-00273', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOQ214');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL736', '20260211-00274', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL736');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXX497', '20260211-00275', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXX497');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP989', '20260211-00276', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP989');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW930', '20260211-00277', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW930');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOQ275', '20260211-00278', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOQ275');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'SPV32D', '20260211-00279', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'SPV32D');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'SPO19D', '20260211-00280', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'SPO19D');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'SPL75D', '20260211-00281', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'SPL75D');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVK203', '20260211-00282', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVK203');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JJZ018', '20260211-00283', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JJZ018');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU776', '20260211-00284', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU776');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXX007', '20260211-00285', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXX007');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'GUA46E', '20260211-00286', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'GUA46E');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOQ194', '20260211-00287', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOQ194');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'VOS52A', '20260211-00288', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'VOS52A');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT246', '20260211-00289', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT246');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO480', '20260211-00290', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO480');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW777', '20260211-00291', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW777');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXX561', '20260211-00292', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXX561');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UOH81F', '20260211-00293', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UOH81F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM235', '20260211-00294', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM235');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FDJ93H', '20260211-00295', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FDJ93H');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'HXX983', '20260211-00296', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'HXX983');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT668', '20260211-00297', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT668');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'PSS53F', '20260211-00298', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'PSS53F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DYM101', '20260211-00299', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DYM101');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP160', '20260211-00300', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP160');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'AUW29H', '20260211-00301', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'AUW29H');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW078', '20260211-00302', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW078');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO965', '20260211-00303', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO965');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU268', '20260211-00304', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU268');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU076', '20260211-00305', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU076');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FDM46H', '20260211-00306', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FDM46H');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOQ146', '20260211-00307', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOQ146');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU748', '20260211-00308', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU748');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW165', '20260211-00309', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW165');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU224', '20260211-00310', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU224');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'NMV41D', '20260211-00311', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'NMV41D');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU378', '20260211-00312', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU378');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOQ114', '20260211-00313', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOQ114');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'ESE68G', '20260211-00314', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'ESE68G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ177', '20260211-00315', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ177');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UOK30F', '20260211-00316', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UOK30F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP663', '20260211-00317', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP663');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JRI73G', '20260211-00318', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JRI73G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP875', '20260211-00319', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP875');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP894', '20260211-00320', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP894');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAN170', '20260211-00321', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAN170');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FWY534', '20260211-00322', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FWY534');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LDA16H', '20260211-00323', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LDA16H');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'EUS627', '20260211-00324', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'EUS627');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DYM953', '20260211-00325', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DYM953');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL980', '20260211-00326', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL980');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UOI14F', '20260211-00327', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UOI14F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CRK442', '20260211-00328', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CRK442');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP687', '20260211-00329', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP687');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL839', '20260211-00330', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL839');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOQ236', '20260211-00331', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOQ236');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FWY981', '20260211-00332', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FWY981');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVM002', '20260211-00333', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVM002');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'INZ643', '20260211-00334', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'INZ643');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ414', '20260211-00335', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ414');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'OSE807', '20260211-00336', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'OSE807');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT658', '20260211-00337', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT658');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP237', '20260211-00338', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP237');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOM104', '20260211-00339', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOM104');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW190', '20260211-00340', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW190');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOL890', '20260211-00341', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOL890');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LZQ018', '20260211-00342', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LZQ018');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW743', '20260211-00343', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW743');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM042', '20260211-00344', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM042');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FWY941', '20260211-00345', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FWY941');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'TFQ283', '20260211-00346', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'TFQ283');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CRK192', '20260211-00347', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CRK192');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KST839', '20260211-00348', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KST839');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'SQE58D', '20260211-00349', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'SQE58D');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL698', '20260211-00350', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL698');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MC749846', '20260211-00351', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MC749846');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'BHP09F', '20260211-00352', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'BHP09F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KST447', '20260211-00353', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KST447');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOL097', '20260211-00354', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOL097');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW856', '20260211-00355', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW856');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MC039947', '20260211-00356', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MC039947');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOQ168', '20260211-00357', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOQ168');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'RRX94G', '20260211-00358', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'RRX94G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO596', '20260211-00359', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO596');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FWY700', '20260211-00360', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FWY700');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM861', '20260211-00361', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM861');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXM194', '20260211-00362', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXM194');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVM183', '20260211-00363', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVM183');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW995', '20260211-00364', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW995');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOL364', '20260211-00365', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOL364');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW899', '20260211-00366', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW899');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CRK547', '20260211-00367', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CRK547');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP976', '20260211-00368', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP976');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL619', '20260211-00369', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL619');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT '2025-09-23 00:00:00', '20260211-00370', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = '2025-09-23 00:00:00');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDU154', '20260211-00371', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDU154');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM585', '20260211-00372', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM585');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT589', '20260211-00373', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT589');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOM402', '20260211-00374', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOM402');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAN067', '20260211-00375', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAN067');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MC156497', '20260211-00376', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MC156497');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL085', '20260211-00377', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL085');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FZF54F', '20260211-00378', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FZF54F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'GPD84D', '20260211-00379', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'GPD84D');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'AAN03E', '20260211-00380', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'AAN03E');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOM569', '20260211-00381', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOM569');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOQ053', '20260211-00382', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOQ053');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DYM645', '20260211-00383', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DYM645');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU696', '20260211-00384', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU696');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOL883', '20260211-00385', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOL883');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOL427', '20260211-00386', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOL427');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'BBU529', '20260211-00387', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'BBU529');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'PSI13F', '20260211-00388', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'PSI13F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM335', '20260211-00389', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM335');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOQ030', '20260211-00390', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOQ030');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL345', '20260211-00391', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL345');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU518', '20260211-00392', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU518');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'PSD33F', '20260211-00393', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'PSD33F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVM728', '20260211-00394', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVM728');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXX153', '20260211-00395', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXX153');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'TFQ281', '20260211-00396', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'TFQ281');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT691', '20260211-00397', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT691');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CRK353', '20260211-00398', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CRK353');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LZQ522', '20260211-00399', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LZQ522');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FWY713', '20260211-00400', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FWY713');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DYM846', '20260211-00401', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DYM846');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP606', '20260211-00402', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP606');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'PCM09E', '20260211-00403', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'PCM09E');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDU038', '20260211-00404', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDU038');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LZQ367', '20260211-00405', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LZQ367');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ607', '20260211-00406', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ607');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'ABP073', '20260211-00407', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'ABP073');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'VPU19A', '20260211-00408', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'VPU19A');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LZQ462', '20260211-00409', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LZQ462');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP583', '20260211-00410', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP583');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP658', '20260211-00411', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP658');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FWY841', '20260211-00412', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FWY841');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP288', '20260211-00413', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP288');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW246', '20260211-00414', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW246');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP285', '20260211-00415', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP285');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'ZVJ23F', '20260211-00416', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'ZVJ23F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'QFV750', '20260211-00417', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'QFV750');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL060', '20260211-00418', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL060');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU896', '20260211-00419', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU896');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LDA67H', '20260211-00420', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LDA67H');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP568', '20260211-00421', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP568');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FZR63F', '20260211-00422', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FZR63F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KST221', '20260211-00423', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KST221');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'INZ621', '20260211-00424', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'INZ621');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU332', '20260211-00425', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU332');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CSN996', '20260211-00426', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CSN996');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL820', '20260211-00427', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL820');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP885', '20260211-00428', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP885');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JRP54G', '20260211-00429', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JRP54G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WMC84G', '20260211-00430', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WMC84G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL669', '20260211-00431', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL669');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO408', '20260211-00432', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO408');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOM431', '20260211-00433', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOM431');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP037', '20260211-00434', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP037');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KIF24F', '20260211-00435', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KIF24F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'EGQ11C', '20260211-00436', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'EGQ11C');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW333', '20260211-00437', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW333');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXX003', '20260211-00438', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXX003');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FKL465', '20260211-00439', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FKL465');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW084', '20260211-00440', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW084');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'AAO60E', '20260211-00441', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'AAO60E');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSQ031', '20260211-00442', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSQ031');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM566', '20260211-00443', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM566');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LZQ104', '20260211-00444', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LZQ104');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KST304', '20260211-00445', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KST304');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOQ199', '20260211-00446', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOQ199');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW709', '20260211-00447', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW709');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP087', '20260211-00448', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP087');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LZQ370', '20260211-00449', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LZQ370');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU026', '20260211-00450', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU026');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVM526', '20260211-00451', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVM526');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JDP168', '20260211-00452', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JDP168');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DYM280', '20260211-00453', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DYM280');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL892', '20260211-00454', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL892');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO963', '20260211-00455', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO963');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU984', '20260211-00456', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU984');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO739', '20260211-00457', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO739');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'TFV691', '20260211-00458', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'TFV691');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UNW91F', '20260211-00459', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UNW91F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'HZZ958', '20260211-00460', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'HZZ958');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL261', '20260211-00461', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL261');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL161', '20260211-00462', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL161');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM043', '20260211-00463', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM043');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'GPC93D', '20260211-00464', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'GPC93D');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LZQ314', '20260211-00465', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LZQ314');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'PIT58H', '20260211-00466', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'PIT58H');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXM198', '20260211-00467', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXM198');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM156', '20260211-00468', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM156');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP397', '20260211-00469', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP397');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVL661', '20260211-00470', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVL661');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KST414', '20260211-00471', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KST414');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ108', '20260211-00472', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ108');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ362', '20260211-00473', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ362');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'ZVG39F', '20260211-00474', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'ZVG39F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FDG85H', '20260211-00475', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FDG85H');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ424', '20260211-00476', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ424');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'VZC73E', '20260211-00477', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'VZC73E');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'INZ966', '20260211-00478', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'INZ966');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT618', '20260211-00479', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT618');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KIY36F', '20260211-00480', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KIY36F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW539', '20260211-00481', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW539');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW516', '20260211-00482', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW516');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM631', '20260211-00483', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM631');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT667', '20260211-00484', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT667');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT435', '20260211-00485', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT435');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXX479', '20260211-00486', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXX479');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FWY936', '20260211-00487', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FWY936');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ722', '20260211-00488', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ722');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'BHX36F', '20260211-00489', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'BHX36F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL736', '20260211-00490', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL736');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOL782', '20260211-00491', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOL782');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'AUU78H', '20260211-00492', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'AUU78H');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU017', '20260211-00493', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU017');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU459', '20260211-00494', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU459');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JQS11G', '20260211-00495', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JQS11G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL365', '20260211-00496', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL365');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU012', '20260211-00497', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU012');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'HMN884', '20260211-00498', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'HMN884');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'AUT74H', '20260211-00499', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'AUT74H');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'OES72G', '20260211-00500', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'OES72G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'PSO08F', '20260211-00501', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'PSO08F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL159', '20260211-00502', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL159');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'AUX58H', '20260211-00503', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'AUX58H');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW753', '20260211-00504', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW753');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM624', '20260211-00505', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM624');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW601', '20260211-00506', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW601');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WMX58G', '20260211-00507', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WMX58G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOL490', '20260211-00508', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOL490');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVM632', '20260211-00509', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVM632');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT541', '20260211-00510', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT541');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOM240', '20260211-00511', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOM240');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'ZII492', '20260211-00512', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'ZII492');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP094', '20260211-00513', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP094');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'INZ625', '20260211-00514', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'INZ625');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP220', '20260211-00515', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP220');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KST376', '20260211-00516', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KST376');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT237', '20260211-00517', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT237');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU139', '20260211-00518', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU139');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU241', '20260211-00519', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU241');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FWY810', '20260211-00520', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FWY810');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FZK89F', '20260211-00521', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FZK89F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MC036395', '20260211-00522', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MC036395');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU246', '20260211-00523', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU246');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'VEL555', '20260211-00524', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'VEL555');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOL129', '20260211-00525', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOL129');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IAM393', '20260211-00526', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IAM393');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LZQ584', '20260211-00527', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LZQ584');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'INZ953', '20260211-00528', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'INZ953');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FWY783', '20260211-00529', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FWY783');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'GJM973', '20260211-00530', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'GJM973');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP407', '20260211-00531', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP407');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'URE05H', '20260211-00532', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'URE05H');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU155', '20260211-00533', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU155');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU747', '20260211-00534', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU747');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'PIO616', '20260211-00535', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'PIO616');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU400', '20260211-00536', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU400');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DYM792', '20260211-00537', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DYM792');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOL833', '20260211-00538', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOL833');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FZG30F', '20260211-00539', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FZG30F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP286', '20260211-00540', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP286');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ486', '20260211-00541', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ486');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'URN79H', '20260211-00542', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'URN79H');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOM460', '20260211-00543', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOM460');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JOM018', '20260211-00544', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JOM018');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT502', '20260211-00545', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT502');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'VOE40A', '20260211-00546', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'VOE40A');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'UVK500', '20260211-00547', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'UVK500');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CQZ744', '20260211-00548', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CQZ744');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO659', '20260211-00549', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO659');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO634', '20260211-00550', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO634');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'PSM70F', '20260211-00551', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'PSM70F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'URN22H', '20260211-00552', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'URN22H');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL389', '20260211-00553', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL389');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CRK419', '20260211-00554', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CRK419');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KST897', '20260211-00555', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KST897');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'BIK01F', '20260211-00556', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'BIK01F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT403', '20260211-00557', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT403');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WDT572', '20260211-00558', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WDT572');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU959', '20260211-00559', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU959');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MC062320', '20260211-00560', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MC062320');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSP641', '20260211-00561', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSP641');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LZR004', '20260211-00562', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LZR004');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DSO621', '20260211-00563', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DSO621');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FXL781', '20260211-00564', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FXL781');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LZQ468', '20260211-00565', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LZQ468');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOQ191', '20260211-00566', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOQ191');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'PCJ53E', '20260211-00567', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'PCJ53E');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'ZVR93F', '20260211-00568', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'ZVR93F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'OFC66G', '20260211-00569', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'OFC66G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU808', '20260211-00570', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU808');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXX058', '20260211-00571', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXX058');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'GUA56E', '20260211-00572', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'GUA56E');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'VPE34A', '20260211-00573', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'VPE34A');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'RSC95G', '20260211-00574', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'RSC95G');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU103', '20260211-00575', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU103');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KST701', '20260211-00576', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KST701');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MXW171', '20260211-00577', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MXW171');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU903', '20260211-00578', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU903');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'INZ896', '20260211-00579', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'INZ896');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KIM30F', '20260211-00580', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KIM30F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LZQ691', '20260211-00581', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LZQ691');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'HZZ981', '20260211-00582', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'HZZ981');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'PSP18F', '20260211-00583', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'PSP18F');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'CRK250', '20260211-00584', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'CRK250');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KSU323', '20260211-00585', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KSU323');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IOP853', '20260211-00586', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IOP853');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'WTO163', '20260211-00587', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'WTO163');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IJQ830', '20260211-00588', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IJQ830');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'BIZ411', '20260211-00589', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'BIZ411');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'BOS773', '20260211-00590', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'BOS773');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'EIU606', '20260211-00591', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'EIU606');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FNW436', '20260211-00592', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FNW436');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JMW678', '20260211-00593', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JMW678');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'RDQ349', '20260211-00594', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'RDQ349');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'BSC521', '20260211-00595', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'BSC521');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'FOS768', '20260211-00596', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'FOS768');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'GHP169', '20260211-00597', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'GHP169');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IKS433', '20260211-00598', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IKS433');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JLK28C', '20260211-00599', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JLK28C');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'RAW359', '20260211-00600', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'RAW359');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'NFR924', '20260211-00601', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'NFR924');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'BDQ954', '20260211-00602', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'BDQ954');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LTU416', '20260211-00603', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LTU416');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'TSG058', '20260211-00604', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'TSG058');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'SXA682', '20260211-00605', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'SXA682');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'TSM768', '20260211-00606', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'TSM768');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'DVV292', '20260211-00607', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'DVV292');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'IPU308', '20260211-00608', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'IPU308');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'KES370', '20260211-00609', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'KES370');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'SNG195', '20260211-00610', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'SNG195');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'MSX192', '20260211-00611', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'MSX192');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LMH010', '20260211-00612', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LMH010');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'LMW725', '20260211-00613', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'LMW725');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'NBX909', '20260211-00614', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'NBX909');

INSERT INTO public.mov_cuentas_vehiculos (placa, numero_cuenta, tipo_servicio, creado_por)
SELECT 'JVN976', '20260211-00615', 'particular', mc.val
FROM _mig_config mc WHERE mc.key = 'admin_id'
AND NOT EXISTS (SELECT 1 FROM public.mov_cuentas_vehiculos WHERE placa = 'JVN976');

-- ══════════════════════════════════════════════════════════════
-- PASO 4: Insertar traslados
-- ══════════════════════════════════════════════════════════════

-- OMITIDO (sin organismo destino): DSP511

-- OMITIDO (sin organismo destino): JOM666

-- OMITIDO (sin organismo destino): TMI330

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-01-24',
  '2025-01-24',
  CASE WHEN '2025-01-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-01-24'::date, 60) ELSE NULL END,
  '230017662863',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-01-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE LA PLATA'
WHERE cv.placa = 'VZO61E'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-01-29',
  '2025-01-29',
  CASE WHEN '2025-01-29' IS NOT NULL THEN public.sumar_dias_habiles('2025-01-29'::date, 60) ELSE NULL END,
  '230017662856',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-01-29'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'UVM036'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-01',
  '2025-02-01',
  CASE WHEN '2025-02-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-01'::date, 60) ELSE NULL END,
  '230017662866',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'ZVF41F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-01',
  '2025-02-01',
  CASE WHEN '2025-02-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-01'::date, 60) ELSE NULL END,
  '230017662865',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SUBSTRIA TTOYTTE DPTAL NARIÑO/SANDONA'
WHERE cv.placa = 'WDT315'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-03',
  '2025-02-03',
  CASE WHEN '2025-02-03' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-03'::date, 60) ELSE NULL END,
  '230017662526',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-03'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTEYTTO MONTERIA'
WHERE cv.placa = 'JOM145'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-10',
  '2025-02-10',
  CASE WHEN '2025-02-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-10'::date, 60) ELSE NULL END,
  '230017662836',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MCPAL DE SAN SEBASTIAN DE MARIQUITA TOLIMA'
WHERE cv.placa = 'PCG43E'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-10',
  '2025-02-10',
  CASE WHEN '2025-02-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-10'::date, 60) ELSE NULL END,
  '230017662280',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DEL MUNICIPIO DE MOSQUERA'
WHERE cv.placa = 'JQT23G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-11',
  '2025-02-11',
  CASE WHEN '2025-02-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-11'::date, 60) ELSE NULL END,
  '230017662871',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL NARIÑO'
WHERE cv.placa = 'HZZ859'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-11',
  '2025-02-11',
  CASE WHEN '2025-02-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-11'::date, 60) ELSE NULL END,
  '230017662285',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FUNZA'
WHERE cv.placa = 'UVK442'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-12',
  '2025-02-12',
  CASE WHEN '2025-02-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-12'::date, 60) ELSE NULL END,
  '230017662862',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DE MANIZALES'
WHERE cv.placa = 'OFF80G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-12',
  '2025-02-12',
  CASE WHEN '2025-02-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-12'::date, 60) ELSE NULL END,
  '230017662861',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST DE TTO SANTA ROSA DE VITERBO'
WHERE cv.placa = 'OFJ831'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-12',
  '2025-02-12',
  CASE WHEN '2025-02-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-12'::date, 60) ELSE NULL END,
  '230017662840',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'UVL700'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-13',
  '2025-02-13',
  CASE WHEN '2025-02-13' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-13'::date, 60) ELSE NULL END,
  '230017662875',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-13'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'SPQ21D'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-13',
  '2025-02-13',
  CASE WHEN '2025-02-13' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-13'::date, 60) ELSE NULL END,
  '230017662783',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-13'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTOYTTE MCPAL PASTO'
WHERE cv.placa = 'ESQ24G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-14',
  '2025-02-14',
  CASE WHEN '2025-02-14' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-14'::date, 60) ELSE NULL END,
  '230017662310',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-14'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MEDELLIN'
WHERE cv.placa = 'JOK965'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-17',
  '2025-02-17',
  CASE WHEN '2025-02-17' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-17'::date, 60) ELSE NULL END,
  '230017662859',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-17'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE FLORIDABLANCA'
WHERE cv.placa = 'SPX04D'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-17',
  '2025-02-17',
  CASE WHEN '2025-02-17' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-17'::date, 60) ELSE NULL END,
  '230017662304',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-17'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FUNZA'
WHERE cv.placa = 'IOP664'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-18',
  '2025-02-18',
  CASE WHEN '2025-02-18' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-18'::date, 60) ELSE NULL END,
  '230017662855',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-18'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SUBSTRIA TTOYTTE DPTAL NARIÑO/LA UNION'
WHERE cv.placa = 'VZH12E'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-19',
  '2025-02-19',
  CASE WHEN '2025-02-19' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-19'::date, 60) ELSE NULL END,
  '230017662860',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-19'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTEYTTO VILLA DEL ROSARIO'
WHERE cv.placa = 'OEV68G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-20',
  '2025-02-20',
  CASE WHEN '2025-02-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-20'::date, 60) ELSE NULL END,
  '230017662867',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL GUACARI'
WHERE cv.placa = 'WDT884'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-20',
  '2025-02-20',
  CASE WHEN '2025-02-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-20'::date, 60) ELSE NULL END,
  '230017662864',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYMOV CUND/CHOCONTA'
WHERE cv.placa = 'UVM651'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-20',
  '2025-02-20',
  CASE WHEN '2025-02-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-20'::date, 60) ELSE NULL END,
  '230017662174',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DE  MOVILIDAD MUNICIPAL DE CHIA'
WHERE cv.placa = 'MXW021'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-21',
  '2025-02-21',
  CASE WHEN '2025-02-21' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-21'::date, 60) ELSE NULL END,
  '230017662872',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-21'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DE MOVILIDAD DE NEIVA'
WHERE cv.placa = 'LZQ667'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-21',
  '2025-02-21',
  CASE WHEN '2025-02-21' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-21'::date, 60) ELSE NULL END,
  '230017662835',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-21'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'ZVE34F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-24',
  '2025-02-24',
  CASE WHEN '2025-02-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-24'::date, 60) ELSE NULL END,
  '230017662877',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO ENVIGADO'
WHERE cv.placa = 'UYK365'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-25',
  '2025-02-25',
  CASE WHEN '2025-02-25' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-25'::date, 60) ELSE NULL END,
  '230017662876',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-25'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'KSU164'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-25',
  '2025-02-25',
  CASE WHEN '2025-02-25' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-25'::date, 60) ELSE NULL END,
  '230017662874',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-25'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST DPTAL TTOYTTE META/GUAMAL'
WHERE cv.placa = 'FWY420'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-19',
  '2025-03-19',
  CASE WHEN '2025-03-19' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-19'::date, 60) ELSE NULL END,
  '230017662832',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-19'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO. 7/SOATA'
WHERE cv.placa = 'IAN112'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-19',
  '2025-03-19',
  CASE WHEN '2025-03-19' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-19'::date, 60) ELSE NULL END,
  '230017662786',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-19'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DE  MOVILIDAD MUNICIPAL DE CHIA'
WHERE cv.placa = 'FXL757'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-19',
  '2025-03-19',
  CASE WHEN '2025-03-19' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-19'::date, 60) ELSE NULL END,
  '230017662219',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-19'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST DPTAL TTOYTTE  META/RESTREPO'
WHERE cv.placa = 'FXL916'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-20',
  '2025-03-20',
  CASE WHEN '2025-03-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-20'::date, 60) ELSE NULL END,
  '230017662834',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FUNZA'
WHERE cv.placa = 'OEU77G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-20',
  '2025-03-20',
  CASE WHEN '2025-03-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-20'::date, 60) ELSE NULL END,
  '230017662827',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'DGQ119'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-20',
  '2025-03-20',
  CASE WHEN '2025-03-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-20'::date, 60) ELSE NULL END,
  '230017662823',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'DSP569'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-20',
  '2025-03-20',
  CASE WHEN '2025-03-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-20'::date, 60) ELSE NULL END,
  '230017662822',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'IAM101'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-20',
  '2025-03-20',
  CASE WHEN '2025-03-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-20'::date, 60) ELSE NULL END,
  '230017662820',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL LA ESTRELLA'
WHERE cv.placa = 'IOP569'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-20',
  '2025-03-20',
  CASE WHEN '2025-03-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-20'::date, 60) ELSE NULL END,
  '230017662818',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'IAM689'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-20',
  '2025-03-20',
  CASE WHEN '2025-03-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-20'::date, 60) ELSE NULL END,
  '230017662817',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'KST811'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-20',
  '2025-03-20',
  CASE WHEN '2025-03-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-20'::date, 60) ELSE NULL END,
  '230017662777',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE CARTAGO'
WHERE cv.placa = 'MXW187'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-20',
  '2025-03-20',
  CASE WHEN '2025-03-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-20'::date, 60) ELSE NULL END,
  '230017662778',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'IAM473'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-20',
  '2025-03-20',
  CASE WHEN '2025-03-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-20'::date, 60) ELSE NULL END,
  '230017662781',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FUNZA'
WHERE cv.placa = 'CQZ088'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-20',
  '2025-03-20',
  CASE WHEN '2025-03-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-20'::date, 60) ELSE NULL END,
  '230017662790',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE IBAGUE'
WHERE cv.placa = 'JOM568'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-20',
  '2025-03-20',
  CASE WHEN '2025-03-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-20'::date, 60) ELSE NULL END,
  '230017662340',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'DSP309'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-21',
  '2025-03-21',
  CASE WHEN '2025-03-21' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-21'::date, 60) ELSE NULL END,
  '230017662789',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-21'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE ACACIAS'
WHERE cv.placa = 'CQZ016'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-21',
  '2025-03-21',
  CASE WHEN '2025-03-21' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-21'::date, 60) ELSE NULL END,
  '230017662787',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-21'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE DUITAMA'
WHERE cv.placa = 'IOP451'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-21',
  '2025-03-21',
  CASE WHEN '2025-03-21' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-21'::date, 60) ELSE NULL END,
  '230017662601',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-21'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'MBU583'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-21',
  '2025-03-21',
  CASE WHEN '2025-03-21' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-21'::date, 60) ELSE NULL END,
  '230017662202',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-21'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FUNZA'
WHERE cv.placa = 'DYM256'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-22',
  '2025-03-22',
  CASE WHEN '2025-03-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-22'::date, 60) ELSE NULL END,
  '230017662517',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'IOP073'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-22',
  '2025-03-22',
  CASE WHEN '2025-03-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-22'::date, 60) ELSE NULL END,
  '230017662508',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST DE TTO SANTA ROSA DE VITERBO'
WHERE cv.placa = 'JRF73G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-22',
  '2025-03-22',
  CASE WHEN '2025-03-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-22'::date, 60) ELSE NULL END,
  '230017662501',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'JOM038'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-22',
  '2025-03-22',
  CASE WHEN '2025-03-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-22'::date, 60) ELSE NULL END,
  '230017662498',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'UND MCPAL TTOYTTE PALERMO'
WHERE cv.placa = 'OER25G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-22',
  '2025-03-22',
  CASE WHEN '2025-03-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-22'::date, 60) ELSE NULL END,
  '230017662494',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL TIMBIO'
WHERE cv.placa = 'FWY585'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-22',
  '2025-03-22',
  CASE WHEN '2025-03-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-22'::date, 60) ELSE NULL END,
  '230017662490',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'HZZ589'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165617561',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE PALMIRA'
WHERE cv.placa = 'FWY728'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-22',
  '2025-03-22',
  CASE WHEN '2025-03-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-22'::date, 60) ELSE NULL END,
  '230017662268',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'KSU549'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-22',
  '2025-03-22',
  CASE WHEN '2025-03-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-22'::date, 60) ELSE NULL END,
  '230017662238',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MEDELLIN'
WHERE cv.placa = 'IAM227'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-22',
  '2025-03-22',
  CASE WHEN '2025-03-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-22'::date, 60) ELSE NULL END,
  '230017662230',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE DUITAMA'
WHERE cv.placa = 'FWY712'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-22',
  '2025-03-22',
  CASE WHEN '2025-03-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-22'::date, 60) ELSE NULL END,
  '230017662194',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE DPTAL HUILA/TIMANA'
WHERE cv.placa = 'CPE379'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-22',
  '2025-03-22',
  CASE WHEN '2025-03-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-22'::date, 60) ELSE NULL END,
  '230017662188',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'DSO466'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-22',
  '2025-03-22',
  CASE WHEN '2025-03-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-22'::date, 60) ELSE NULL END,
  '230017662184',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MEDELLIN'
WHERE cv.placa = 'DSP920'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-22',
  '2025-03-22',
  CASE WHEN '2025-03-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-22'::date, 60) ELSE NULL END,
  '230017662175',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'MXX478'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-22',
  '2025-03-22',
  CASE WHEN '2025-03-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-22'::date, 60) ELSE NULL END,
  '230017662171',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE YUMBO'
WHERE cv.placa = 'FXL520'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-23',
  '2025-03-23',
  CASE WHEN '2025-03-23' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-23'::date, 60) ELSE NULL END,
  '230017662483',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-23'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SDT SUBSECRETARÍA DE MOVILIDAD RIONEGRO'
WHERE cv.placa = 'MC079267'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-23',
  '2025-03-23',
  CASE WHEN '2025-03-23' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-23'::date, 60) ELSE NULL END,
  '230017662335',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-23'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE ACACIAS'
WHERE cv.placa = 'MC076383'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-05',
  '2025-03-05',
  CASE WHEN '2025-03-05' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-05'::date, 60) ELSE NULL END,
  '230017668693',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-05'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST MCPAL TTOYTTE AGUACHICA'
WHERE cv.placa = 'IOP270'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-25',
  '2025-02-25',
  CASE WHEN '2025-02-25' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-25'::date, 60) ELSE NULL END,
  '230017668794',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-25'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FUNZA'
WHERE cv.placa = 'LZQ682'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-26',
  '2025-02-26',
  CASE WHEN '2025-02-26' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-26'::date, 60) ELSE NULL END,
  '230017668841',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-26'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYMOV CUND/EL ROSAL'
WHERE cv.placa = 'MXX734'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-25',
  '2025-02-25',
  CASE WHEN '2025-02-25' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-25'::date, 60) ELSE NULL END,
  '230017668916',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-25'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'KST821'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-25',
  '2025-02-25',
  CASE WHEN '2025-02-25' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-25'::date, 60) ELSE NULL END,
  '230017668942',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-25'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE MOVILIDAD MPAL FUSAGASUGA'
WHERE cv.placa = 'NMP04D'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-04',
  '2025-03-04',
  CASE WHEN '2025-03-04' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-04'::date, 60) ELSE NULL END,
  '230017669104',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-04'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL VILLAVICENCIO'
WHERE cv.placa = 'MXW957'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-04',
  '2025-03-04',
  CASE WHEN '2025-03-04' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-04'::date, 60) ELSE NULL END,
  '230017669079',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-04'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'DSO558'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-05',
  '2025-03-05',
  CASE WHEN '2025-03-05' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-05'::date, 60) ELSE NULL END,
  '230017669052',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-05'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'IAM276'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-03',
  '2025-03-03',
  CASE WHEN '2025-03-03' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-03'::date, 60) ELSE NULL END,
  '230017669033',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-03'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'CQZ154'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-27',
  '2025-02-27',
  CASE WHEN '2025-02-27' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-27'::date, 60) ELSE NULL END,
  '230017668988',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-27'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'CQZ526'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-26',
  '2025-02-26',
  CASE WHEN '2025-02-26' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-26'::date, 60) ELSE NULL END,
  '230017668983',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-26'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MEDELLIN'
WHERE cv.placa = 'INZ803'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-04',
  '2025-03-04',
  CASE WHEN '2025-03-04' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-04'::date, 60) ELSE NULL END,
  '230017668996',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-04'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL POPAYAN'
WHERE cv.placa = 'INZ726'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-26',
  '2025-02-26',
  CASE WHEN '2025-02-26' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-26'::date, 60) ELSE NULL END,
  '230017668976',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-26'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST MCPAL TTOYTTE AGUACHICA'
WHERE cv.placa = 'MXX022'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-03',
  '2025-03-03',
  CASE WHEN '2025-03-03' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-03'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  'TIENE EXTRAVIADO UN TRAMITE',
  mc.val,
  COALESCE('2025-03-03'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'MXX231'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-05',
  '2025-03-05',
  CASE WHEN '2025-03-05' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-05'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  'TIENE EXTRAVIADO DOS TRAMITE',
  mc.val,
  COALESCE('2025-03-05'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTO DPTAL NTE SANTANDER/EL ZULIA'
WHERE cv.placa = 'MXW031'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-06',
  '2025-03-06',
  CASE WHEN '2025-03-06' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-06'::date, 60) ELSE NULL END,
  '230017709958',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-06'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL BARICHARA/SANTANDER'
WHERE cv.placa = 'JHJ285'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-07',
  '2025-03-07',
  CASE WHEN '2025-03-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-07'::date, 60) ELSE NULL END,
  '230017709936',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INSTITUTO DE MOVILIDAD DE PEREIRA'
WHERE cv.placa = 'FXL164'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-07',
  '2025-03-07',
  CASE WHEN '2025-03-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-07'::date, 60) ELSE NULL END,
  '230017709946',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO 1/COMBITA'
WHERE cv.placa = 'DSP469'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-07',
  '2025-03-07',
  CASE WHEN '2025-03-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-07'::date, 60) ELSE NULL END,
  '230017708970',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'FDU18H'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-07',
  '2025-03-07',
  CASE WHEN '2025-03-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-07'::date, 60) ELSE NULL END,
  '230017709951',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SUBSTRIA TTOYTTE DPTAL NARIÑO/SANDONA'
WHERE cv.placa = 'UVM153'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-10',
  '2025-03-10',
  CASE WHEN '2025-03-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-10'::date, 60) ELSE NULL END,
  '230017709861',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTEYTTO  MCPAL BARBOSA'
WHERE cv.placa = 'UVL591'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-10',
  '2025-03-10',
  CASE WHEN '2025-03-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-10'::date, 60) ELSE NULL END,
  '230017709921',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'UVL633'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-10',
  '2025-03-10',
  CASE WHEN '2025-03-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-10'::date, 60) ELSE NULL END,
  '230017709873',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'DSO852'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-10',
  '2025-03-10',
  CASE WHEN '2025-03-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-10'::date, 60) ELSE NULL END,
  '230017709903',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL DE MADRID'
WHERE cv.placa = 'FXL799'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-11',
  '2025-03-11',
  CASE WHEN '2025-03-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-11'::date, 60) ELSE NULL END,
  '230017710061',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTOYTTE TOLIMA/ORTEGA'
WHERE cv.placa = 'IAM061'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-11',
  '2025-03-11',
  CASE WHEN '2025-03-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-11'::date, 60) ELSE NULL END,
  '230017709844',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE ESPINAL'
WHERE cv.placa = 'WMG10G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-12',
  '2025-03-12',
  CASE WHEN '2025-03-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-12'::date, 60) ELSE NULL END,
  '230017709422',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  '700167248020 | SE FUE UN FALTANTE',
  mc.val,
  COALESCE('2025-03-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FRESNO'
WHERE cv.placa = 'FXM196'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-12',
  '2025-03-12',
  CASE WHEN '2025-03-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-12'::date, 60) ELSE NULL END,
  '230017709324',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'MXW783'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-12',
  '2025-03-12',
  CASE WHEN '2025-03-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-12'::date, 60) ELSE NULL END,
  '230017709353',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE DUITAMA'
WHERE cv.placa = 'KST805'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-12',
  '2025-03-12',
  CASE WHEN '2025-03-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-12'::date, 60) ELSE NULL END,
  '230017709394',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO BELLO'
WHERE cv.placa = 'JOM117'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-13',
  '2025-03-13',
  CASE WHEN '2025-03-13' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-13'::date, 60) ELSE NULL END,
  '230017709313',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-13'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO. 5/MONIQUIRA'
WHERE cv.placa = 'CQZ034'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-14',
  '2025-03-14',
  CASE WHEN '2025-03-14' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-14'::date, 60) ELSE NULL END,
  '230017709281',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-14'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL UBATE'
WHERE cv.placa = 'GAA31F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-15',
  '2025-03-15',
  CASE WHEN '2025-03-15' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-15'::date, 60) ELSE NULL END,
  '230017709256',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-15'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'UND MCPAL TTOYTTE PALERMO'
WHERE cv.placa = 'WDT660'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-17',
  '2025-03-17',
  CASE WHEN '2025-03-17' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-17'::date, 60) ELSE NULL END,
  '230017709159',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-17'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE ACACIAS'
WHERE cv.placa = 'FWY503'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-17',
  '2025-03-17',
  CASE WHEN '2025-03-17' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-17'::date, 60) ELSE NULL END,
  '230017708923',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-17'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE ACACIAS'
WHERE cv.placa = 'MXX338'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-18',
  '2025-03-18',
  CASE WHEN '2025-03-18' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-18'::date, 60) ELSE NULL END,
  '230017709213',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-18'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE FLORIDABLANCA'
WHERE cv.placa = 'OEO07G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-18',
  '2025-03-18',
  CASE WHEN '2025-03-18' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-18'::date, 60) ELSE NULL END,
  '230017709232',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-18'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYMOV CUND/CHIPAQUE'
WHERE cv.placa = 'UVL460'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-18',
  '2025-03-18',
  CASE WHEN '2025-03-18' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-18'::date, 60) ELSE NULL END,
  '230017709139',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-18'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTO Y GOB MCPAL SANTA ROSA CABAL'
WHERE cv.placa = 'HZZ821'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-19',
  '2025-03-19',
  CASE WHEN '2025-03-19' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-19'::date, 60) ELSE NULL END,
  '230017709088',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-19'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'MXW325'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-19',
  '2025-03-19',
  CASE WHEN '2025-03-19' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-19'::date, 60) ELSE NULL END,
  '230017709251',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-19'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MCPAL ARMENIA'
WHERE cv.placa = 'FXM132'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-19',
  '2025-03-19',
  CASE WHEN '2025-03-19' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-19'::date, 60) ELSE NULL END,
  '230017709102',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-19'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FUNZA'
WHERE cv.placa = 'KSU340'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-20',
  '2025-03-20',
  CASE WHEN '2025-03-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-20'::date, 60) ELSE NULL END,
  '230017709030',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'IOQ098'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-20',
  '2025-03-20',
  CASE WHEN '2025-03-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-20'::date, 60) ELSE NULL END,
  '230017709061',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MEDELLIN'
WHERE cv.placa = 'UVL603'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-20',
  '2025-03-20',
  CASE WHEN '2025-03-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-20'::date, 60) ELSE NULL END,
  '700159845211',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'HZZ938'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-20',
  '2025-03-20',
  CASE WHEN '2025-03-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-20'::date, 60) ELSE NULL END,
  '700159856602',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FUNZA'
WHERE cv.placa = 'IOP095'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-21',
  '2025-03-21',
  CASE WHEN '2025-03-21' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-21'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  'TIENE EXTRAVIADO UN TRAMITE',
  mc.val,
  COALESCE('2025-03-21'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DE MOVILIDAD DE NEIVA'
WHERE cv.placa = 'HZZ670'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-21',
  '2025-03-21',
  CASE WHEN '2025-03-21' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-21'::date, 60) ELSE NULL END,
  '230017709014',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-21'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE FLORIDA'
WHERE cv.placa = '895ABO'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-25',
  '2025-03-25',
  CASE WHEN '2025-03-25' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-25'::date, 60) ELSE NULL END,
  '230017708991',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-25'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST DPTAL TTOYTTE  META/RESTREPO'
WHERE cv.placa = 'IOP491'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-25',
  '2025-03-25',
  CASE WHEN '2025-03-25' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-25'::date, 60) ELSE NULL END,
  '700159857687',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-25'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'DSO992'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-25',
  '2025-03-25',
  CASE WHEN '2025-03-25' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-25'::date, 60) ELSE NULL END,
  '230017709047',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-25'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'AAE95E'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-26',
  '2025-03-26',
  CASE WHEN '2025-03-26' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-26'::date, 60) ELSE NULL END,
  '700159838612',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-26'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL LA PAZ'
WHERE cv.placa = 'WDT530'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-27',
  '2025-03-27',
  CASE WHEN '2025-03-27' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-27'::date, 60) ELSE NULL END,
  '700159835787',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-27'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INSTITUTO DE TRANSPORTES Y TRÁNSITO DEL HUILA/RIVERA'
WHERE cv.placa = 'DSP258'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-27',
  '2025-03-27',
  CASE WHEN '2025-03-27' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-27'::date, 60) ELSE NULL END,
  '700159831504',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-27'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MCPAL DE GINEBRA'
WHERE cv.placa = 'HZZ662'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-27',
  '2025-03-27',
  CASE WHEN '2025-03-27' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-27'::date, 60) ELSE NULL END,
  '700159845211',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-27'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'FXM197'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-28',
  '2025-03-28',
  CASE WHEN '2025-03-28' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-28'::date, 60) ELSE NULL END,
  '230017826784',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-28'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'KSU237'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-28',
  '2025-03-28',
  CASE WHEN '2025-03-28' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-28'::date, 60) ELSE NULL END,
  '700159834484',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-28'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO. 10/VILLA DE LEYVA'
WHERE cv.placa = 'MXW462'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-28',
  '2025-03-28',
  CASE WHEN '2025-03-28' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-28'::date, 60) ELSE NULL END,
  '700159833482',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-28'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DE MOVILIDAD DE NEIVA'
WHERE cv.placa = 'MXX216'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-28',
  '2025-03-28',
  CASE WHEN '2025-03-28' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-28'::date, 60) ELSE NULL END,
  '700159843887',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-28'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO ENVIGADO'
WHERE cv.placa = 'KST205'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-03-31',
  '2025-03-31',
  CASE WHEN '2025-03-31' IS NOT NULL THEN public.sumar_dias_habiles('2025-03-31'::date, 60) ELSE NULL END,
  '700159850101',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-03-31'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SDT SUBSECRETARÍA DE MOVILIDAD RIONEGRO'
WHERE cv.placa = 'JOK922'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-01',
  '2025-04-01',
  CASE WHEN '2025-04-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-01'::date, 60) ELSE NULL END,
  '700159854694',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE FLORIDABLANCA'
WHERE cv.placa = 'RSF14G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-01',
  '2025-04-01',
  CASE WHEN '2025-04-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-01'::date, 60) ELSE NULL END,
  '700159842417',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INSP TTOYTTE MCPAL PUERTO BOYACA'
WHERE cv.placa = 'OEI41G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-01',
  '2025-04-01',
  CASE WHEN '2025-04-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-01'::date, 60) ELSE NULL END,
  '700159848928',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST DTAL DE TTO CESAR/SAN DIEGO'
WHERE cv.placa = 'IAN143'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-01',
  '2025-04-01',
  CASE WHEN '2025-04-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-01'::date, 60) ELSE NULL END,
  '700159857687',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'FXL951'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-01',
  '2025-04-01',
  CASE WHEN '2025-04-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-01'::date, 60) ELSE NULL END,
  '700159835787',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INSTITUTO DE TRANSPORTES Y TRÁNSITO DEL HUILA/RIVERA'
WHERE cv.placa = 'CQZ178'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-01',
  '2025-04-01',
  CASE WHEN '2025-04-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-01'::date, 60) ELSE NULL END,
  '700159837879',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE TUNJA'
WHERE cv.placa = 'KIS60F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-02',
  '2025-04-02',
  CASE WHEN '2025-04-02' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-02'::date, 60) ELSE NULL END,
  '700159840743',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-02'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE PAMPLONA'
WHERE cv.placa = 'CQZ787'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-02',
  '2025-04-02',
  CASE WHEN '2025-04-02' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-02'::date, 60) ELSE NULL END,
  '700159856602',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-02'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FUNZA'
WHERE cv.placa = 'PSP15F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-02',
  '2025-04-02',
  CASE WHEN '2025-04-02' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-02'::date, 60) ELSE NULL END,
  '700159851728',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-02'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL UBATE'
WHERE cv.placa = 'UVL923'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-03',
  '2025-04-03',
  CASE WHEN '2025-04-03' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-03'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  'YA ESTA EN EL TRANSITO',
  mc.val,
  COALESCE('2025-04-03'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INSP TTOYTTE MCPAL PUERTO BOYACA'
WHERE cv.placa = 'UFI89A'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-03',
  '2025-04-03',
  CASE WHEN '2025-04-03' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-03'::date, 60) ELSE NULL END,
  '700159839541',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-03'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL LA ESTRELLA'
WHERE cv.placa = 'KJB92F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-04',
  '2025-04-04',
  CASE WHEN '2025-04-04' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-04'::date, 60) ELSE NULL END,
  '700159852540',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-04'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INSP TTO MCPAL LA CEJA'
WHERE cv.placa = 'NMB28D'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-04',
  '2025-04-04',
  CASE WHEN '2025-04-04' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-04'::date, 60) ELSE NULL END,
  '700159854211',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-04'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST DPTAL TTOYTTE  META/RESTREPO'
WHERE cv.placa = 'LZQ218'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-04',
  '2025-04-04',
  CASE WHEN '2025-04-04' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-04'::date, 60) ELSE NULL END,
  '700159856165',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-04'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'JOK932'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-04',
  '2025-04-04',
  CASE WHEN '2025-04-04' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-04'::date, 60) ELSE NULL END,
  '700159856602',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-04'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FUNZA'
WHERE cv.placa = 'DYM726'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-05',
  '2025-04-05',
  CASE WHEN '2025-04-05' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-05'::date, 60) ELSE NULL END,
  '700159854211',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-05'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST DPTAL TTOYTTE  META/RESTREPO'
WHERE cv.placa = 'IOQ286'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-07',
  '2025-04-07',
  CASE WHEN '2025-04-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-07'::date, 60) ELSE NULL END,
  '700159836962',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTEYTTO VILLA DEL ROSARIO'
WHERE cv.placa = 'KSU961'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-07',
  '2025-04-07',
  CASE WHEN '2025-04-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-07'::date, 60) ELSE NULL END,
  '700159857189',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DEL MUNICIPIO DE MOSQUERA'
WHERE cv.placa = 'UVL353'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-09',
  '2025-04-09',
  CASE WHEN '2025-04-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-09'::date, 60) ELSE NULL END,
  '700159832868',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYMOV CUND/CHIPAQUE'
WHERE cv.placa = 'KSU416'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-09',
  '2025-04-09',
  CASE WHEN '2025-04-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-09'::date, 60) ELSE NULL END,
  '700159847989',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL SABANETA'
WHERE cv.placa = 'KSU476'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-09',
  '2025-04-09',
  CASE WHEN '2025-04-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-09'::date, 60) ELSE NULL END,
  '700159847517',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO. 2/ NOBSA'
WHERE cv.placa = 'WDT601'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-09',
  '2025-04-09',
  CASE WHEN '2025-04-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-09'::date, 60) ELSE NULL END,
  '700159856165',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'HZZ642'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-09',
  '2025-04-09',
  CASE WHEN '2025-04-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-09'::date, 60) ELSE NULL END,
  '700159843097',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'ZUX35F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-10',
  '2025-04-10',
  CASE WHEN '2025-04-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-10'::date, 60) ELSE NULL END,
  '700159856602',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FUNZA'
WHERE cv.placa = 'IAM665'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-10',
  '2025-04-10',
  CASE WHEN '2025-04-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-10'::date, 60) ELSE NULL END,
  '700159854694',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE FLORIDABLANCA'
WHERE cv.placa = 'IAN070'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-11',
  '2025-04-11',
  CASE WHEN '2025-04-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-11'::date, 60) ELSE NULL END,
  '700159856165',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'FXM018'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-11',
  '2025-04-11',
  CASE WHEN '2025-04-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-11'::date, 60) ELSE NULL END,
  '700159845211',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'CRK032'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-21',
  '2025-04-21',
  CASE WHEN '2025-04-21' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-21'::date, 60) ELSE NULL END,
  '700159855349',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-21'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'UVK404'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-15',
  '2025-04-15',
  CASE WHEN '2025-04-15' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-15'::date, 60) ELSE NULL END,
  '700159857687',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-15'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'FXL024'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-11',
  '2025-04-11',
  CASE WHEN '2025-04-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-11'::date, 60) ELSE NULL END,
  '700159854694',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE FLORIDABLANCA'
WHERE cv.placa = 'JOK900'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-21',
  '2025-04-21',
  CASE WHEN '2025-04-21' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-21'::date, 60) ELSE NULL END,
  '700159857189',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-21'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DEL MUNICIPIO DE MOSQUERA'
WHERE cv.placa = 'DSP292'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-11',
  '2025-04-11',
  CASE WHEN '2025-04-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-11'::date, 60) ELSE NULL END,
  '700159856165',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'DSO864'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-11',
  '2025-04-11',
  CASE WHEN '2025-04-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-11'::date, 60) ELSE NULL END,
  '700159850709',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'UND MCPAL TTOYTTE PALERMO'
WHERE cv.placa = 'WDT336'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-11',
  '2025-04-11',
  CASE WHEN '2025-04-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-11'::date, 60) ELSE NULL END,
  '700159836462',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL DE MADRID'
WHERE cv.placa = 'DSO551'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-11',
  '2025-04-11',
  CASE WHEN '2025-04-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-11'::date, 60) ELSE NULL END,
  '700159857189',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DEL MUNICIPIO DE MOSQUERA'
WHERE cv.placa = 'IAM085'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-22',
  '2025-04-22',
  CASE WHEN '2025-04-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-22'::date, 60) ELSE NULL END,
  '700159857687',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'MXX023'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-22',
  '2025-04-22',
  CASE WHEN '2025-04-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-22'::date, 60) ELSE NULL END,
  '700159846079',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST MCPAL TTOYTTE AGUACHICA'
WHERE cv.placa = 'DYM229'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-23',
  '2025-04-23',
  CASE WHEN '2025-04-23' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-23'::date, 60) ELSE NULL END,
  '700159841448',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  'DEVUELTO POR NOVEDAD EN DOCUMENTO DE TRAMITE DEL 2016, YA SE RESP AL TRANSITO Y SE SOLICITA AL USUARIO',
  mc.val,
  COALESCE('2025-04-23'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DE TRANSITO Y TRANSPORTE MUNICIPIO DE SILVANIA'
WHERE cv.placa = 'UFU571'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-22',
  '2025-04-22',
  CASE WHEN '2025-04-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-22'::date, 60) ELSE NULL END,
  '700159837879',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE TUNJA'
WHERE cv.placa = 'MXW703'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-23',
  '2025-04-23',
  CASE WHEN '2025-04-23' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-23'::date, 60) ELSE NULL END,
  '700159855349',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-23'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'DSP367'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-23',
  '2025-04-23',
  CASE WHEN '2025-04-23' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-23'::date, 60) ELSE NULL END,
  '700159843887',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-23'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO ENVIGADO'
WHERE cv.placa = 'PWV51B'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-23',
  '2025-04-23',
  CASE WHEN '2025-04-23' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-23'::date, 60) ELSE NULL END,
  '700159847030',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-23'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTOYTTE MCPAL CUCUTA'
WHERE cv.placa = 'JOM141'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-24',
  '2025-04-24',
  CASE WHEN '2025-04-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-24'::date, 60) ELSE NULL END,
  '700161863253',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE IBAGUE'
WHERE cv.placa = 'LZQ061'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-25',
  '2025-04-25',
  CASE WHEN '2025-04-25' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-25'::date, 60) ELSE NULL END,
  '700161856173',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-25'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE DUITAMA'
WHERE cv.placa = 'JOM005'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-25',
  '2025-04-25',
  CASE WHEN '2025-04-25' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-25'::date, 60) ELSE NULL END,
  '700161870239',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  'DEVUELTO POR VENCIMIENTO DE TERMINOS',
  mc.val,
  COALESCE('2025-04-25'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO ENVIGADO'
WHERE cv.placa = 'DSQ027'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-29',
  '2025-04-29',
  CASE WHEN '2025-04-29' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-29'::date, 60) ELSE NULL END,
  '700161854670',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-29'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST DPTAL TTOYTTE  META/RESTREPO'
WHERE cv.placa = 'IAN184'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-28',
  '2025-04-28',
  CASE WHEN '2025-04-28' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-28'::date, 60) ELSE NULL END,
  '700161871548',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-28'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'IOQ160'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-29',
  '2025-04-29',
  CASE WHEN '2025-04-29' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-29'::date, 60) ELSE NULL END,
  '700161873042',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-29'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'OEE85G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-21',
  '2025-07-21',
  CASE WHEN '2025-07-21' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-21'::date, 60) ELSE NULL END,
  '700164056641',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-21'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'IAM801'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-29',
  '2025-04-29',
  CASE WHEN '2025-04-29' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-29'::date, 60) ELSE NULL END,
  '700161864768',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-29'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTOYTTE MCPAL CUCUTA'
WHERE cv.placa = 'HZZ676'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-29',
  '2025-04-29',
  CASE WHEN '2025-04-29' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-29'::date, 60) ELSE NULL END,
  '700161871548',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-29'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'KSU916'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-11',
  '2025-04-11',
  CASE WHEN '2025-04-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-11'::date, 60) ELSE NULL END,
  '700161869656',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'DSO851'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-29',
  '2025-04-29',
  CASE WHEN '2025-04-29' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-29'::date, 60) ELSE NULL END,
  '700161869656',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-29'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'JJN957'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-24',
  '2025-04-24',
  CASE WHEN '2025-04-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-24'::date, 60) ELSE NULL END,
  '700161861606',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INS MCPAL DE TYTO DE COROZAL'
WHERE cv.placa = 'JJN585'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-24',
  '2025-04-24',
  CASE WHEN '2025-04-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-24'::date, 60) ELSE NULL END,
  '700161871548',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'LZQ307'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-25',
  '2025-04-25',
  CASE WHEN '2025-04-25' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-25'::date, 60) ELSE NULL END,
  '700161872320',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-25'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'GPZ05D'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-25',
  '2025-04-25',
  CASE WHEN '2025-04-25' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-25'::date, 60) ELSE NULL END,
  '700161871548',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-25'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'KSU760'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-24',
  '2025-04-24',
  CASE WHEN '2025-04-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-24'::date, 60) ELSE NULL END,
  '700161863822',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTEYTTO VILLA DEL ROSARIO'
WHERE cv.placa = 'AVB97H'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-25',
  '2025-04-25',
  CASE WHEN '2025-04-25' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-25'::date, 60) ELSE NULL END,
  '700161854322',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-25'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL PAIPA'
WHERE cv.placa = 'HZZ881'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-05',
  '2025-05-05',
  CASE WHEN '2025-05-05' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-05'::date, 60) ELSE NULL END,
  '700170021142',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-05'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEY MOV CUND/SIBATE'
WHERE cv.placa = 'JRO98G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-30',
  '2025-04-30',
  CASE WHEN '2025-04-30' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-30'::date, 60) ELSE NULL END,
  '700161870239',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  'DEVUELTO POR VENCIMIENTO DE TERMINOS',
  mc.val,
  COALESCE('2025-04-30'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO ENVIGADO'
WHERE cv.placa = 'DSO552'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-30',
  '2025-04-30',
  CASE WHEN '2025-04-30' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-30'::date, 60) ELSE NULL END,
  '700161856173',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-30'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE DUITAMA'
WHERE cv.placa = 'FXL811'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-02',
  '2025-05-02',
  CASE WHEN '2025-05-02' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-02'::date, 60) ELSE NULL END,
  '700161872320',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-02'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'DSO438'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-02',
  '2025-05-02',
  CASE WHEN '2025-05-02' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-02'::date, 60) ELSE NULL END,
  '700161865928',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-02'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INSTITUTO DE TRANSPORTES Y TRÁNSITO DEL HUILA/RIVERA'
WHERE cv.placa = 'JRF95G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-02',
  '2025-05-02',
  CASE WHEN '2025-05-02' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-02'::date, 60) ELSE NULL END,
  '700161869656',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-02'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'FXM071'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-25',
  '2025-04-25',
  CASE WHEN '2025-04-25' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-25'::date, 60) ELSE NULL END,
  '700161857336',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-25'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST DE TTO SANTA ROSA DE VITERBO'
WHERE cv.placa = 'CQZ067'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-30',
  '2025-04-30',
  CASE WHEN '2025-04-30' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-30'::date, 60) ELSE NULL END,
  '700161864768',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-30'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTOYTTE MCPAL CUCUTA'
WHERE cv.placa = 'FWY912'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-05',
  '2025-05-05',
  CASE WHEN '2025-05-05' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-05'::date, 60) ELSE NULL END,
  '700161872320',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-05'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'INZ575'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-05',
  '2025-05-05',
  CASE WHEN '2025-05-05' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-05'::date, 60) ELSE NULL END,
  '700161871548',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-05'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'LZP938'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-05',
  '2025-05-05',
  CASE WHEN '2025-05-05' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-05'::date, 60) ELSE NULL END,
  '700161872320',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-05'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'IAM827'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-07',
  '2025-05-07',
  CASE WHEN '2025-05-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-07'::date, 60) ELSE NULL END,
  '700161856813',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INS DE TTOYTTE QUIMBAYA'
WHERE cv.placa = 'IOP100'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-07',
  '2025-05-07',
  CASE WHEN '2025-05-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-07'::date, 60) ELSE NULL END,
  '700161851862',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE FLORIDABLANCA'
WHERE cv.placa = 'FXL721'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-07',
  '2025-05-07',
  CASE WHEN '2025-05-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-07'::date, 60) ELSE NULL END,
  '700161860811',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTO Y GOB MCPAL SANTA ROSA CABAL'
WHERE cv.placa = 'DSO650'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-09',
  '2025-05-09',
  CASE WHEN '2025-05-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-09'::date, 60) ELSE NULL END,
  '700161859795',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL BUENAVENTURA'
WHERE cv.placa = 'UOB77F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-09',
  '2025-05-09',
  CASE WHEN '2025-05-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-09'::date, 60) ELSE NULL END,
  '700161856173',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE DUITAMA'
WHERE cv.placa = 'UVM088'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-04-30',
  '2025-04-30',
  CASE WHEN '2025-04-30' IS NOT NULL THEN public.sumar_dias_habiles('2025-04-30'::date, 60) ELSE NULL END,
  '700161862640',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-04-30'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO. 10/VILLA DE LEYVA'
WHERE cv.placa = 'MC069678'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-08',
  '2025-05-08',
  CASE WHEN '2025-05-08' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-08'::date, 60) ELSE NULL END,
  '700161859275',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-08'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL SABANETA'
WHERE cv.placa = 'FXM193'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-07',
  '2025-05-07',
  CASE WHEN '2025-05-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-07'::date, 60) ELSE NULL END,
  '700161871548',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'CQZ456'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-07',
  '2025-05-07',
  CASE WHEN '2025-05-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-07'::date, 60) ELSE NULL END,
  '700161855626',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE DEL MUNICIPIO DE LOS PATIOS'
WHERE cv.placa = 'KST593'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-07',
  '2025-05-07',
  CASE WHEN '2025-05-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-07'::date, 60) ELSE NULL END,
  '700161860166',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL SAN JOSE GUAVIARE'
WHERE cv.placa = 'WDT481'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-13',
  '2025-05-13',
  CASE WHEN '2025-05-13' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-13'::date, 60) ELSE NULL END,
  '700161857768',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-13'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MCPAL DE SAN SEBASTIAN DE MARIQUITA TOLIMA'
WHERE cv.placa = 'RRO14G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-09',
  '2025-05-09',
  CASE WHEN '2025-05-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-09'::date, 60) ELSE NULL END,
  '700161873042',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'MXW737'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-13',
  '2025-05-13',
  CASE WHEN '2025-05-13' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-13'::date, 60) ELSE NULL END,
  '700161861997',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-13'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL DE SOACHA'
WHERE cv.placa = 'WLX233'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-13',
  '2025-05-13',
  CASE WHEN '2025-05-13' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-13'::date, 60) ELSE NULL END,
  '700161869656',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-13'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'KST362'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-12',
  '2025-05-12',
  CASE WHEN '2025-05-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-12'::date, 60) ELSE NULL END,
  '700161858495',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DE MANIZALES'
WHERE cv.placa = 'DSO496'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-13',
  '2025-05-13',
  CASE WHEN '2025-05-13' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-13'::date, 60) ELSE NULL END,
  '230017825952',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-13'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DEL MUNICIPIO DE MOSQUERA'
WHERE cv.placa = 'UVL859'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-13',
  '2025-05-13',
  CASE WHEN '2025-05-13' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-13'::date, 60) ELSE NULL END,
  '230017825972',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-13'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE FLORIDA'
WHERE cv.placa = 'BHZ09F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-13',
  '2025-02-13',
  CASE WHEN '2025-02-13' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-13'::date, 60) ELSE NULL END,
  '230017825924',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-13'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FUNZA'
WHERE cv.placa = 'MXW792'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-13',
  '2025-05-13',
  CASE WHEN '2025-05-13' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-13'::date, 60) ELSE NULL END,
  '230017825960',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-13'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'JOM092'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-14',
  '2025-05-14',
  CASE WHEN '2025-05-14' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-14'::date, 60) ELSE NULL END,
  '700161870849',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-14'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYMOV CUND/CHOCONTA'
WHERE cv.placa = 'UVM732'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-06-26',
  '2025-06-26',
  CASE WHEN '2025-06-26' IS NOT NULL THEN public.sumar_dias_habiles('2025-06-26'::date, 60) ELSE NULL END,
  '700161873959',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-06-26'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTO CALI'
WHERE cv.placa = 'MXX453'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-06-26',
  '2025-06-26',
  CASE WHEN '2025-06-26' IS NOT NULL THEN public.sumar_dias_habiles('2025-06-26'::date, 60) ELSE NULL END,
  '700161851862',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-06-26'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE FLORIDABLANCA'
WHERE cv.placa = 'FXL055'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-14',
  '2025-05-14',
  CASE WHEN '2025-05-14' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-14'::date, 60) ELSE NULL END,
  '700161873042',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-14'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'CQZ959'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-06-26',
  '2025-06-26',
  CASE WHEN '2025-06-26' IS NOT NULL THEN public.sumar_dias_habiles('2025-06-26'::date, 60) ELSE NULL END,
  '700161853768',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-06-26'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE DPTAL HUILA/TIMANA'
WHERE cv.placa = 'CRK402'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-06-26',
  '2025-06-26',
  CASE WHEN '2025-06-26' IS NOT NULL THEN public.sumar_dias_habiles('2025-06-26'::date, 60) ELSE NULL END,
  '700161851447',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-06-26'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO. 2/ NOBSA'
WHERE cv.placa = 'KSU706'
AND mc.key = 'admin_id';

-- OMITIDO (sin fecha_tramite): VZZ64E

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-06-26',
  '2025-06-26',
  CASE WHEN '2025-06-26' IS NOT NULL THEN public.sumar_dias_habiles('2025-06-26'::date, 60) ELSE NULL END,
  '700161855021',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-06-26'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'UND MCPAL TTOYTTE PALERMO'
WHERE cv.placa = 'CMZ828'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-06-27',
  '2025-06-27',
  CASE WHEN '2025-06-27' IS NOT NULL THEN public.sumar_dias_habiles('2025-06-27'::date, 60) ELSE NULL END,
  '700161852243',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-06-27'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'DSO846'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-06-26',
  '2025-06-26',
  CASE WHEN '2025-06-26' IS NOT NULL THEN public.sumar_dias_habiles('2025-06-26'::date, 60) ELSE NULL END,
  '700161872320',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-06-26'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'CQZ736'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-06-26',
  '2025-06-26',
  CASE WHEN '2025-06-26' IS NOT NULL THEN public.sumar_dias_habiles('2025-06-26'::date, 60) ELSE NULL END,
  '700161854322',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-06-26'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL PAIPA'
WHERE cv.placa = 'KST416'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-06-26',
  '2025-06-26',
  CASE WHEN '2025-06-26' IS NOT NULL THEN public.sumar_dias_habiles('2025-06-26'::date, 60) ELSE NULL END,
  '700161873042',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-06-26'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'WDT302'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-06-26',
  '2025-06-26',
  CASE WHEN '2025-06-26' IS NOT NULL THEN public.sumar_dias_habiles('2025-06-26'::date, 60) ELSE NULL END,
  '700161863253',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-06-26'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE IBAGUE'
WHERE cv.placa = 'AVD74H'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-23',
  '2025-05-23',
  CASE WHEN '2025-05-23' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-23'::date, 60) ELSE NULL END,
  '700161869656',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-23'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'FWY802'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-06-26',
  '2025-06-26',
  CASE WHEN '2025-06-26' IS NOT NULL THEN public.sumar_dias_habiles('2025-06-26'::date, 60) ELSE NULL END,
  '700161853177',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-06-26'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO. 4/SABOYA'
WHERE cv.placa = 'DSP106'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-06-26',
  '2025-06-26',
  CASE WHEN '2025-06-26' IS NOT NULL THEN public.sumar_dias_habiles('2025-06-26'::date, 60) ELSE NULL END,
  '700161872320',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-06-26'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'RRG87G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-07',
  '2025-07-07',
  CASE WHEN '2025-07-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-07'::date, 60) ELSE NULL END,
  '700164054276',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'UDX100'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-08',
  '2025-07-08',
  CASE WHEN '2025-07-08' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-08'::date, 60) ELSE NULL END,
  '700164066035',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-08'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE DE PITALITO - INTRAPITALITO'
WHERE cv.placa = 'PES916'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-08',
  '2025-07-08',
  CASE WHEN '2025-07-08' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-08'::date, 60) ELSE NULL END,
  '700164063693',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-08'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'CRK451'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-08',
  '2025-07-08',
  CASE WHEN '2025-07-08' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-08'::date, 60) ELSE NULL END,
  '700164071052',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-08'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO ENVIGADO'
WHERE cv.placa = 'FWY749'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-08',
  '2025-07-08',
  CASE WHEN '2025-07-08' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-08'::date, 60) ELSE NULL END,
  '700164056641',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-08'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'VZB03E'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-07',
  '2025-07-07',
  CASE WHEN '2025-07-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-07'::date, 60) ELSE NULL END,
  '700164070132',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INSTITUTO DE MOVILIDAD DE PEREIRA'
WHERE cv.placa = 'KSU635'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-07',
  '2025-07-07',
  CASE WHEN '2025-07-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-07'::date, 60) ELSE NULL END,
  '700164056641',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'DSO589'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-08',
  '2025-07-08',
  CASE WHEN '2025-07-08' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-08'::date, 60) ELSE NULL END,
  '700164064510',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-08'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL DE MADRID'
WHERE cv.placa = 'IOP355'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-07',
  '2025-07-07',
  CASE WHEN '2025-07-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-07'::date, 60) ELSE NULL END,
  '700164059503',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTOYTTE MCPAL PASTO'
WHERE cv.placa = 'FXL891'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-08',
  '2025-07-08',
  CASE WHEN '2025-07-08' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-08'::date, 60) ELSE NULL END,
  '700164054276',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-08'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'GUF26E'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-08',
  '2025-07-08',
  CASE WHEN '2025-07-08' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-08'::date, 60) ELSE NULL END,
  '700164060151',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  'DEVUELTO POR NOVEDAD EN RUNT Y DECLARACION DE IMPORTACION, YA SE RESP AL TRANSITO Y SE SOLICITA A DIAN VERIFICACION, SE INFORMARA AL USUARIO POR OFICIO TAMBN',
  mc.val,
  COALESCE('2025-07-08'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FUNZA'
WHERE cv.placa = 'MC608437'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-08',
  '2025-07-08',
  CASE WHEN '2025-07-08' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-08'::date, 60) ELSE NULL END,
  '700164052847',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-08'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL UBATE'
WHERE cv.placa = 'IFX799'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-23',
  '2025-05-23',
  CASE WHEN '2025-05-23' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-23'::date, 60) ELSE NULL END,
  '700159854211',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-23'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST DPTAL TTOYTTE  META/RESTREPO'
WHERE cv.placa = 'JOM170'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-07',
  '2025-07-07',
  CASE WHEN '2025-07-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-07'::date, 60) ELSE NULL END,
  '700164058567',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INSTITUTO DE TRANSPORTES Y TRÁNSITO DEL HUILA/RIVERA'
WHERE cv.placa = 'JOL933'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-07',
  '2025-07-07',
  CASE WHEN '2025-07-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-07'::date, 60) ELSE NULL END,
  '700164049739',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'QHQ453'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-07',
  '2025-07-07',
  CASE WHEN '2025-07-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-07'::date, 60) ELSE NULL END,
  '700164067035',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DE MANIZALES'
WHERE cv.placa = 'LZQ668'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-08',
  '2025-07-08',
  CASE WHEN '2025-07-08' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-08'::date, 60) ELSE NULL END,
  '700164068036',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-08'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO. 11/RAMIRIQUI'
WHERE cv.placa = 'KJC07F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-08',
  '2025-07-08',
  CASE WHEN '2025-07-08' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-08'::date, 60) ELSE NULL END,
  '700164056641',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-08'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'IOP793'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-07',
  '2025-07-07',
  CASE WHEN '2025-07-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-07'::date, 60) ELSE NULL END,
  '700164071803',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTO CALI'
WHERE cv.placa = 'MC050791'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-07',
  '2025-07-07',
  CASE WHEN '2025-07-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-07'::date, 60) ELSE NULL END,
  '700164054276',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'ABG56E'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-07',
  '2025-07-07',
  CASE WHEN '2025-07-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-07'::date, 60) ELSE NULL END,
  '700164068036',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO. 11/RAMIRIQUI'
WHERE cv.placa = 'UVK954'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-20',
  '2025-05-20',
  CASE WHEN '2025-05-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-20'::date, 60) ELSE NULL END,
  '700164056641',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'FZY13F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-08',
  '2025-07-08',
  CASE WHEN '2025-07-08' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-08'::date, 60) ELSE NULL END,
  '700164065617',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-08'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYMOV CUND/CHIPAQUE'
WHERE cv.placa = 'WDT536'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-07',
  '2025-07-07',
  CASE WHEN '2025-07-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-07'::date, 60) ELSE NULL END,
  '700164063693',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'IOP892'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-08',
  '2025-07-08',
  CASE WHEN '2025-07-08' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-08'::date, 60) ELSE NULL END,
  '700164064141',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-08'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'UND MCPAL TTOYTTE PALERMO'
WHERE cv.placa = 'KST391'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-07',
  '2025-07-07',
  CASE WHEN '2025-07-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-07'::date, 60) ELSE NULL END,
  '700164067556',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MCPAL ARMENIA'
WHERE cv.placa = 'DBV484'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-07',
  '2025-07-07',
  CASE WHEN '2025-07-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-07'::date, 60) ELSE NULL END,
  '700164053697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO 1/COMBITA'
WHERE cv.placa = 'JOM555'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-07',
  '2025-07-07',
  CASE WHEN '2025-07-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-07'::date, 60) ELSE NULL END,
  '700164056641',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'CQZ395'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-05',
  '2025-07-05',
  CASE WHEN '2025-07-05' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-05'::date, 60) ELSE NULL END,
  '700164058140',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-05'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DEL MUNICIPIO DE MOSQUERA'
WHERE cv.placa = 'JOL235'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700164067035',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DE MANIZALES'
WHERE cv.placa = 'AVF31H'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700164049739',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'GPR04D'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700164064933',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL LA PAZ'
WHERE cv.placa = 'UVL834'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700164051900',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL PAIPA'
WHERE cv.placa = 'HZZ831'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700164051495',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTOYTTE TOLIMA/GUAYABAL'
WHERE cv.placa = 'CQZ914'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700164049162',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE DPTAL TANGUA/NARIÑO'
WHERE cv.placa = 'IBZ892'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700164050463',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST DPTAL TTOYTTE  META/RESTREPO'
WHERE cv.placa = 'CRK486'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-12',
  '2025-07-12',
  CASE WHEN '2025-07-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-12'::date, 60) ELSE NULL END,
  '700167248020',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FRESNO'
WHERE cv.placa = 'HZZ688'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-12',
  '2025-07-12',
  CASE WHEN '2025-07-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-12'::date, 60) ELSE NULL END,
  '700164059503',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTOYTTE MCPAL PASTO'
WHERE cv.placa = 'IOP487'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-12',
  '2025-07-12',
  CASE WHEN '2025-07-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-12'::date, 60) ELSE NULL END,
  '700164051900',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL PAIPA'
WHERE cv.placa = '012ABP'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-12',
  '2025-07-12',
  CASE WHEN '2025-07-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-12'::date, 60) ELSE NULL END,
  '700164049739',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'FXL569'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-12',
  '2025-07-12',
  CASE WHEN '2025-07-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-12'::date, 60) ELSE NULL END,
  '700164063693',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'UNO70F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-12',
  '2025-07-12',
  CASE WHEN '2025-07-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-12'::date, 60) ELSE NULL END,
  '700164063693',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'WMM37G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-12',
  '2025-07-12',
  CASE WHEN '2025-07-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-12'::date, 60) ELSE NULL END,
  '700164074224',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL NARIÑO'
WHERE cv.placa = 'IOQ214'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-12',
  '2025-07-12',
  CASE WHEN '2025-07-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-12'::date, 60) ELSE NULL END,
  '700164058140',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DEL MUNICIPIO DE MOSQUERA'
WHERE cv.placa = 'UVL736'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-12',
  '2025-07-12',
  CASE WHEN '2025-07-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-12'::date, 60) ELSE NULL END,
  '700164056641',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'MXX497'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700164066492',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE IBAGUE'
WHERE cv.placa = 'IOP989'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700164066492',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE IBAGUE'
WHERE cv.placa = 'MXW930'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700165615785',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INSP TTOYTTE CALARCA'
WHERE cv.placa = 'IOQ275'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700164067035',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DE MANIZALES'
WHERE cv.placa = 'SPV32D'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700164067035',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DE MANIZALES'
WHERE cv.placa = 'SPO19D'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-14',
  '2025-07-14',
  CASE WHEN '2025-07-14' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-14'::date, 60) ELSE NULL END,
  '700164049739',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-14'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'SPL75D'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700164056641',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'UVK203'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700164057435',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MCPAL DE SAN SEBASTIAN DE MARIQUITA TOLIMA'
WHERE cv.placa = 'JJZ018'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-12',
  '2025-07-12',
  CASE WHEN '2025-07-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-12'::date, 60) ELSE NULL END,
  '700164052275',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO MCPAL SANTA FE ANTIOQUIA'
WHERE cv.placa = 'KSU776'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700164050819',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE FLORIDABLANCA'
WHERE cv.placa = 'MXX007'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700164067556',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MCPAL ARMENIA'
WHERE cv.placa = 'GUA46E'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700164062742',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL VILLAVICENCIO'
WHERE cv.placa = 'IOQ194'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700168060827',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  '2025251884 OFICIO | SE PY OF PARA REENVIO DE CARPETA CON LA CORRECCION EN RUNT',
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MEDELLIN'
WHERE cv.placa = 'VOS52A'
AND mc.key = 'admin_id';

-- OMITIDO (sin fecha_tramite): WDT246

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-16',
  '2025-07-16',
  CASE WHEN '2025-07-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-16'::date, 60) ELSE NULL END,
  '700164054276',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'DSO480'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-19',
  '2025-07-19',
  CASE WHEN '2025-07-19' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-19'::date, 60) ELSE NULL END,
  '700164050463',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-19'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST DPTAL TTOYTTE  META/RESTREPO'
WHERE cv.placa = 'MXW777'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-19',
  '2025-07-19',
  CASE WHEN '2025-07-19' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-19'::date, 60) ELSE NULL END,
  '700164073586',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-19'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE DEL MUNICIPIO DE LOS PATIOS'
WHERE cv.placa = 'MXX561'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-19',
  '2025-07-19',
  CASE WHEN '2025-07-19' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-19'::date, 60) ELSE NULL END,
  '700164059503',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-19'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTOYTTE MCPAL PASTO'
WHERE cv.placa = 'UOH81F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-19',
  '2025-07-19',
  CASE WHEN '2025-07-19' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-19'::date, 60) ELSE NULL END,
  '700164063693',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-19'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'IAM235'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-19',
  '2025-07-19',
  CASE WHEN '2025-07-19' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-19'::date, 60) ELSE NULL END,
  '700164055142',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-19'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE CAUCASIA'
WHERE cv.placa = 'FDJ93H'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-19',
  '2025-07-19',
  CASE WHEN '2025-07-19' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-19'::date, 60) ELSE NULL END,
  '700164072697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-19'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE TUNJA'
WHERE cv.placa = 'HXX983'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-19',
  '2025-07-19',
  CASE WHEN '2025-07-19' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-19'::date, 60) ELSE NULL END,
  '700164055733',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-19'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL SAN JOSE GUAVIARE'
WHERE cv.placa = 'WDT668'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165618820',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYMOV CUND/VILLETA'
WHERE cv.placa = 'PSS53F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165619195',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'DYM101'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165620158',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST MCPAL TTOYTTE AGUACHICA'
WHERE cv.placa = 'DSP160'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165616341',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MOVYTTE DPTAL VALLE DEL CAUCA/ALCALA'
WHERE cv.placa = 'AUW29H'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165626756',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DE MOVILIDAD DE NEIVA'
WHERE cv.placa = 'MXW078'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165617960',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INSTITUTO DE TRANSPORTES Y TRÁNSITO DEL HUILA/RIVERA'
WHERE cv.placa = 'DSO965'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165625267',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL DE MADRID'
WHERE cv.placa = 'KSU268'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165626179',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE MOVILIDAD MPAL FUSAGASUGA'
WHERE cv.placa = 'KSU076'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165622405',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE CAUCASIA'
WHERE cv.placa = 'FDM46H'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165621448',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL DE SOACHA'
WHERE cv.placa = 'IOQ146'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165620969',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO ENVIGADO'
WHERE cv.placa = 'KSU748'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165620541',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE DEL MCPIO DE MARINILLA'
WHERE cv.placa = 'MXW165'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-09',
  '2025-07-09',
  CASE WHEN '2025-07-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-09'::date, 60) ELSE NULL END,
  '700165618403',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'KSU224'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165617118',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'NMV41D'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165619706',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL SABANETA'
WHERE cv.placa = 'KSU378'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165623827',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'IOQ114'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165625699',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE CARTAGO'
WHERE cv.placa = 'ESE68G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165617118',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'CQZ177'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165626179',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE MOVILIDAD MPAL FUSAGASUGA'
WHERE cv.placa = 'UOK30F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165624508',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO MCPAL CALDAS/ANTIOQUIA'
WHERE cv.placa = 'DSP663'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165623229',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL POPAYAN'
WHERE cv.placa = 'JRI73G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165615785',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INSP TTOYTTE CALARCA'
WHERE cv.placa = 'DSP875'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165621949',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE IBAGUE'
WHERE cv.placa = 'IOP894'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165623827',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'IAN170'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-24',
  '2025-07-24',
  CASE WHEN '2025-07-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-24'::date, 60) ELSE NULL END,
  '700165624882',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL VILLAVICENCIO'
WHERE cv.placa = 'FWY534'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-22',
  '2025-08-22',
  CASE WHEN '2025-08-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-22'::date, 60) ELSE NULL END,
  '700167247200',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL DE SOACHA'
WHERE cv.placa = 'LDA16H'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-21',
  '2025-08-21',
  CASE WHEN '2025-08-21' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-21'::date, 60) ELSE NULL END,
  '700167242982',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-21'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INSTITUTO DE TRANSPORTES Y TRÁNSITO DEL HUILA/RIVERA'
WHERE cv.placa = 'EUS627'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-23',
  '2025-08-23',
  CASE WHEN '2025-08-23' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-23'::date, 60) ELSE NULL END,
  '700167245631',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-23'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO. 7/SOATA'
WHERE cv.placa = 'DYM953'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-22',
  '2025-08-22',
  CASE WHEN '2025-08-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-22'::date, 60) ELSE NULL END,
  '700167247604',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DE MANIZALES'
WHERE cv.placa = 'FXL980'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-21',
  '2025-08-21',
  CASE WHEN '2025-08-21' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-21'::date, 60) ELSE NULL END,
  '760005608388',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-21'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'UOI14F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-07-29',
  '2025-07-29',
  CASE WHEN '2025-07-29' IS NOT NULL THEN public.sumar_dias_habiles('2025-07-29'::date, 60) ELSE NULL END,
  '700165618403',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-07-29'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'MXW783'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-22',
  '2025-08-22',
  CASE WHEN '2025-08-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-22'::date, 60) ELSE NULL END,
  '700167241647',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'CRK442'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-23',
  '2025-02-23',
  CASE WHEN '2025-02-23' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-23'::date, 60) ELSE NULL END,
  '700167242001',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-23'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE FLORIDABLANCA'
WHERE cv.placa = 'IOP687'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-21',
  '2025-08-21',
  CASE WHEN '2025-08-21' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-21'::date, 60) ELSE NULL END,
  '700167248992',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-21'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYMOV CUND/CHIPAQUE'
WHERE cv.placa = 'FXL839'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-22',
  '2025-08-22',
  CASE WHEN '2025-08-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-22'::date, 60) ELSE NULL END,
  '700167250723',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'IOQ236'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-23',
  '2025-08-23',
  CASE WHEN '2025-08-23' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-23'::date, 60) ELSE NULL END,
  '700167250378',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-23'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE DUITAMA'
WHERE cv.placa = 'FWY981'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-22',
  '2025-08-22',
  CASE WHEN '2025-08-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-22'::date, 60) ELSE NULL END,
  '700167244221',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE DE CERETE'
WHERE cv.placa = 'UVM002'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-22',
  '2025-08-22',
  CASE WHEN '2025-08-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-22'::date, 60) ELSE NULL END,
  '700167251059',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'INZ643'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-22',
  '2025-08-22',
  CASE WHEN '2025-08-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-22'::date, 60) ELSE NULL END,
  '760005608388-700167241647',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  'SE FUE EN DOS ENVIOS',
  mc.val,
  COALESCE('2025-08-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'CQZ414'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-22',
  '2025-08-22',
  CASE WHEN '2025-08-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-22'::date, 60) ELSE NULL END,
  '700167246402',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA GOB TTOYTTE MELGAR'
WHERE cv.placa = 'OSE807'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-22',
  '2025-08-22',
  CASE WHEN '2025-08-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-22'::date, 60) ELSE NULL END,
  '700167245920',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'WDT658'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-22',
  '2025-08-22',
  CASE WHEN '2025-08-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-22'::date, 60) ELSE NULL END,
  '700167246861',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST DE TTO SANTA ROSA DE VITERBO'
WHERE cv.placa = 'IOP237'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-22',
  '2025-08-22',
  CASE WHEN '2025-08-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-22'::date, 60) ELSE NULL END,
  '700167250378',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE DUITAMA'
WHERE cv.placa = 'JOM104'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-05-22',
  '2025-05-22',
  CASE WHEN '2025-05-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-05-22'::date, 60) ELSE NULL END,
  '700167250074',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-05-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL UBATE'
WHERE cv.placa = 'MXW190'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-22',
  '2025-08-22',
  CASE WHEN '2025-08-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-22'::date, 60) ELSE NULL END,
  '700167249628',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE  ARAUCA/ARAUCA'
WHERE cv.placa = 'JOL890'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-21',
  '2025-08-21',
  CASE WHEN '2025-08-21' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-21'::date, 60) ELSE NULL END,
  '700167248434',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-21'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO. 10/VILLA DE LEYVA'
WHERE cv.placa = 'LZQ018'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-21',
  '2025-08-21',
  CASE WHEN '2025-08-21' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-21'::date, 60) ELSE NULL END,
  '700167243814',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-21'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE YUMBO'
WHERE cv.placa = 'MXW743'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-02-21',
  '2025-02-21',
  CASE WHEN '2025-02-21' IS NOT NULL THEN public.sumar_dias_habiles('2025-02-21'::date, 60) ELSE NULL END,
  '700167241647',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-02-21'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'IAM042'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-21',
  '2025-08-21',
  CASE WHEN '2025-08-21' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-21'::date, 60) ELSE NULL END,
  '700167243505',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-21'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO COPACABANA'
WHERE cv.placa = 'FWY941'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-22',
  '2025-08-22',
  CASE WHEN '2025-08-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-22'::date, 60) ELSE NULL END,
  '700167244790',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL PIENDAMO'
WHERE cv.placa = 'TFQ283'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-22',
  '2025-08-22',
  CASE WHEN '2025-08-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-22'::date, 60) ELSE NULL END,
  '700167251059',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'CRK192'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-22',
  '2025-08-22',
  CASE WHEN '2025-08-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-22'::date, 60) ELSE NULL END,
  '700167243278',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL VILLAVICENCIO'
WHERE cv.placa = 'KST839'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-22',
  '2025-08-22',
  CASE WHEN '2025-08-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-22'::date, 60) ELSE NULL END,
  '700167247604',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DE MANIZALES'
WHERE cv.placa = 'SQE58D'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-22',
  '2025-08-22',
  CASE WHEN '2025-08-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-22'::date, 60) ELSE NULL END,
  '700167249345',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DEL MUNICIPIO DE MOSQUERA'
WHERE cv.placa = 'UVL698'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-17',
  '2025-09-17',
  CASE WHEN '2025-09-17' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-17'::date, 60) ELSE NULL END,
  '700170021142',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-17'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEY MOV CUND/SIBATE'
WHERE cv.placa = 'JRO98G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-15',
  '2025-09-15',
  CASE WHEN '2025-09-15' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-15'::date, 60) ELSE NULL END,
  '700170023463',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-15'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'MC749846'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-15',
  '2025-09-15',
  CASE WHEN '2025-09-15' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-15'::date, 60) ELSE NULL END,
  '700170026038',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-15'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL DE SOACHA'
WHERE cv.placa = 'BHP09F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-15',
  '2025-09-15',
  CASE WHEN '2025-09-15' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-15'::date, 60) ELSE NULL END,
  '700170022208',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-15'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'KST447'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-16',
  '2025-09-16',
  CASE WHEN '2025-09-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-16'::date, 60) ELSE NULL END,
  '700170023463',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'JOL097'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-15',
  '2025-09-15',
  CASE WHEN '2025-09-15' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-15'::date, 60) ELSE NULL END,
  '700170022208',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-15'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'MXW856'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-15',
  '2025-09-15',
  CASE WHEN '2025-09-15' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-15'::date, 60) ELSE NULL END,
  '700170025227',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-15'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MCPAL DE SAN SEBASTIAN DE MARIQUITA TOLIMA'
WHERE cv.placa = 'MC039947'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-16',
  '2025-09-16',
  CASE WHEN '2025-09-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-16'::date, 60) ELSE NULL END,
  '700170024970',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTOYTTE TOLIMA/PURIFICACIÓN'
WHERE cv.placa = 'IOQ168'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-16',
  '2025-09-16',
  CASE WHEN '2025-09-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-16'::date, 60) ELSE NULL END,
  '700170023653',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL LA ESTRELLA'
WHERE cv.placa = 'RRX94G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-25',
  '2025-08-25',
  CASE WHEN '2025-08-25' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-25'::date, 60) ELSE NULL END,
  '700167241647',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-25'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'HZZ589'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-08-25',
  '2025-08-25',
  CASE WHEN '2025-08-25' IS NOT NULL THEN public.sumar_dias_habiles('2025-08-25'::date, 60) ELSE NULL END,
  '700167242337',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-08-25'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYMOV CUND/CHOCONTA'
WHERE cv.placa = 'UVM651'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-16',
  '2025-09-16',
  CASE WHEN '2025-09-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-16'::date, 60) ELSE NULL END,
  '700170025655',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'DSO596'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-16',
  '2025-09-16',
  CASE WHEN '2025-09-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-16'::date, 60) ELSE NULL END,
  '700170021916',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO. 11/RAMIRIQUI'
WHERE cv.placa = 'FWY700'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-16',
  '2025-09-16',
  CASE WHEN '2025-09-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-16'::date, 60) ELSE NULL END,
  '700170023826',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE DUITAMA'
WHERE cv.placa = 'IAM861'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-17',
  '2025-09-17',
  CASE WHEN '2025-09-17' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-17'::date, 60) ELSE NULL END,
  '700170021356',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-17'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE DPTAL CAQUETA/BELEN DE LOS ANDAQUIES'
WHERE cv.placa = 'FXM194'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-15',
  '2025-09-15',
  CASE WHEN '2025-09-15' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-15'::date, 60) ELSE NULL END,
  '700170022976',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-15'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYMOV CUND/CHIPAQUE'
WHERE cv.placa = 'UVM183'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-16',
  '2025-09-16',
  CASE WHEN '2025-09-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-16'::date, 60) ELSE NULL END,
  '700170023463',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'MXW995'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-15',
  '2025-09-15',
  CASE WHEN '2025-09-15' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-15'::date, 60) ELSE NULL END,
  '700170024426',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-15'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE TUNJA'
WHERE cv.placa = 'JOL364'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-16',
  '2025-09-16',
  CASE WHEN '2025-09-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-16'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  'PENDIENTE REVISAR DEVUELTA A ARCHIVO',
  mc.val,
  COALESCE('2025-09-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'UND TTO CALDAS/ARANZAZU'
WHERE cv.placa = 'UYK365'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-15',
  '2025-09-15',
  CASE WHEN '2025-09-15' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-15'::date, 60) ELSE NULL END,
  '700170024269',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-15'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MEDELLIN'
WHERE cv.placa = 'MXW899'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-16',
  '2025-09-16',
  CASE WHEN '2025-09-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-16'::date, 60) ELSE NULL END,
  '700170021643',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO 1/COMBITA'
WHERE cv.placa = 'CRK547'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-15',
  '2025-09-15',
  CASE WHEN '2025-09-15' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-15'::date, 60) ELSE NULL END,
  '700170026318',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-15'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE MOVILIDAD MPAL FUSAGASUGA'
WHERE cv.placa = 'DSP976'
AND mc.key = 'admin_id';

-- OMITIDO (sin fecha_tramite): UVL619

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-16',
  '2025-09-16',
  CASE WHEN '2025-09-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-16'::date, 60) ELSE NULL END,
  '700170025410',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MOVYTTE DPTAL VALLE DEL CAUCA/ALCALA'
WHERE cv.placa = '2025-09-23 00:00:00'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-16',
  '2025-09-16',
  CASE WHEN '2025-09-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-16'::date, 60) ELSE NULL END,
  '700170026176',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEY MOV CUND/CAQUEZA'
WHERE cv.placa = 'WDU154'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-17',
  '2025-09-17',
  CASE WHEN '2025-09-17' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-17'::date, 60) ELSE NULL END,
  '700170022208',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-17'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'IAM585'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-17',
  '2025-09-17',
  CASE WHEN '2025-09-17' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-17'::date, 60) ELSE NULL END,
  '700170020797',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-17'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SUBSTRIA TTOYTTE DPTAL NARIÑO/SANDONA'
WHERE cv.placa = 'WDT589'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-16',
  '2025-09-16',
  CASE WHEN '2025-09-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-16'::date, 60) ELSE NULL END,
  '700170024610',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO ENVIGADO'
WHERE cv.placa = 'JOM402'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-16',
  '2025-09-16',
  CASE WHEN '2025-09-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-16'::date, 60) ELSE NULL END,
  '700170020234',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTEYTTO SINCELEJO'
WHERE cv.placa = 'IAN067'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-17',
  '2025-09-17',
  CASE WHEN '2025-09-17' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-17'::date, 60) ELSE NULL END,
  '700170020529',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-17'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST DPTAL DE TTO QUINDIO/CIRCASIA'
WHERE cv.placa = 'MC156497'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-16',
  '2025-09-16',
  CASE WHEN '2025-09-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-16'::date, 60) ELSE NULL END,
  '700170025655',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'FXL085'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-17',
  '2025-09-17',
  CASE WHEN '2025-09-17' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-17'::date, 60) ELSE NULL END,
  '700170024091',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-17'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'FZF54F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-17',
  '2025-09-17',
  CASE WHEN '2025-09-17' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-17'::date, 60) ELSE NULL END,
  '700170024807',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-17'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE HONDA'
WHERE cv.placa = 'GPD84D'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-16',
  '2025-09-16',
  CASE WHEN '2025-09-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-16'::date, 60) ELSE NULL END,
  '700170022208',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'AAN03E'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-16',
  '2025-09-16',
  CASE WHEN '2025-09-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-16'::date, 60) ELSE NULL END,
  '700170025809',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTO CALI'
WHERE cv.placa = 'JOM569'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-09-17',
  '2025-09-17',
  CASE WHEN '2025-09-17' IS NOT NULL THEN public.sumar_dias_habiles('2025-09-17'::date, 60) ELSE NULL END,
  '700170025655',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-09-17'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'IOQ053'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-06',
  '2025-10-06',
  CASE WHEN '2025-10-06' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-06'::date, 60) ELSE NULL END,
  '700171188980',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-06'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO 1/COMBITA'
WHERE cv.placa = 'DYM645'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-01',
  '2025-10-01',
  CASE WHEN '2025-10-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-01'::date, 60) ELSE NULL END,
  '700171193549',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MCPAL ARMENIA'
WHERE cv.placa = 'KSU696'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-01',
  '2025-10-01',
  CASE WHEN '2025-10-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-01'::date, 60) ELSE NULL END,
  '700171194970',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE DPTAL TANGUA/NARIÑO'
WHERE cv.placa = 'JOL883'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171626362',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'JOL427'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-01',
  '2025-10-01',
  CASE WHEN '2025-10-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-01'::date, 60) ELSE NULL END,
  '700171189944',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE IBAGUE'
WHERE cv.placa = 'BBU529'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-01',
  '2025-10-01',
  CASE WHEN '2025-10-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-01'::date, 60) ELSE NULL END,
  '700171195410',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTEYTTO APARTADO'
WHERE cv.placa = 'PSI13F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-01',
  '2025-10-01',
  CASE WHEN '2025-10-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-01'::date, 60) ELSE NULL END,
  '700171190882',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INSTITUTO DE TRANSPORTES Y TRÁNSITO DEL HUILA/RIVERA'
WHERE cv.placa = 'IAM335'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-01',
  '2025-10-01',
  CASE WHEN '2025-10-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-01'::date, 60) ELSE NULL END,
  '700171194460',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST DPTAL TTOYTTE  META/RESTREPO'
WHERE cv.placa = 'IOQ030'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-01',
  '2025-10-01',
  CASE WHEN '2025-10-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-01'::date, 60) ELSE NULL END,
  '700171194111',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL UBATE'
WHERE cv.placa = 'UVL345'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-01',
  '2025-10-01',
  CASE WHEN '2025-10-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-01'::date, 60) ELSE NULL END,
  '700171197130',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL SABANETA'
WHERE cv.placa = 'KSU518'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-01',
  '2025-10-01',
  CASE WHEN '2025-10-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-01'::date, 60) ELSE NULL END,
  '700171195786',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DE  MOVILIDAD MUNICIPAL DE CHIA'
WHERE cv.placa = 'PSD33F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-01',
  '2025-10-01',
  CASE WHEN '2025-10-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-01'::date, 60) ELSE NULL END,
  '700171191276',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL LA PAZ'
WHERE cv.placa = 'UVM728'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-01',
  '2025-10-01',
  CASE WHEN '2025-10-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-01'::date, 60) ELSE NULL END,
  '700171188632',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEY MOV CUND/SIBATE'
WHERE cv.placa = 'MXX153'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-01',
  '2025-10-01',
  CASE WHEN '2025-10-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-01'::date, 60) ELSE NULL END,
  '700171190303',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO COPACABANA'
WHERE cv.placa = 'TFQ281'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-01',
  '2025-10-01',
  CASE WHEN '2025-10-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-01'::date, 60) ELSE NULL END,
  '700171197921',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FUNZA'
WHERE cv.placa = 'WDT691'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-01',
  '2025-10-01',
  CASE WHEN '2025-10-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-01'::date, 60) ELSE NULL END,
  '700171197921',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FUNZA'
WHERE cv.placa = 'CRK353'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171625163',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO 1/COMBITA'
WHERE cv.placa = 'LZQ522'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-03',
  '2025-10-03',
  CASE WHEN '2025-10-03' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-03'::date, 60) ELSE NULL END,
  '700171189604',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-03'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'MXX338'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-03',
  '2025-10-03',
  CASE WHEN '2025-10-03' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-03'::date, 60) ELSE NULL END,
  '700171196756',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-03'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DEL MUNICIPIO DE MOSQUERA'
WHERE cv.placa = 'FWY713'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-03',
  '2025-10-03',
  CASE WHEN '2025-10-03' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-03'::date, 60) ELSE NULL END,
  '700175308587',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-03'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYMOV CUND/CHIPAQUE'
WHERE cv.placa = 'DYM846'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-03',
  '2025-10-03',
  CASE WHEN '2025-10-03' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-03'::date, 60) ELSE NULL END,
  '700171189604',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-03'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'DSP606'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-03',
  '2025-10-03',
  CASE WHEN '2025-10-03' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-03'::date, 60) ELSE NULL END,
  '700171196355',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-03'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE CARTAGO'
WHERE cv.placa = 'PCM09E'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-03',
  '2025-10-03',
  CASE WHEN '2025-10-03' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-03'::date, 60) ELSE NULL END,
  '700171192234',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-03'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DE MANIZALES'
WHERE cv.placa = 'WDU038'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-03',
  '2025-10-03',
  CASE WHEN '2025-10-03' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-03'::date, 60) ELSE NULL END,
  '700171197130',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-03'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL SABANETA'
WHERE cv.placa = 'LZQ367'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-03',
  '2025-10-03',
  CASE WHEN '2025-10-03' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-03'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  'NO SE REALIZA ENVIO',
  mc.val,
  COALESCE('2025-10-03'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTO CALI'
WHERE cv.placa = 'CQZ607'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-06',
  '2025-10-06',
  CASE WHEN '2025-10-06' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-06'::date, 60) ELSE NULL END,
  '700171189604',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-06'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'ABP073'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-03',
  '2025-10-03',
  CASE WHEN '2025-10-03' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-03'::date, 60) ELSE NULL END,
  '700171189604',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-03'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'VPU19A'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-06',
  '2025-10-06',
  CASE WHEN '2025-10-06' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-06'::date, 60) ELSE NULL END,
  '700171189604',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-06'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'LZQ462'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-03',
  '2025-10-03',
  CASE WHEN '2025-10-03' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-03'::date, 60) ELSE NULL END,
  '700171197921',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-03'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FUNZA'
WHERE cv.placa = 'IOP583'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-03',
  '2025-10-03',
  CASE WHEN '2025-10-03' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-03'::date, 60) ELSE NULL END,
  '700171191696',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-03'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO ANSERMA'
WHERE cv.placa = 'IOP658'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-03',
  '2025-10-03',
  CASE WHEN '2025-10-03' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-03'::date, 60) ELSE NULL END,
  '700171196756',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-03'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DEL MUNICIPIO DE MOSQUERA'
WHERE cv.placa = 'FWY841'
AND mc.key = 'admin_id';

-- OMITIDO (sin fecha_tramite): IOP288

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171624373',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE PALMIRA'
WHERE cv.placa = 'MXW246'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171623800',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTO Y GOB MCPAL SANTA ROSA CABAL'
WHERE cv.placa = 'IOP285'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171624142',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE IBAGUE'
WHERE cv.placa = 'ZVJ23F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171625020',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE DEL MUNICIPIO DE LOS PATIOS'
WHERE cv.placa = 'QFV750'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171623800',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTO Y GOB MCPAL SANTA ROSA CABAL'
WHERE cv.placa = 'UVL060'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171624879',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE  ARAUCA/ARAUCA'
WHERE cv.placa = 'KSU896'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171623916',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL PRADERA'
WHERE cv.placa = 'LDA67H'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171624776',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL UBATE'
WHERE cv.placa = 'IOP568'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171624482',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE DUITAMA'
WHERE cv.placa = 'FZR63F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171625413',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTEYTTO SINCELEJO'
WHERE cv.placa = 'KST221'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171624142',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE IBAGUE'
WHERE cv.placa = 'INZ621'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171625609',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL VILLAVICENCIO'
WHERE cv.placa = 'KSU332'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171625930',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL BARICHARA/SANTANDER'
WHERE cv.placa = 'CSN996'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171626081',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO BELLO'
WHERE cv.placa = 'UVL820'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171626217',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST DPTAL TTOYTTE  META/RESTREPO'
WHERE cv.placa = 'IOQ286'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171626362',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'DSP885'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-09',
  '2025-10-09',
  CASE WHEN '2025-10-09' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-09'::date, 60) ELSE NULL END,
  '700171625312',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL GIRARDOT'
WHERE cv.placa = 'JRP54G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '700172950170',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTOYTTE TOLIMA/ ALVARADO'
WHERE cv.placa = 'WMC84G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '700175308587',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYMOV CUND/CHIPAQUE'
WHERE cv.placa = 'UVL669'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '700172960059',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'DSO408'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '700172955432',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INSTITUTO DE MOVILIDAD DE PEREIRA'
WHERE cv.placa = 'JOM431'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '700172958276',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL NARIÑO'
WHERE cv.placa = 'DSP037'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '700172955071',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO MCPAL SANTA FE ANTIOQUIA'
WHERE cv.placa = 'KIF24F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '700172951305',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO ENVIGADO'
WHERE cv.placa = 'EGQ11C'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '700172954820',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FUNZA'
WHERE cv.placa = 'MXW333'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '700172951556',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL SABANETA'
WHERE cv.placa = 'MXX003'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-22',
  '2025-10-22',
  CASE WHEN '2025-10-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-22'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  'NO ES REALIZA ENVIO',
  mc.val,
  COALESCE('2025-10-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYMOV CUND/CHIPAQUE'
WHERE cv.placa = 'FKL465'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '700172954474',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL JAMUNDI'
WHERE cv.placa = 'MXW084'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '700172962655',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'AAO60E'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '700172951305',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO ENVIGADO'
WHERE cv.placa = 'DSQ031'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '700172959381',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DE TRANSPORTE Y MOVILIDAD DE ZIPAQUIRA'
WHERE cv.placa = 'IAM566'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '9186240901',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DE  MOVILIDAD MUNICIPAL DE CHIA'
WHERE cv.placa = 'LZQ104'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '9186240901',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DE  MOVILIDAD MUNICIPAL DE CHIA'
WHERE cv.placa = 'KST304'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '700172962655',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'IOQ199'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '700172949866',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DEL MUNICIPIO DE MOSQUERA'
WHERE cv.placa = 'MXW709'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '9186240902',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYMOV CUND/CHIPAQUE'
WHERE cv.placa = 'IOP087'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '700172962655',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'LZQ370'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '700172954820',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL FUNZA'
WHERE cv.placa = 'KSU026'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-20',
  '2025-10-20',
  CASE WHEN '2025-10-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-20'::date, 60) ELSE NULL END,
  '700172952765',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO. 2/ NOBSA'
WHERE cv.placa = 'UVM526'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-22',
  '2025-10-22',
  CASE WHEN '2025-10-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-22'::date, 60) ELSE NULL END,
  '700172962068',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTEYTTO VILLA DEL ROSARIO'
WHERE cv.placa = 'JDP168'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-22',
  '2025-10-22',
  CASE WHEN '2025-10-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-22'::date, 60) ELSE NULL END,
  '700172962655',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'DYM280'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-22',
  '2025-10-22',
  CASE WHEN '2025-10-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-22'::date, 60) ELSE NULL END,
  '700172954084',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYMOV CUND/CHOCONTA'
WHERE cv.placa = 'UVL892'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-22',
  '2025-10-22',
  CASE WHEN '2025-10-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-22'::date, 60) ELSE NULL END,
  '700172950491',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DE MANIZALES'
WHERE cv.placa = 'DSO963'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-22',
  '2025-10-22',
  CASE WHEN '2025-10-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-22'::date, 60) ELSE NULL END,
  '700172962655',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'KSU984'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-22',
  '2025-10-22',
  CASE WHEN '2025-10-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-22'::date, 60) ELSE NULL END,
  '700172961876',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'UND MCPAL TTOYTTE PALERMO'
WHERE cv.placa = 'DSO739'
AND mc.key = 'admin_id';

-- OMITIDO (sin fecha_tramite): TFV691

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-22',
  '2025-10-22',
  CASE WHEN '2025-10-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-22'::date, 60) ELSE NULL END,
  '700172961426',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE DE PITALITO - INTRAPITALITO'
WHERE cv.placa = 'UNW91F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-22',
  '2025-10-22',
  CASE WHEN '2025-10-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-22'::date, 60) ELSE NULL END,
  '700172962655',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'HZZ958'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-10-11',
  '2025-10-11',
  CASE WHEN '2025-10-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-10-11'::date, 60) ELSE NULL END,
  '700175321754',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-10-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'UVL261'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-11',
  '2025-11-11',
  CASE WHEN '2025-11-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-11'::date, 60) ELSE NULL END,
  '700175319467',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYMOV CUND/CHOCONTA'
WHERE cv.placa = 'UVL161'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175321754',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'IAM043'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175320164',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INSP TTOYTTE CALARCA'
WHERE cv.placa = 'GPC93D'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-11',
  '2025-11-11',
  CASE WHEN '2025-11-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-11'::date, 60) ELSE NULL END,
  '700175312419',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST DPTAL TTOYTTE  META/RESTREPO'
WHERE cv.placa = 'LZQ314'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-11',
  '2025-11-11',
  CASE WHEN '2025-11-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-11'::date, 60) ELSE NULL END,
  '700175315457',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MOVYTTE DPTAL VALLE DEL CAUCA/ALCALA'
WHERE cv.placa = 'PIT58H'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-11',
  '2025-11-11',
  CASE WHEN '2025-11-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-11'::date, 60) ELSE NULL END,
  '700175309497',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYMOV CUND/EL ROSAL'
WHERE cv.placa = 'FXM198'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175321754',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'IAM156'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175322155',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE DUITAMA'
WHERE cv.placa = 'IOP397'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175322155',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE DUITAMA'
WHERE cv.placa = 'UVL661'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175318470',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DE MANIZALES'
WHERE cv.placa = 'KST414'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175315939',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE DE PITALITO - INTRAPITALITO'
WHERE cv.placa = 'CQZ108'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-11',
  '2025-11-11',
  CASE WHEN '2025-11-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-11'::date, 60) ELSE NULL END,
  '700175322155',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE DUITAMA'
WHERE cv.placa = 'CQZ362'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175312994',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'ZVG39F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175309883',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL PRADERA'
WHERE cv.placa = 'FDG85H'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175318015',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'TRÁNSITO DPTAL NARIÑO/YACUANQUER'
WHERE cv.placa = 'CQZ424'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175317582',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST DE TTO SANTA ROSA DE VITERBO'
WHERE cv.placa = 'VZC73E'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175320550',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST DPTAL TTOYTTE  META/RESTREPO'
WHERE cv.placa = 'INZ966'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-11',
  '2025-11-11',
  CASE WHEN '2025-11-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-11'::date, 60) ELSE NULL END,
  '700175321080',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTEYTTO MONTERIA'
WHERE cv.placa = 'WDT618'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175313489',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTOYTTE TOLIMA/ORTEGA'
WHERE cv.placa = 'KIY36F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175313922',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE MOVILIDAD MPAL FUSAGASUGA'
WHERE cv.placa = 'MXW539'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-11',
  '2025-11-11',
  CASE WHEN '2025-11-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-11'::date, 60) ELSE NULL END,
  '700175321754',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'MXW516'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-11',
  '2025-11-11',
  CASE WHEN '2025-11-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-11'::date, 60) ELSE NULL END,
  '700175310583',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE FLORIDABLANCA'
WHERE cv.placa = 'IAM631'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175319024',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL SAN JOSE GUAVIARE'
WHERE cv.placa = 'WDT667'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-11',
  '2025-11-11',
  CASE WHEN '2025-11-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-11'::date, 60) ELSE NULL END,
  '700175314779',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO. 9/MIRAFLORES'
WHERE cv.placa = 'WDT435'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175318470',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DE MANIZALES'
WHERE cv.placa = 'MXX479'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '9186240904',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTO CALI'
WHERE cv.placa = 'FWY936'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-11',
  '2025-11-11',
  CASE WHEN '2025-11-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-11'::date, 60) ELSE NULL END,
  '700175321754',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'CQZ722'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-11',
  '2025-11-11',
  CASE WHEN '2025-11-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-11'::date, 60) ELSE NULL END,
  '700175321754',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'BHX36F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-11',
  '2025-11-11',
  CASE WHEN '2025-11-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-11'::date, 60) ELSE NULL END,
  '700175312994',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'FXL736'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175316404',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE DPTAL CAQUETA/BELEN DE LOS ANDAQUIES'
WHERE cv.placa = 'DSQ027'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-11',
  '2025-11-11',
  CASE WHEN '2025-11-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-11'::date, 60) ELSE NULL END,
  '700175311864',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO ENVIGADO'
WHERE cv.placa = 'JOL782'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180008048',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL VILLAVICENCIO'
WHERE cv.placa = 'AUU78H'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180008930',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'KSU017'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180003328',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE DUITAMA'
WHERE cv.placa = 'KSU459'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180002693',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MCPAL ARMENIA'
WHERE cv.placa = 'JQS11G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700179980697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'FXL365'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180008048',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL VILLAVICENCIO'
WHERE cv.placa = 'KSU012'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175322155',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE DUITAMA'
WHERE cv.placa = 'HMN884'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175316904',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INSP MCPAL TTOYTTE BARBOSA/STDER'
WHERE cv.placa = 'AUT74H'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-11',
  '2025-11-11',
  CASE WHEN '2025-11-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-11'::date, 60) ELSE NULL END,
  '700175311226',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'OES72G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-11-10',
  '2025-11-10',
  CASE WHEN '2025-11-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-10'::date, 60) ELSE NULL END,
  '700175309110',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-11-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTOYTTE TOLIMA/ ALVARADO'
WHERE cv.placa = 'PSO08F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179980697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'FXL159'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180006113',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL LA ESTRELLA'
WHERE cv.placa = 'AUX58H'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179980697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'MXW753'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180004324',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE DPTAL HUILA/TIMANA'
WHERE cv.placa = 'IAM624'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179991645',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL IPIALES'
WHERE cv.placa = 'MXW601'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179983627',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE IBAGUE'
WHERE cv.placa = 'WMX58G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179983627',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE IBAGUE'
WHERE cv.placa = 'JOL490'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179983168',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DEL MUNICIPIO DE MOSQUERA'
WHERE cv.placa = 'UVM632'
AND mc.key = 'admin_id';

-- OMITIDO (sin fecha_tramite): WDT541

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180006901',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST DE TTO SANTA ROSA DE VITERBO'
WHERE cv.placa = 'JOM240'
AND mc.key = 'admin_id';

-- OMITIDO (sin fecha_tramite): ZII492

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179987438',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEY MOV CUND/CAQUEZA'
WHERE cv.placa = 'DSP094'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179990691',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTEYTTO ENVIGADO'
WHERE cv.placa = 'INZ625'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179986533',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTOYTTE TOLIMA/ ALVARADO'
WHERE cv.placa = 'IOP220'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179990051',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE FLORIDABLANCA'
WHERE cv.placa = 'KST376'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179983168',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DEL MUNICIPIO DE MOSQUERA'
WHERE cv.placa = 'WDT237'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179992352',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'KSU139'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179995246',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL SABANETA'
WHERE cv.placa = 'KSU241'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180008930',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'FWY810'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180008048',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL VILLAVICENCIO'
WHERE cv.placa = 'FZK89F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179991144',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE ACACIAS'
WHERE cv.placa = 'MC036395'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180008048',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL VILLAVICENCIO'
WHERE cv.placa = 'KSU246'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-23',
  '2025-12-23',
  CASE WHEN '2025-12-23' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-23'::date, 60) ELSE NULL END,
  '700180008563',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-23'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DE MANIZALES'
WHERE cv.placa = 'VEL555'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180008563',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DE MANIZALES'
WHERE cv.placa = 'JOL129'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180008048',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL VILLAVICENCIO'
WHERE cv.placa = 'IAM393'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180008048',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL VILLAVICENCIO'
WHERE cv.placa = 'LZQ584'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180008048',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL VILLAVICENCIO'
WHERE cv.placa = 'INZ953'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180008930',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'FWY783'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179980697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'GJM973'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179981512',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'IOP407'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180008563',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DE MANIZALES'
WHERE cv.placa = 'URE05H'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179994287',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST DPTAL TTOYTTE  META/RESTREPO'
WHERE cv.placa = 'KSU155'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180008930',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'KSU747'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '9186240901',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DE  MOVILIDAD MUNICIPAL DE CHIA'
WHERE cv.placa = 'PIO616'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179982801',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO 1/COMBITA'
WHERE cv.placa = 'KSU400'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179980697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'DYM792'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179983627',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE IBAGUE'
WHERE cv.placa = 'JOL833'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179992711',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL UBATE'
WHERE cv.placa = 'FZG30F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180008930',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE MCPAL SOGAMOSO'
WHERE cv.placa = 'DSP286'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179980697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'CQZ486'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700180008563',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DE MANIZALES'
WHERE cv.placa = 'URN79H'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179980697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'JOM460'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-11',
  '2025-12-11',
  CASE WHEN '2025-12-11' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-11'::date, 60) ELSE NULL END,
  '700179980697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-11'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'JOM018'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-23',
  '2025-12-23',
  CASE WHEN '2025-12-23' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-23'::date, 60) ELSE NULL END,
  '700179982801',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-23'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'ITBOY - DIST TTO NO 1/COMBITA'
WHERE cv.placa = 'WDT502'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700180010105',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INSTITUTO DE TRANSPORTES Y TRÁNSITO DEL HUILA/RIVERA'
WHERE cv.placa = 'VOE40A'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700179980697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'UVK500'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700179980697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'CQZ744'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700179980697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'DSO659'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700180007528',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTEYTTO MONTERIA'
WHERE cv.placa = 'DSO634'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700179980697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'PSM70F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700179995246',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL SABANETA'
WHERE cv.placa = 'URN22H'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700179994287',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST DPTAL TTOYTTE  META/RESTREPO'
WHERE cv.placa = 'FXL389'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700179980697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'CRK419'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700179996841',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL PAIPA'
WHERE cv.placa = 'KST897'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '202-12-20',
  '202-12-20',
  CASE WHEN '202-12-20' IS NOT NULL THEN public.sumar_dias_habiles('202-12-20'::date, 60) ELSE NULL END,
  '700180001867',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('202-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'UND MCPAL TTOYTTE PALERMO'
WHERE cv.placa = 'BIK01F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700180009240',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'IOQ114'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700179993506',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE DPTAL TANGUA/NARIÑO'
WHERE cv.placa = 'WDT403'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700180000805',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE PUERTO COLOMBIA'
WHERE cv.placa = 'WDT572'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700180001306',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DE MOVILIDAD DE NEIVA'
WHERE cv.placa = 'KSU959'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '9186240905',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE DE PITALITO - INTRAPITALITO'
WHERE cv.placa = 'MC062320'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700179980697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'DSP641'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700179980697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'LZR004'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-23',
  '2025-12-23',
  CASE WHEN '2025-12-23' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-23'::date, 60) ELSE NULL END,
  '700179980697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-23'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'DSO621'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-23',
  '2025-12-23',
  CASE WHEN '2025-12-23' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-23'::date, 60) ELSE NULL END,
  '700180008048',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-23'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL VILLAVICENCIO'
WHERE cv.placa = 'FXL781'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700179980697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'LZQ468'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-20',
  '2025-12-20',
  CASE WHEN '2025-12-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-20'::date, 60) ELSE NULL END,
  '700179980697',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'IOQ191'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-23',
  '2025-12-23',
  CASE WHEN '2025-12-23' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-23'::date, 60) ELSE NULL END,
  '700179981512',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-23'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYMOV PIEDECUESTA/SANTANDER'
WHERE cv.placa = 'PCJ53E'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-24',
  '2025-12-24',
  CASE WHEN '2025-12-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-24'::date, 60) ELSE NULL END,
  '700180002693',
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2025-12-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MCPAL ARMENIA'
WHERE cv.placa = 'ZVR93F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2025-12-23',
  '2025-12-23',
  CASE WHEN '2025-12-23' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-23'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  'REACTIVO EL TRAMITE',
  mc.val,
  COALESCE('2025-12-23'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST TTOYTTE DEL MUNICIPIO DE LOS PATIOS'
WHERE cv.placa = 'OFC66G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2026-02-02',
  '2026-02-02',
  CASE WHEN '2026-02-02' IS NOT NULL THEN public.sumar_dias_habiles('2026-02-02'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2026-02-02'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARÍA DE MOVILIDAD DE MANIZALES'
WHERE cv.placa = 'KSU808'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2026-02-02',
  '2026-02-02',
  CASE WHEN '2026-02-02' IS NOT NULL THEN public.sumar_dias_habiles('2026-02-02'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2026-02-02'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'MXX058'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2026-02-02',
  '2026-02-02',
  CASE WHEN '2026-02-02' IS NOT NULL THEN public.sumar_dias_habiles('2026-02-02'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2026-02-02'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GARZON'
WHERE cv.placa = 'GUA56E'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2026-02-02',
  '2026-02-02',
  CASE WHEN '2026-02-02' IS NOT NULL THEN public.sumar_dias_habiles('2026-02-02'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2026-02-02'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'VPE34A'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2026-02-02',
  '2026-02-02',
  CASE WHEN '2026-02-02' IS NOT NULL THEN public.sumar_dias_habiles('2026-02-02'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2026-02-02'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DE MOVILIDAD DE NEIVA'
WHERE cv.placa = 'RSC95G'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2026-02-02',
  '2026-02-02',
  CASE WHEN '2026-02-02' IS NOT NULL THEN public.sumar_dias_habiles('2026-02-02'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2026-02-02'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL SABANETA'
WHERE cv.placa = 'KSU103'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2026-02-02',
  '2026-02-02',
  CASE WHEN '2026-02-02' IS NOT NULL THEN public.sumar_dias_habiles('2026-02-02'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2026-02-02'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'KST701'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2026-02-02',
  '2026-02-02',
  CASE WHEN '2026-02-02' IS NOT NULL THEN public.sumar_dias_habiles('2026-02-02'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2026-02-02'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'MXW171'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2026-02-02',
  '2026-02-02',
  CASE WHEN '2026-02-02' IS NOT NULL THEN public.sumar_dias_habiles('2026-02-02'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2026-02-02'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'INST DPTAL DE TTO QUINDIO/CIRCASIA'
WHERE cv.placa = 'KSU903'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2026-02-06',
  '2026-02-06',
  CASE WHEN '2026-02-06' IS NOT NULL THEN public.sumar_dias_habiles('2026-02-06'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2026-02-06'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DPTO ADTVO TTOYTTE MCPAL PASTO'
WHERE cv.placa = 'INZ896'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2026-02-07',
  '2026-02-07',
  CASE WHEN '2026-02-07' IS NOT NULL THEN public.sumar_dias_habiles('2026-02-07'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2026-02-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL DE MADRID'
WHERE cv.placa = 'KIM30F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2026-02-07',
  '2026-02-07',
  CASE WHEN '2026-02-07' IS NOT NULL THEN public.sumar_dias_habiles('2026-02-07'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2026-02-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'LZQ691'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2026-02-06',
  '2026-02-06',
  CASE WHEN '2026-02-06' IS NOT NULL THEN public.sumar_dias_habiles('2026-02-06'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2026-02-06'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MOVYTTO OCAÑA'
WHERE cv.placa = 'HZZ981'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2026-02-06',
  '2026-02-06',
  CASE WHEN '2026-02-06' IS NOT NULL THEN public.sumar_dias_habiles('2026-02-06'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2026-02-06'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL VILLAVICENCIO'
WHERE cv.placa = 'PSP18F'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2026-02-09',
  '2026-02-09',
  CASE WHEN '2026-02-09' IS NOT NULL THEN public.sumar_dias_habiles('2026-02-09'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2026-02-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'CRK250'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2026-02-09',
  '2026-02-09',
  CASE WHEN '2026-02-09' IS NOT NULL THEN public.sumar_dias_habiles('2026-02-09'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2026-02-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'KSU323'
AND mc.key = 'admin_id';

INSERT INTO public.mov_traslados (
  cuenta_id, organismo_destino_id, estado,
  fecha_tramite, fecha_aprobacion, fecha_vencimiento,
  numero_guia, empresa_transportadora_id, observaciones,
  creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'enviado_organismo',
  '2026-02-09',
  '2026-02-09',
  CASE WHEN '2026-02-09' IS NOT NULL THEN public.sumar_dias_habiles('2026-02-09'::date, 60) ELSE NULL END,
  NULL,
  (SELECT val FROM _mig_config WHERE key = 'empresa_interrapidisimo'),
  NULL,
  mc.val,
  COALESCE('2026-02-09'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL POPAYAN'
WHERE cv.placa = 'IOP853'
AND mc.key = 'admin_id';

-- ══════════════════════════════════════════════════════════════
-- PASO 5: Insertar radicaciones activas (PENDIENTE RADICAR)
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-11-04',
  CASE WHEN '2025-11-04' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-04'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-11-04'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'UND MCPAL TTOYTTE PALERMO'
WHERE cv.placa = 'WTO163'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-11-12',
  CASE WHEN '2025-11-12' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-12'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-11-12'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'IJQ830'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-11-13',
  CASE WHEN '2025-11-13' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-13'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-11-13'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'BIZ411'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-11-19',
  CASE WHEN '2025-11-19' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-19'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-11-19'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'BOS773'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-11-19',
  CASE WHEN '2025-11-19' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-19'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-11-19'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'EIU606'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-11-20',
  CASE WHEN '2025-11-20' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-20'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-11-20'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'FNW436'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-11-22',
  CASE WHEN '2025-11-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-22'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-11-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'JMW678'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-11-22',
  CASE WHEN '2025-11-22' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-22'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-11-22'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'RDQ349'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-11-24',
  CASE WHEN '2025-11-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-24'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-11-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'BSC521'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-11-24',
  CASE WHEN '2025-11-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-24'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-11-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'FOS768'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-11-24',
  CASE WHEN '2025-11-24' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-24'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-11-24'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE BUCARAMANGA'
WHERE cv.placa = 'GHP169'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-11-25',
  CASE WHEN '2025-11-25' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-25'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-11-25'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'IKS433'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-11-25',
  CASE WHEN '2025-11-25' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-25'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-11-25'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA TTOYTTE MCPAL SARAVENA'
WHERE cv.placa = 'JLK28C'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-11-26',
  CASE WHEN '2025-11-26' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-26'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-11-26'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'RAW359'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-11-27',
  CASE WHEN '2025-11-27' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-27'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-11-27'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DE  MOVILIDAD MUNICIPAL DE CHIA'
WHERE cv.placa = 'NFR924'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-11-29',
  CASE WHEN '2025-11-29' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-29'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-11-29'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'BDQ954'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-12-01',
  CASE WHEN '2025-12-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-01'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-12-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DE  MOVILIDAD MUNICIPAL DE CHIA'
WHERE cv.placa = 'LTU416'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-12-01',
  CASE WHEN '2025-12-01' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-01'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-12-01'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA DE TTOYTTE MEDELLIN'
WHERE cv.placa = 'TSG058'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-12-04',
  CASE WHEN '2025-12-04' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-04'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-12-04'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTEYTTO  MCPAL BARBOSA'
WHERE cv.placa = 'SXA682'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-12-04',
  CASE WHEN '2025-12-04' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-04'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-12-04'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'TSM768'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-12-10',
  CASE WHEN '2025-12-10' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-10'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-12-10'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'DIR TTOYTTE DPTAL CAQUETA/BELEN DE LOS ANDAQUIES'
WHERE cv.placa = 'DVV292'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-12-16',
  CASE WHEN '2025-12-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-16'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-12-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE GIRON'
WHERE cv.placa = 'IPU308'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-12-17',
  CASE WHEN '2025-12-17' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-17'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-12-17'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTOYTTE DUITAMA'
WHERE cv.placa = 'KES370'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-12-18',
  CASE WHEN '2025-12-18' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-18'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-12-18'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SDT SUBSECRETARÍA DE MOVILIDAD RIONEGRO'
WHERE cv.placa = 'SNG195'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-12-30',
  CASE WHEN '2025-12-30' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-30'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-12-30'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'STRIA MCPAL TTO CALI'
WHERE cv.placa = 'MSX192'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2026-01-13',
  CASE WHEN '2026-01-13' IS NOT NULL THEN public.sumar_dias_habiles('2026-01-13'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2026-01-13'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'LMH010'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-12-04',
  CASE WHEN '2025-12-04' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-04'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-12-04'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'LMW725'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-11-07',
  CASE WHEN '2025-11-07' IS NOT NULL THEN public.sumar_dias_habiles('2025-11-07'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-11-07'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DISTRITAL DE MOVILIDAD DE BOGOTA'
WHERE cv.placa = 'NBX909'
AND mc.key = 'admin_id';

INSERT INTO public.mov_radicaciones (
  cuenta_id, organismo_origen_id, estado,
  fecha_tramite, fecha_vencimiento,
  observaciones, creado_por, creado_en, actualizado_en
)
SELECT
  cv.id,
  ot.id,
  'pendiente_radicar',
  '2025-12-16',
  CASE WHEN '2025-12-16' IS NOT NULL THEN public.sumar_dias_habiles('2025-12-16'::date, 60) ELSE current_date + 60 END,
  'PENDIENTE RADICAR',
  mc.val,
  COALESCE('2025-12-16'::timestamp with time zone, now()),
  now()
FROM public.mov_cuentas_vehiculos cv
CROSS JOIN _mig_config mc
JOIN public.mov_organismos_transito ot ON ot.nombre = 'SECRETARIA DE  MOVILIDAD MUNICIPAL DE CHIA'
WHERE cv.placa = 'JVN976'
AND mc.key = 'admin_id';

-- ══════════════════════════════════════════════════════════════
-- PASO 6: Reactivar triggers
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.mov_cuentas_vehiculos ENABLE TRIGGER USER;
ALTER TABLE public.mov_traslados ENABLE TRIGGER USER;
ALTER TABLE public.mov_radicaciones ENABLE TRIGGER USER;

-- ══════════════════════════════════════════════════════════════
-- PASO 7: Limpieza
-- ══════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS _mig_config;

-- ══════════════════════════════════════════════════════════════
-- PASO 8: Verificación
-- ══════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_cuentas integer;
  v_traslados integer;
  v_radicaciones integer;
  v_organismos integer;
BEGIN
  SELECT count(*) INTO v_cuentas FROM public.mov_cuentas_vehiculos;
  SELECT count(*) INTO v_traslados FROM public.mov_traslados;
  SELECT count(*) INTO v_radicaciones FROM public.mov_radicaciones;
  SELECT count(*) INTO v_organismos FROM public.mov_organismos_transito;

  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE 'RESULTADO DE LA MIGRACIÓN:';
  RAISE NOTICE '  Cuentas:       %', v_cuentas;
  RAISE NOTICE '  Traslados:     %', v_traslados;
  RAISE NOTICE '  Radicaciones:  %', v_radicaciones;
  RAISE NOTICE '  Organismos:    %', v_organismos;
  RAISE NOTICE '════════════════════════════════════════════';
END $$;

COMMIT;

-- ══════════════════════════════════════════════════════════════
-- QUERIES DE VERIFICACIÓN (ejecutar después del COMMIT)
-- ══════════════════════════════════════════════════════════════

-- Conteo general:
-- SELECT 'cuentas' as tabla, count(*) as total FROM mov_cuentas_vehiculos
-- UNION ALL SELECT 'traslados', count(*) FROM mov_traslados
-- UNION ALL SELECT 'radicaciones', count(*) FROM mov_radicaciones
-- UNION ALL SELECT 'organismos', count(*) FROM mov_organismos_transito;

-- Traslados por estado:
-- SELECT estado, count(*) FROM mov_traslados GROUP BY estado ORDER BY count(*) DESC;

-- Radicaciones por estado:
-- SELECT estado, count(*) FROM mov_radicaciones GROUP BY estado ORDER BY count(*) DESC;

-- Procesos por vencer (radicaciones activas):
-- SELECT cv.placa, r.estado, r.fecha_tramite, r.fecha_vencimiento,
--   r.fecha_vencimiento - current_date as dias_restantes
-- FROM mov_radicaciones r
-- JOIN mov_cuentas_vehiculos cv ON cv.id = r.cuenta_id
-- WHERE r.estado NOT IN ('radicado', 'devuelto')
-- ORDER BY r.fecha_vencimiento;