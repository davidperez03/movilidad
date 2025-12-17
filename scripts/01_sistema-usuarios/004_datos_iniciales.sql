-- ============================================================================
-- DATOS INICIALES DEL SISTEMA DE ROLES MODULARES
-- Inserta módulos y sus roles correspondientes
-- ============================================================================

-- ============================================================================
-- 1. INSERTAR MÓDULOS
-- ============================================================================

INSERT INTO public.modulos (id, nombre, descripcion, icono, ruta, activo, orden)
VALUES
  ('movilidad', 'Gestión de Movilidad', 'Gestión de cuentas, traslados y radicaciones de vehículos', 'car', '/movilidad', true, 1)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  icono = EXCLUDED.icono,
  ruta = EXCLUDED.ruta,
  activo = EXCLUDED.activo,
  orden = EXCLUDED.orden;

-- ============================================================================
-- 2. INSERTAR ROLES PARA MÓDULO MOVILIDAD
-- ============================================================================

INSERT INTO public.roles_modulo (modulo_id, codigo, nombre, descripcion, permisos, nivel)
VALUES
  (
    'movilidad',
    'mov_usuario',
    'Usuario de Movilidad',
    'Solo puede consultar información (lectura)',
    '{
      "ver": true,
      "crear_cuentas": false,
      "editar_cuentas": false,
      "eliminar_cuentas": false,
      "crear_traslados": false,
      "editar_traslados": false,
      "eliminar_traslados": false,
      "crear_radicaciones": false,
      "editar_radicaciones": false,
      "eliminar_radicaciones": false,
      "gestionar_novedades": false,
      "configurar": false
    }'::jsonb,
    0
  ),
  (
    'movilidad',
    'mov_operador',
    'Operador de Movilidad',
    'Gestiona procesos de traslado y radicación',
    '{
      "ver": true,
      "crear_cuentas": true,
      "editar_cuentas": true,
      "eliminar_cuentas": false,
      "crear_traslados": true,
      "editar_traslados": true,
      "eliminar_traslados": false,
      "crear_radicaciones": true,
      "editar_radicaciones": true,
      "eliminar_radicaciones": false,
      "gestionar_novedades": true,
      "configurar": false
    }'::jsonb,
    1
  ),
  (
    'movilidad',
    'mov_administrador',
    'Administrador de Movilidad',
    'Control total sobre el módulo de movilidad',
    '{
      "ver": true,
      "crear_cuentas": true,
      "editar_cuentas": true,
      "eliminar_cuentas": true,
      "crear_traslados": true,
      "editar_traslados": true,
      "eliminar_traslados": true,
      "crear_radicaciones": true,
      "editar_radicaciones": true,
      "eliminar_radicaciones": true,
      "gestionar_novedades": true,
      "configurar": true
    }'::jsonb,
    2
  )
ON CONFLICT (modulo_id, codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  permisos = EXCLUDED.permisos,
  nivel = EXCLUDED.nivel;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
