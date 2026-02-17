-- =============================================================================
-- Hardening de permisos globales
-- Este script DEBE ejecutarse DESPUÉS de todos los módulos y vistas
-- =============================================================================

-- Revocar permisos por defecto de anon y public en schema public
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM public;

-- Configurar privilegios por defecto para nuevas tablas y funciones
-- Esto asegura que objetos creados en el futuro tampoco hereden permisos
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM public;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM public;

-- Re-grant explícito: anon solo puede ejecutar la RPC de consulta pública
-- La vista ya NO es accesible directamente por anon (se consume vía API route server-side)
GRANT EXECUTE ON FUNCTION public.consultar_vehiculo_por_placa(text) TO anon;

-- authenticated necesita acceso a tablas vía RLS (las políticas controlan el acceso)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Privilegios por defecto para nuevos objetos hacia authenticated
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE ON SEQUENCES TO authenticated;
