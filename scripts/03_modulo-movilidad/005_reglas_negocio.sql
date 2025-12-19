-- =====================================================
-- MÓDULO: CUENTAS DE MOVILIDAD
-- Archivo: 005_reglas_negocio.sql
-- Descripción: Validaciones y reglas de negocio
-- =====================================================

-- =====================================================
-- REGLA #1: Un vehículo no puede estar en dos procesos al mismo tiempo
-- =====================================================

create or replace function validar_proceso_unico()
returns trigger
language plpgsql
as $$
declare
  tiene_traslado_activo boolean;
  tiene_radicacion_activa boolean;
begin
  -- Verificar si ya tiene un traslado activo (excluyendo sin_asignar)
  select exists(
    select 1 from public.mov_traslados
    where cuenta_id = new.cuenta_id
    and estado not in ('sin_asignar', 'trasladado', 'devuelto')
  ) into tiene_traslado_activo;

  -- Verificar si ya tiene una radicación activa (excluyendo sin_asignar)
  select exists(
    select 1 from public.mov_radicaciones
    where cuenta_id = new.cuenta_id
    and estado not in ('sin_asignar', 'radicado', 'devuelto')
  ) into tiene_radicacion_activa;

  -- Si es un traslado nuevo y ya tiene radicación activa
  if tg_table_name = 'mov_traslados' and tiene_radicacion_activa then
    raise exception 'El vehículo ya tiene un proceso de radicación activo. No puede iniciar un traslado.';
  end if;

  -- Si es una radicación nueva y ya tiene traslado activo
  if tg_table_name = 'mov_radicaciones' and tiene_traslado_activo then
    raise exception 'El vehículo ya tiene un proceso de traslado activo. No puede iniciar una radicación.';
  end if;

  return new;
end;
$$;

drop trigger if exists before_insert_validar_traslado on public.mov_traslados;
drop trigger if exists before_insert_validar_radicacion on public.mov_radicaciones;

create trigger before_insert_validar_traslado
  before insert on public.mov_traslados
  for each row
  execute function validar_proceso_unico();

create trigger before_insert_validar_radicacion
  before insert on public.mov_radicaciones
  for each row
  execute function validar_proceso_unico();

-- =====================================================
-- REGLA #2: Lógica de origen y destino
-- =====================================================

create or replace function validar_secuencia_procesos()
returns trigger
language plpgsql
as $$
declare
  ultimo_proceso record;
  ultimo_tipo text;
  ultimo_estado text;
begin
  -- Buscar el último proceso completado o devuelto de esta cuenta
  select
    'traslado' as tipo,
    estado,
    creado_en
  into ultimo_proceso
  from public.mov_traslados
  where cuenta_id = new.cuenta_id
    and estado in ('trasladado', 'devuelto')
  order by creado_en desc
  limit 1;

  if not found then
    -- Si no hay traslado, buscar radicación
    select
      'radicacion' as tipo,
      estado,
      creado_en
    into ultimo_proceso
    from public.mov_radicaciones
    where cuenta_id = new.cuenta_id
      and estado in ('radicado', 'devuelto')
    order by creado_en desc
    limit 1;
  end if;

  -- Si existe un proceso anterior
  if found then
    ultimo_tipo := ultimo_proceso.tipo;
    ultimo_estado := ultimo_proceso.estado;

    -- Si el último fue una radicación completada
    if ultimo_tipo = 'radicacion' and ultimo_estado = 'radicado' then
      -- Solo puede hacer traslado ahora
      if tg_table_name = 'mov_radicaciones' then
        raise exception 'Este vehículo fue radicado previamente. Debe ser trasladado primero antes de otra radicación.';
      end if;
    end if;

    -- Si el último fue un traslado completado
    if ultimo_tipo = 'traslado' and ultimo_estado = 'trasladado' then
      -- Solo puede hacer radicación ahora
      if tg_table_name = 'mov_traslados' then
        raise exception 'Este vehículo fue trasladado previamente. Debe ser radicado primero antes de otro traslado.';
      end if;
    end if;

    -- Excepción: Si el proceso fue devuelto, puede hacer el proceso contrario
    -- (no se valida porque el estado 'devuelto' permite cualquier proceso siguiente)
  end if;

  return new;
end;
$$;

drop trigger if exists before_insert_validar_secuencia_traslado on public.mov_traslados;
drop trigger if exists before_insert_validar_secuencia_radicacion on public.mov_radicaciones;

create trigger before_insert_validar_secuencia_traslado
  before insert on public.mov_traslados
  for each row
  execute function validar_secuencia_procesos();

create trigger before_insert_validar_secuencia_radicacion
  before insert on public.mov_radicaciones
  for each row
  execute function validar_secuencia_procesos();

-- =====================================================
-- REGLA #3: Validar transiciones de estado válidas
-- =====================================================

