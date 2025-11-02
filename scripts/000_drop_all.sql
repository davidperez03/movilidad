-- =====================================================
-- SCRIPT DE LIMPIEZA TOTAL
-- ⚠️ PELIGRO: Este script eliminará TODA la base de datos
-- ⚠️ Usa con extrema precaución
-- =====================================================

-- Deshabilitar RLS temporalmente
alter table if exists public.tks_adjuntos disable row level security;
alter table if exists public.tks_comentarios disable row level security;
alter table if exists public.tks_tickets disable row level security;
alter table if exists public.perfiles disable row level security;
alter table if exists public.mov_cuentas_vehiculos disable row level security;
alter table if exists public.mov_traslados disable row level security;
alter table if exists public.mov_radicaciones disable row level security;
alter table if exists public.mov_novedades disable row level security;
alter table if exists public.mov_adjuntos_novedades disable row level security;
alter table if exists public.mov_historial_acciones disable row level security;
alter table if exists public.mov_festivos_colombia disable row level security;
alter table if exists public.mov_organismos_transito disable row level security;

-- =====================================================
-- 1. ELIMINAR POLÍTICAS RLS
-- =====================================================

-- Políticas de tickets
drop policy if exists "Los usuarios pueden ver sus propios tickets" on public.tks_tickets;
drop policy if exists "Los usuarios pueden crear tickets" on public.tks_tickets;
drop policy if exists "Los agentes y administradores pueden actualizar tickets" on public.tks_tickets;
drop policy if exists "Los administradores pueden eliminar tickets" on public.tks_tickets;

-- Políticas de comentarios
drop policy if exists "Los usuarios pueden ver comentarios en sus tickets" on public.tks_comentarios;
drop policy if exists "Los usuarios pueden crear comentarios en tickets accesibles" on public.tks_comentarios;
drop policy if exists "Los usuarios pueden actualizar sus propios comentarios" on public.tks_comentarios;
drop policy if exists "Los usuarios pueden eliminar sus propios comentarios" on public.tks_comentarios;

-- Políticas de adjuntos
drop policy if exists "Los usuarios pueden ver adjuntos en sus tickets" on public.tks_adjuntos;
drop policy if exists "Los usuarios pueden subir adjuntos a tickets accesibles" on public.tks_adjuntos;
drop policy if exists "Los usuarios pueden eliminar sus propios adjuntos" on public.tks_adjuntos;

-- Políticas de perfiles
drop policy if exists "Los usuarios pueden ver todos los perfiles" on public.perfiles;
drop policy if exists "Los usuarios pueden actualizar su propio perfil" on public.perfiles;
drop policy if exists "Los usuarios pueden insertar su propio perfil" on public.perfiles;

-- Políticas de cuentas de movilidad
drop policy if exists "Todos pueden ver cuentas" on public.mov_cuentas_vehiculos;
drop policy if exists "Los usuarios pueden crear cuentas" on public.mov_cuentas_vehiculos;
drop policy if exists "Usuarios autenticados pueden actualizar cuentas" on public.mov_cuentas_vehiculos;
drop policy if exists "Los administradores pueden eliminar cuentas" on public.mov_cuentas_vehiculos;

-- Políticas de traslados
drop policy if exists "Usuarios pueden ver todos los traslados" on public.mov_traslados;
drop policy if exists "Usuarios pueden crear traslados" on public.mov_traslados;
drop policy if exists "Usuarios pueden actualizar traslados" on public.mov_traslados;
drop policy if exists "Administradores pueden eliminar traslados" on public.mov_traslados;
drop policy if exists "Acceso público de lectura a traslados" on public.mov_traslados;

-- Políticas de radicaciones
drop policy if exists "Usuarios pueden ver todas las radicaciones" on public.mov_radicaciones;
drop policy if exists "Usuarios pueden crear radicaciones" on public.mov_radicaciones;
drop policy if exists "Usuarios pueden actualizar radicaciones" on public.mov_radicaciones;
drop policy if exists "Administradores pueden eliminar radicaciones" on public.mov_radicaciones;
drop policy if exists "Acceso público de lectura a radicaciones" on public.mov_radicaciones;

-- Políticas de novedades
drop policy if exists "Usuarios pueden ver todas las novedades" on public.mov_novedades;
drop policy if exists "Usuarios pueden crear novedades" on public.mov_novedades;
drop policy if exists "Usuarios y agentes pueden actualizar novedades" on public.mov_novedades;
drop policy if exists "Administradores pueden eliminar novedades" on public.mov_novedades;

-- Políticas de adjuntos de novedades
drop policy if exists "Usuarios pueden ver adjuntos de novedades" on public.mov_adjuntos_novedades;
drop policy if exists "Usuarios pueden subir adjuntos a novedades" on public.mov_adjuntos_novedades;
drop policy if exists "Usuarios pueden eliminar sus propios adjuntos" on public.mov_adjuntos_novedades;

-- Políticas de historial
drop policy if exists "Usuarios pueden ver todo el historial" on public.mov_historial_acciones;
drop policy if exists "Solo el sistema puede insertar en historial" on public.mov_historial_acciones;

