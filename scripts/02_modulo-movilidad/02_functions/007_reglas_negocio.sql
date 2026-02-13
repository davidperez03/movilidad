
create or replace function validar_proceso_unico()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  tiene_traslado_activo boolean;
  tiene_radicacion_activa boolean;
begin
  select exists(
    select 1 from public.mov_traslados
    where cuenta_id = new.cuenta_id
    and estado not in ('sin_asignar', 'trasladado', 'devuelto')
  ) into tiene_traslado_activo;

  select exists(
    select 1 from public.mov_radicaciones
    where cuenta_id = new.cuenta_id
    and estado not in ('sin_asignar', 'radicado', 'devuelto')
  ) into tiene_radicacion_activa;

  if tg_table_name = 'mov_traslados' and tiene_radicacion_activa then
    raise exception 'El vehículo ya tiene un proceso de radicación activo. No puede iniciar un traslado.';
  end if;

  if tg_table_name = 'mov_radicaciones' and tiene_traslado_activo then
    raise exception 'El vehículo ya tiene un proceso de traslado activo. No puede iniciar una radicación.';
  end if;

  return new;
end;
$$;

create or replace function validar_secuencia_procesos()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  ultimo_tipo text;
  ultimo_estado text;
  ultimo_fecha timestamp with time zone;
begin
  with ultimos_procesos as (
    select
      'traslado' as tipo,
      estado,
      creado_en
    from public.mov_traslados
    where cuenta_id = new.cuenta_id
      and estado in ('trasladado', 'devuelto')

    union all

    select
      'radicacion' as tipo,
      estado,
      creado_en
    from public.mov_radicaciones
    where cuenta_id = new.cuenta_id
      and estado in ('radicado', 'devuelto')
  )
  select tipo, estado, creado_en
  into ultimo_tipo, ultimo_estado, ultimo_fecha
  from ultimos_procesos
  order by creado_en desc
  limit 1;

  if found then
    if ultimo_tipo = 'radicacion' and ultimo_estado = 'radicado' then
      if tg_table_name = 'mov_radicaciones' then
        raise exception 'Este vehículo fue radicado previamente. Debe ser trasladado primero antes de otra radicación.';
      end if;
    end if;

    if ultimo_tipo = 'traslado' and ultimo_estado = 'trasladado' then
      if tg_table_name = 'mov_traslados' then
        raise exception 'Este vehículo fue trasladado previamente. Debe ser radicado primero antes de otro traslado.';
      end if;
    end if;

  end if;

  return new;
end;
$$;

create or replace function validar_transicion_estado()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  transicion_valida boolean := false;
  i integer;
  transiciones_validas text[][];
  estados_permitidos text := '';
begin
  if tg_table_name = 'mov_traslados' then
    transiciones_validas := array[
      array['sin_asignar', 'revisado'],
      array['sin_asignar', 'con_novedades'],
      array['sin_asignar', 'aprobado'],
      array['revisado', 'con_novedades'],
      array['revisado', 'aprobado'],
      array['revisado', 'devuelto'],
      array['con_novedades', 'revisado'],
      array['con_novedades', 'aprobado'],
      array['con_novedades', 'devuelto'],
      array['aprobado', 'enviado_organismo'],
      array['aprobado', 'devuelto'],
      array['enviado_organismo', 'trasladado'],
      array['enviado_organismo', 'devuelto']
    ];
  end if;

  if tg_table_name = 'mov_radicaciones' then
    transiciones_validas := array[
      array['sin_asignar', 'recibido'],
      array['sin_asignar', 'revisado'],
      array['sin_asignar', 'pendiente_radicar'],
      array['recibido', 'revisado'],
      array['recibido', 'con_novedades'],
      array['revisado', 'con_novedades'],
      array['revisado', 'pendiente_radicar'],
      array['revisado', 'enviado_devolucion'],
      array['con_novedades', 'revisado'],
      array['con_novedades', 'pendiente_radicar'],
      array['con_novedades', 'enviado_devolucion'],
      array['pendiente_radicar', 'radicado'],
      array['pendiente_radicar', 'enviado_devolucion'],
      array['enviado_devolucion', 'devuelto']
    ];
  end if;

  if old.estado != new.estado then
    for i in 1..array_length(transiciones_validas, 1) loop
      if transiciones_validas[i][1] = old.estado and transiciones_validas[i][2] = new.estado then
        transicion_valida := true;
        exit;
      end if;

      if transiciones_validas[i][1] = old.estado then
        if estados_permitidos = '' then
          estados_permitidos := transiciones_validas[i][2];
        else
          estados_permitidos := estados_permitidos || ', ' || transiciones_validas[i][2];
        end if;
      end if;
    end loop;

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

    -- Reglas de negocio: para finalizar una radicación como devuelta,
    -- deben existir datos logísticos de devolución (empresa + guía).
    if tg_table_name = 'mov_radicaciones' and new.estado = 'devuelto' then
      if new.empresa_transportadora_id is null or nullif(btrim(new.numero_guia), '') is null then
        raise exception 'Para marcar una radicación como devuelta debe registrar empresa transportadora y número de guía';
      end if;
    end if;

  end if;

  return new;
