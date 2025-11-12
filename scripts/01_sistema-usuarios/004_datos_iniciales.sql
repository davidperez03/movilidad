-- ============================================================================
-- DATOS INICIALES DEL SISTEMA DE ROLES MODULARES
-- Inserta módulos y sus roles correspondientes
-- ============================================================================

-- ============================================================================
-- 1. INSERTAR MÓDULOS
-- ============================================================================

INSERT INTO public.modulos (id, nombre, descripcion, icono, ruta, activo, orden)
VALUES
  ('tickets', 'Sistema de Tickets', 'Gestión de tickets de soporte y tareas', 'ticket', '/tickets', true, 1),
  ('movilidad', 'Gestión de Movilidad', 'Gestión de cuentas, traslados y radicaciones de vehículos', 'car', '/movilidad', true, 2)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  icono = EXCLUDED.icono,
  ruta = EXCLUDED.ruta,
  activo = EXCLUDED.activo,
  orden = EXCLUDED.orden;

-- ============================================================================
-- 2. INSERTAR ROLES PARA MÓDULO TICKETS
-- ============================================================================

INSERT INTO public.roles_modulo (modulo_id, codigo, nombre, descripcion, permisos, nivel)
VALUES
  (
    'tickets',
    'tks_usuario',
    'Usuario de Tickets',
    'Puede crear y ver sus propios tickets',
    '{
      "ver_propios": true,
      "ver_todos": false,
      "crear": true,
      "editar_propios": true,
      "editar_asignados": false,
      "editar_todos": false,
      "eliminar": false,
      "asignar": false,
      "comentar": true,
      "adjuntar": true
    }'::jsonb,
    0
  ),
  (
    'tickets',
    'tks_agente',
    'Agente de Soporte',
    'Gestiona tickets asignados y puede ver todos los tickets',
    '{
      "ver_propios": true,
      "ver_todos": true,
      "crear": true,
      "editar_propios": true,
      "editar_asignados": true,
      "editar_todos": false,
      "eliminar": false,
      "asignar": true,
      "comentar": true,
      "adjuntar": true
    }'::jsonb,
    1
  ),
  (
    'tickets',
    'tks_administrador',
    'Administrador de Tickets',
    'Control total sobre el módulo de tickets',
    '{
      "ver_propios": true,
      "ver_todos": true,
      "crear": true,
      "editar_propios": true,
      "editar_asignados": true,
      "editar_todos": true,
      "eliminar": true,
      "asignar": true,
      "comentar": true,
      "adjuntar": true,
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
-- 3. INSERTAR ROLES PARA MÓDULO MOVILIDAD
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
