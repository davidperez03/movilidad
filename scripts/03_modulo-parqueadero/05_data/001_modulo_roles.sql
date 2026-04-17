insert into public.modulos (id, nombre, descripcion, icono, ruta, activo, orden)
values ('parqueadero', 'Parqueadero', 'Inspecciones de grúas y bitácora', 'truck', '/parqueadero', true, 2)
on conflict (id) do nothing;

insert into public.roles_modulo (modulo_id, codigo, nombre, descripcion, permisos, nivel)
values
  (
    'parqueadero',
    'parq_operario',
    'Operario de Parqueadero',
    'Rol base - funcionalidad en desarrollo',
    '{"ver": true, "crear_inspecciones": false, "editar_inspecciones": false, "eliminar_inspecciones": false, "gestionar_vehiculos": false, "configurar": false}'::jsonb,
    0
  ),
  (
    'parqueadero',
    'parq_auxiliar',
    'Auxiliar de Parqueadero',
    'Puede crear inspecciones de vehículos',
    '{"ver": true, "crear_inspecciones": true, "editar_inspecciones": false, "eliminar_inspecciones": false, "gestionar_vehiculos": false, "configurar": false, "gestionar_inventario": true}'::jsonb,
    1
  ),
  (
    'parqueadero',
    'parq_administrador',
    'Administrador de Parqueadero',
    'Control total: vehículos, inspecciones, configuración',
    '{"ver": true, "crear_inspecciones": true, "editar_inspecciones": true, "eliminar_inspecciones": true, "gestionar_vehiculos": true, "configurar": true, "gestionar_inventario": true}'::jsonb,
    2
  )
on conflict (modulo_id, codigo) do nothing;