end;
$$;

create or replace function validar_proceso_no_finalizado()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_table_name = 'mov_traslados' and old.estado in ('trasladado', 'devuelto') then
    raise exception 'No se puede modificar un traslado que ya fue % el %',
      case when old.estado = 'trasladado' then 'completado' else 'devuelto' end,
      old.fecha_completado::date;
  end if;

  if tg_table_name = 'mov_radicaciones' and old.estado in ('radicado', 'devuelto') then
    raise exception 'No se puede modificar una radicación que ya fue % el %',
      case when old.estado = 'radicado' then 'completada' else 'devuelta' end,
      old.fecha_completado::date;
  end if;

  return new;
end;
$$;

create or replace function obtener_estado_vehiculo(p_cuenta_id uuid)
returns table (
  tiene_proceso_activo boolean,
  tipo_proceso text,
  estado_proceso text,
  dias_restantes integer,
  tiene_novedades_pendientes boolean
)
language plpgsql
set search_path = public
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

create or replace function puede_iniciar_proceso(
  p_placa text,
  p_tipo_proceso text -- 'traslado' o 'radicacion'
)
returns table (
  puede_iniciar boolean,
  razon text
)
language plpgsql
set search_path = public
as $$
declare
  v_cuenta_id uuid;
  v_estado record;
begin
  select id into v_cuenta_id
  from public.mov_cuentas_vehiculos
  where placa = p_placa;

  if not found then
    return query select false, 'El vehículo no existe en el sistema';
    return;
  end if;

  select * into v_estado
  from obtener_estado_vehiculo(v_cuenta_id);

  if v_estado.tiene_proceso_activo then
    return query select
      false,
      format('El vehículo tiene un proceso de %s activo en estado: %s',
        v_estado.tipo_proceso,
        v_estado.estado_proceso
      );
    return;
  end if;

  return query select true, 'El vehículo puede iniciar el proceso'::text;
end;
$$;

create or replace function obtener_transiciones_validas(
  p_estado_actual text,
  p_tipo_proceso text -- 'traslado' o 'radicacion'
)
returns table (
  estado_siguiente text
)
language plpgsql
set search_path = public
as $$
declare
  transiciones_validas text[][];
  i integer;
begin
  if p_tipo_proceso = 'traslado' then
    transiciones_validas := array[
      array['sin_asignar', 'revisado'],
      array['sin_asignar', 'con_novedades'],
      array['sin_asignar', 'aprobado'],
      array['revisado', 'con_novedades'],
      array['revisado', 'aprobado'],
      array['revisado', 'devuelto'],
      array['con_novedades', 'revisado'],
      array['con_novedades', 'aprobado'],
      array['con_novedades', 'devuelto'],
      array['aprobado', 'enviado_organismo'],
      array['aprobado', 'devuelto'],
      array['enviado_organismo', 'trasladado'],
      array['enviado_organismo', 'devuelto']
    ];
  end if;

  if p_tipo_proceso = 'radicacion' then
    transiciones_validas := array[
      array['sin_asignar', 'recibido'],
      array['sin_asignar', 'revisado'],
      array['sin_asignar', 'pendiente_radicar'],
      array['recibido', 'revisado'],
      array['recibido', 'con_novedades'],
      array['revisado', 'con_novedades'],
      array['revisado', 'pendiente_radicar'],
      array['revisado', 'enviado_devolucion'],
      array['con_novedades', 'revisado'],
      array['con_novedades', 'pendiente_radicar'],
      array['con_novedades', 'enviado_devolucion'],
      array['pendiente_radicar', 'radicado'],
      array['pendiente_radicar', 'enviado_devolucion'],
      array['enviado_devolucion', 'devuelto']
    ];
  end if;

  for i in 1..array_length(transiciones_validas, 1) loop
    if transiciones_validas[i][1] = p_estado_actual then
      estado_siguiente := transiciones_validas[i][2];
      return next;
    end if;
  end loop;

  return;
end;
$$;

comment on function validar_proceso_unico is 'Valida que un vehículo no tenga dos procesos activos simultáneamente';
comment on function validar_secuencia_procesos is 'Valida la lógica de origen y destino entre traslados y radicaciones';
comment on function validar_transicion_estado is 'Valida que los cambios de estado sean correctos';
comment on function puede_iniciar_proceso is 'Verifica si un vehículo puede iniciar un nuevo proceso';
comment on function obtener_transiciones_validas is 'Retorna los estados válidos a los que se puede transicionar desde un estado actual';
