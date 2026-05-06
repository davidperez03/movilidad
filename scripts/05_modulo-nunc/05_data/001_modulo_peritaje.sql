INSERT INTO public.modulos (id, nombre, descripcion, icono, ruta, activo, orden)
VALUES ('nunc', 'NUNC', 'Gestión de sesiones de nunc externo', 'scale', '/nunc', true, 3)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  icono = EXCLUDED.icono,
  ruta = EXCLUDED.ruta,
  activo = EXCLUDED.activo,
  orden = EXCLUDED.orden;

INSERT INTO public.roles_modulo (modulo_id, codigo, nombre, descripcion, permisos, nivel)
VALUES
  (
    'nunc',
    'nunc_operador',
    'Operador de NUNC',
    'Puede ver sesiones y crear nuevas sesiones',
    '{"ver": true, "crear_sesiones": true, "configurar": false}'::jsonb,
    1
  ),
  (
    'nunc',
    'nunc_admin',
    'Administrador de NUNC',
    'Control total sobre el módulo de nunc',
    '{"ver": true, "crear_sesiones": true, "configurar": true}'::jsonb,
    2
  )
ON CONFLICT (modulo_id, codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  permisos = EXCLUDED.permisos,
  nivel = EXCLUDED.nivel;