create or replace function validar_transicion_estado()
returns trigger
language plpgsql
as $$
declare
  transicion_valida boolean := false;
  i integer;
  transiciones_validas text[][];
  estados_permitidos text := '';
begin
  -- Transiciones válidas para traslados
  -- Flujo: sin_asignar -> revisado -> con_novedades <-> revisado -> enviado_organismo -> trasladado
  -- Devuelto puede ser desde revisado, con_novedades o enviado_organismo
  -- Se permite avanzar desde cualquier estado hacia estados posteriores
  if tg_table_name = 'mov_traslados' then
    transiciones_validas := array[
      array['sin_asignar', 'revisado'],
      array['sin_asignar', 'con_novedades'],
      array['sin_asignar', 'enviado_organismo'],
      array['revisado', 'con_novedades'],
      array['revisado', 'enviado_organismo'],
      array['revisado', 'devuelto'],
      array['con_novedades', 'revisado'],
      array['con_novedades', 'enviado_organismo'],
      array['con_novedades', 'devuelto'],
      array['enviado_organismo', 'trasladado'],
      array['enviado_organismo', 'devuelto']
    ];
  end if;

  -- Transiciones válidas para radicaciones
  -- Flujo: sin_asignar -> recibido -> revisado -> con_novedades <-> revisado -> pendiente_radicar -> radicado
  -- Devuelto puede ser desde revisado, con_novedades o pendiente_radicar
  -- Se permite avanzar desde cualquier estado hacia estados posteriores
  if tg_table_name = 'mov_radicaciones' then
    transiciones_validas := array[
      array['sin_asignar', 'recibido'],
      array['sin_asignar', 'revisado'],
      array['sin_asignar', 'pendiente_radicar'],
      array['recibido', 'revisado'],
      array['recibido', 'con_novedades'],
      array['revisado', 'con_novedades'],
      array['revisado', 'pendiente_radicar'],
      array['revisado', 'devuelto'],
      array['con_novedades', 'revisado'],
      array['con_novedades', 'pendiente_radicar'],
      array['con_novedades', 'devuelto'],
      array['pendiente_radicar', 'radicado'],
      array['pendiente_radicar', 'devuelto']
    ];
  end if;

  -- Verificar si la transición es válida
  if old.estado != new.estado then
    -- Recorrer todas las transiciones válidas
    for i in 1..array_length(transiciones_validas, 1) loop
      if transiciones_validas[i][1] = old.estado and transiciones_validas[i][2] = new.estado then
        transicion_valida := true;
        exit;
      end if;

      -- Construir lista de estados permitidos desde el estado actual
      if transiciones_validas[i][1] = old.estado then
        if estados_permitidos = '' then
          estados_permitidos := transiciones_validas[i][2];
        else
          estados_permitidos := estados_permitidos || ', ' || transiciones_validas[i][2];
        end if;
      end if;
    end loop;

    -- Si la transición no es válida, lanzar error
    if not transicion_valida then
      if estados_permitidos = '' then
        estados_permitidos := 'ninguno (estado final)';
      end if;

      raise exception 'Transición de estado inválida: "%" -> "%". Estados permitidos desde "%": %',
        old.estado,
        new.estado,
        old.estado,
        estados_permitidos;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists before_update_validar_estado_traslado on public.mov_traslados;
drop trigger if exists before_update_validar_estado_radicacion on public.mov_radicaciones;

create trigger before_update_validar_estado_traslado
  before update on public.mov_traslados
  for each row
  when (old.estado is distinct from new.estado)
  execute function validar_transicion_estado();

create trigger before_update_validar_estado_radicacion
  before update on public.mov_radicaciones
  for each row
  when (old.estado is distinct from new.estado)
  execute function validar_transicion_estado();

-- =====================================================
-- REGLA #4: No permitir cambios en procesos finalizados
-- =====================================================

create or replace function validar_proceso_no_finalizado()
returns trigger
language plpgsql
as $$
begin
  -- Para traslados
  if tg_table_name = 'mov_traslados' and old.estado in ('trasladado', 'devuelto') then
    raise exception 'No se puede modificar un traslado que ya fue % el %',
      case when old.estado = 'trasladado' then 'completado' else 'devuelto' end,
      old.fecha_completado::date;
  end if;

  -- Para radicaciones
  if tg_table_name = 'mov_radicaciones' and old.estado in ('radicado', 'devuelto') then
    raise exception 'No se puede modificar una radicación que ya fue % el %',
      case when old.estado = 'radicado' then 'completada' else 'devuelta' end,
      old.fecha_completado::date;
  end if;

  return new;
end;
$$;

drop trigger if exists before_update_validar_no_finalizado_traslado on public.mov_traslados;
drop trigger if exists before_update_validar_no_finalizado_radicacion on public.mov_radicaciones;

create trigger before_update_validar_no_finalizado_traslado
  before update on public.mov_traslados
  for each row
  execute function validar_proceso_no_finalizado();