-- Políticas de festivos
drop policy if exists "Todos pueden ver festivos" on public.mov_festivos_colombia;

-- Políticas de organismos
drop policy if exists "Todos pueden ver organismos activos" on public.mov_organismos_transito;
drop policy if exists "Solo administradores pueden modificar organismos" on public.mov_organismos_transito;

-- =====================================================
-- 2. ELIMINAR TRIGGERS
-- =====================================================

-- Triggers de auth
drop trigger if exists al_crear_usuario_auth on auth.users;

-- Triggers de cuentas
drop trigger if exists before_insert_cuenta on public.mov_cuentas_vehiculos;
drop trigger if exists before_update_cuenta on public.mov_cuentas_vehiculos;
drop trigger if exists after_insert_cuenta_historial on public.mov_cuentas_vehiculos;

-- Triggers de traslados
drop trigger if exists before_insert_traslado on public.mov_traslados;
drop trigger if exists before_update_auto_actualizado_traslado on public.mov_traslados;
drop trigger if exists before_update_traslado on public.mov_traslados;
drop trigger if exists before_update_estado_traslado on public.mov_traslados;
drop trigger if exists before_insert_validar_traslado on public.mov_traslados;
drop trigger if exists before_insert_validar_secuencia_traslado on public.mov_traslados;
drop trigger if exists before_update_validar_estado_traslado on public.mov_traslados;
drop trigger if exists before_update_validar_no_finalizado_traslado on public.mov_traslados;
drop trigger if exists after_insert_traslado_historial on public.mov_traslados;
drop trigger if exists after_update_traslado_historial on public.mov_traslados;

-- Triggers de radicaciones
drop trigger if exists before_insert_radicacion on public.mov_radicaciones;
drop trigger if exists before_update_auto_actualizado_radicacion on public.mov_radicaciones;
drop trigger if exists before_update_radicacion on public.mov_radicaciones;
drop trigger if exists before_update_estado_radicacion on public.mov_radicaciones;
drop trigger if exists before_insert_validar_radicacion on public.mov_radicaciones;
drop trigger if exists before_insert_validar_secuencia_radicacion on public.mov_radicaciones;
drop trigger if exists before_update_validar_estado_radicacion on public.mov_radicaciones;
drop trigger if exists before_update_validar_no_finalizado_radicacion on public.mov_radicaciones;
drop trigger if exists after_insert_radicacion_historial on public.mov_radicaciones;
drop trigger if exists after_update_radicacion_historial on public.mov_radicaciones;

-- Triggers de novedades
drop trigger if exists before_update_novedad on public.mov_novedades;
drop trigger if exists before_update_estado_novedad on public.mov_novedades;
drop trigger if exists after_insert_update_novedad on public.mov_novedades;

-- Triggers de organismos
drop trigger if exists trigger_update_organismo_search on public.mov_organismos_transito;
drop trigger if exists before_update_organismo on public.mov_organismos_transito;

-- =====================================================
-- 3. ELIMINAR ÍNDICES
-- =====================================================

-- Índices de tickets
drop index if exists public.idx_tks_tickets_creado_por;
drop index if exists public.idx_tks_tickets_asignado_a;
drop index if exists public.idx_tks_tickets_estado;
drop index if exists public.idx_tks_tickets_prioridad;
drop index if exists public.idx_tks_tickets_tipo;
drop index if exists public.idx_tks_comentarios_ticket_id;
drop index if exists public.idx_tks_comentarios_usuario_id;
drop index if exists public.idx_tks_adjuntos_ticket_id;

-- Índices de cuentas de movilidad
drop index if exists public.idx_mov_cuentas_placa;
drop index if exists public.idx_mov_cuentas_numero;
drop index if exists public.idx_mov_cuentas_creado_por;
drop index if exists public.idx_mov_cuentas_creado_en;

-- Índices de traslados
drop index if exists public.idx_mov_traslados_cuenta;
drop index if exists public.idx_mov_traslados_organismo_destino;
drop index if exists public.idx_mov_traslados_estado;
drop index if exists public.idx_mov_traslados_fecha_tramite;
drop index if exists public.idx_mov_traslados_fecha_vencimiento;
drop index if exists public.idx_mov_traslados_creado_por;

-- Índices de radicaciones
drop index if exists public.idx_mov_radicaciones_cuenta;
drop index if exists public.idx_mov_radicaciones_organismo_origen;
drop index if exists public.idx_mov_radicaciones_estado;
drop index if exists public.idx_mov_radicaciones_fecha_tramite;
drop index if exists public.idx_mov_radicaciones_fecha_vencimiento;
drop index if exists public.idx_mov_radicaciones_creado_por;

-- Índices de novedades
drop index if exists public.idx_mov_novedades_proceso;
drop index if exists public.idx_mov_novedades_estado;
drop index if exists public.idx_mov_novedades_prioridad;
drop index if exists public.idx_mov_novedades_creado_por;
drop index if exists public.idx_mov_novedades_creado_en;

-- Índices de adjuntos de novedades
drop index if exists public.idx_mov_adjuntos_novedades_novedad;
drop index if exists public.idx_mov_adjuntos_novedades_subido_por;