create trigger before_update_validar_no_finalizado_radicacion
  before update on public.mov_radicaciones
  for each row
  execute function validar_proceso_no_finalizado();

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para obtener el estado actual de un vehículo
create or replace function obtener_estado_vehiculo(p_cuenta_id uuid)
returns table (
  tiene_proceso_activo boolean,
  tipo_proceso text,
  estado_proceso text,
  dias_restantes integer,
  tiene_novedades_pendientes boolean
)
language plpgsql
as $$
begin
  return query
  select
    vpa.proceso_id is not null as tiene_proceso_activo,
    vpa.proceso_tipo,
    vpa.proceso_estado,
    (vpa.fecha_vencimiento - current_date)::integer as dias_restantes,
    coalesce(vrn.pendientes, 0) > 0 as tiene_novedades_pendientes
  from public.mov_vista_proceso_activo vpa
  left join public.mov_vista_resumen_novedades vrn
    on vpa.proceso_tipo = vrn.proceso_tipo
    and vpa.proceso_id = vrn.proceso_id
  where vpa.cuenta_id = p_cuenta_id;
end;
$$;

-- Función para verificar si un vehículo puede iniciar un proceso
create or replace function puede_iniciar_proceso(
  p_placa text,
  p_tipo_proceso text -- 'traslado' o 'radicacion'
)
returns table (
  puede_iniciar boolean,
  razon text
)
language plpgsql
as $$
declare
  v_cuenta_id uuid;
  v_estado record;
begin
  -- Buscar la cuenta
  select id into v_cuenta_id
  from public.mov_cuentas_vehiculos
  where placa = p_placa;

  if not found then
    return query select false, 'El vehículo no existe en el sistema';
    return;
  end if;

  -- Obtener estado actual
  select * into v_estado
  from obtener_estado_vehiculo(v_cuenta_id);

  -- Verificar si tiene proceso activo
  if v_estado.tiene_proceso_activo then
    return query select
      false,
      format('El vehículo tiene un proceso de %s activo en estado: %s',
        v_estado.tipo_proceso,
        v_estado.estado_proceso
      );
    return;
  end if;

  -- Si llega aquí, puede iniciar el proceso
  return query select true, 'El vehículo puede iniciar el proceso'::text;
end;
$$;

-- Función para obtener las transiciones válidas desde un estado actual
create or replace function obtener_transiciones_validas(
  p_estado_actual text,
  p_tipo_proceso text -- 'traslado' o 'radicacion'
)
returns table (
  estado_siguiente text
)
language plpgsql
as $$
declare
  transiciones_validas text[][];
  i integer;
begin
  -- Transiciones válidas para traslados
  if p_tipo_proceso = 'traslado' then
    transiciones_validas := array[
      array['sin_asignar', 'revisado'],
      array['sin_asignar', 'con_novedades'],
      array['sin_asignar', 'enviado_organismo'],
      array['revisado', 'con_novedades'],
      array['revisado', 'enviado_organismo'],
      array['revisado', 'devuelto'],
      array['con_novedades', 'revisado'],
      array['con_novedades', 'enviado_organismo'],
      array['con_novedades', 'devuelto'],
      array['enviado_organismo', 'trasladado'],
      array['enviado_organismo', 'devuelto']
    ];
  end if;

  -- Transiciones válidas para radicaciones
  if p_tipo_proceso = 'radicacion' then
    transiciones_validas := array[
      array['sin_asignar', 'recibido'],
      array['sin_asignar', 'revisado'],
      array['sin_asignar', 'pendiente_radicar'],
      array['recibido', 'revisado'],
      array['recibido', 'con_novedades'],
      array['revisado', 'con_novedades'],
      array['revisado', 'pendiente_radicar'],
      array['revisado', 'devuelto'],
      array['con_novedades', 'revisado'],
      array['con_novedades', 'pendiente_radicar'],
      array['con_novedades', 'devuelto'],
      array['pendiente_radicar', 'radicado'],
      array['pendiente_radicar', 'devuelto']
    ];
  end if;

  -- Retornar todos los estados permitidos desde el estado actual
  for i in 1..array_length(transiciones_validas, 1) loop
    if transiciones_validas[i][1] = p_estado_actual then
      estado_siguiente := transiciones_validas[i][2];
      return next;
    end if;
  end loop;

  return;
end;
$$;

-- Comentarios
comment on function validar_proceso_unico is 'Valida que un vehículo no tenga dos procesos activos simultáneamente';
comment on function validar_secuencia_procesos is 'Valida la lógica de origen y destino entre traslados y radicaciones';
comment on function validar_transicion_estado is 'Valida que los cambios de estado sean correctos';
comment on function puede_iniciar_proceso is 'Verifica si un vehículo puede iniciar un nuevo proceso';
comment on function obtener_transiciones_validas is 'Retorna los estados válidos a los que se puede transicionar desde un estado actual';