-- Índices de historial
drop index if exists public.idx_mov_historial_cuenta;
drop index if exists public.idx_mov_historial_proceso;
drop index if exists public.idx_mov_historial_accion;
drop index if exists public.idx_mov_historial_realizado_por;
drop index if exists public.idx_mov_historial_creado_en;
drop index if exists public.idx_mov_historial_detalles_gin;

-- Índices de festivos
drop index if exists public.idx_mov_festivos_fecha;
drop index if exists public.idx_mov_festivos_anio;

-- Índices de organismos
drop index if exists public.idx_mov_organismos_nombre;
drop index if exists public.idx_mov_organismos_departamento;
drop index if exists public.idx_mov_organismos_municipio;
drop index if exists public.idx_mov_organismos_activo;
drop index if exists public.idx_mov_organismos_search;

-- =====================================================
-- 4. ELIMINAR TABLAS (en orden inverso por dependencias)
-- =====================================================

-- Tablas de tickets
drop table if exists public.tks_adjuntos cascade;
drop table if exists public.tks_comentarios cascade;
drop table if exists public.tks_tickets cascade;

-- Tablas de movilidad (en orden de dependencias)
drop table if exists public.mov_historial_acciones cascade;
drop table if exists public.mov_adjuntos_novedades cascade;
drop table if exists public.mov_novedades cascade;
drop table if exists public.mov_traslados cascade;
drop table if exists public.mov_radicaciones cascade;
drop table if exists public.mov_cuentas_vehiculos cascade;
drop table if exists public.mov_organismos_transito cascade;
drop table if exists public.mov_festivos_colombia cascade;

-- Tabla de perfiles (última, porque otras dependen de ella)
drop table if exists public.perfiles cascade;

-- =====================================================
-- 5. ELIMINAR VISTAS
-- =====================================================

drop view if exists public.mov_vista_consulta_publica cascade;
drop view if exists public.mov_vista_proceso_activo cascade;
drop view if exists public.mov_vista_resumen_novedades cascade;
drop view if exists public.mov_vista_procesos_por_vencer cascade;

-- =====================================================
-- 6. ELIMINAR FUNCIONES
-- =====================================================

-- Funciones de tickets
drop function if exists public.manejar_nuevo_usuario() cascade;

-- Funciones de cuentas
drop function if exists public.generar_numero_cuenta() cascade;
drop function if exists public.trigger_generar_numero_cuenta() cascade;
drop function if exists public.trigger_actualizar_fecha() cascade;

-- Funciones de traslados/radicaciones
drop function if exists public.calcular_fecha_vencimiento(date) cascade;
drop function if exists public.trigger_vencimiento_traslado() cascade;
drop function if exists public.trigger_vencimiento_radicacion() cascade;
drop function if exists public.trigger_auto_actualizado_por() cascade;
drop function if exists public.trigger_marcar_completado() cascade;

-- Funciones de novedades
drop function if exists public.trigger_marcar_resolucion() cascade;
drop function if exists public.trigger_actualizar_estado_proceso() cascade;

-- Funciones de historial
drop function if exists public.registrar_historial(uuid, text, uuid, text, jsonb, text, text) cascade;
drop function if exists public.trigger_historial_cuenta_creada() cascade;
drop function if exists public.trigger_historial_traslado_iniciado() cascade;
drop function if exists public.trigger_historial_radicacion_iniciada() cascade;
drop function if exists public.trigger_historial_estado_traslado() cascade;
drop function if exists public.trigger_historial_estado_radicacion() cascade;

-- Funciones de reglas de negocio
drop function if exists public.validar_proceso_unico() cascade;
drop function if exists public.validar_secuencia_procesos() cascade;
drop function if exists public.validar_transicion_estado() cascade;
drop function if exists public.validar_proceso_no_finalizado() cascade;
drop function if exists public.obtener_estado_vehiculo(uuid) cascade;
drop function if exists public.puede_iniciar_proceso(text, text) cascade;

-- Funciones de consultas públicas
drop function if exists public.consultar_vehiculo_por_placa(text) cascade;

-- Funciones de días hábiles
drop function if exists public.es_dia_habil(date) cascade;
drop function if exists public.sumar_dias_habiles(date, integer) cascade;
drop function if exists public.contar_dias_habiles(date, date) cascade;

-- Funciones de organismos
drop function if exists public.update_organismo_search_vector() cascade;

-- =====================================================
-- 7. ELIMINAR TIPOS PERSONALIZADOS (si existen)
-- =====================================================

drop type if exists tipo_servicio_enum cascade;
drop type if exists estado_proceso_enum cascade;
drop type if exists tipo_novedad_enum cascade;

-- =====================================================
-- FINALIZADO
-- =====================================================

-- Verificar que no queden tablas
select
  'Tablas restantes:' as mensaje,
  count(*) as total
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE';

-- Verificar que no queden funciones
select
  'Funciones restantes:' as mensaje,
  count(*) as total
from information_schema.routines
where routine_schema = 'public';

-- Mensaje final
select '✅ Base de datos limpiada completamente' as resultado;
