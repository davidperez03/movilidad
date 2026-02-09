-- Función y triggers de auditoría para el módulo de parqueadero

-- ============================================================
-- Función principal: registrar_auditoria_parqueadero
-- ============================================================
create or replace function registrar_auditoria_parqueadero(
  p_vehiculo_id uuid default null,
  p_inspeccion_id uuid default null,
  p_accion text default null,
  p_detalles jsonb default null,
  p_valor_anterior text default null,
  p_valor_nuevo text default null,
  p_realizado_por uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  nuevo_id uuid;
  v_realizado_por uuid;
begin
  v_realizado_por := coalesce(p_realizado_por, auth.uid());

  insert into public.parq_historial_acciones (
    vehiculo_id,
    inspeccion_id,
    accion,
    detalles,
    valor_anterior,
    valor_nuevo,
    realizado_por
  ) values (
    p_vehiculo_id,
    p_inspeccion_id,
    p_accion,
    p_detalles,
    p_valor_anterior,
    p_valor_nuevo,
    v_realizado_por
  )
  returning id into nuevo_id;

  return nuevo_id;
end;
$$;

comment on function registrar_auditoria_parqueadero is
  'Registra una acción en la auditoría del módulo de parqueadero.';

-- ============================================================
-- Trigger: Vehículo creado
-- ============================================================
create or replace function trigger_parq_vehiculo_creado()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform registrar_auditoria_parqueadero(
    new.id,
    null,
    'parq_vehiculo_creado',
    jsonb_build_object(
      'placa', new.placa,
      'marca', new.marca,
      'modelo', new.modelo,
      'tipo', new.tipo
    ),
    null,
    null,
    new.creado_por
  );
  return new;
end;
$$;

-- ============================================================
-- Trigger: Vehículo editado (datos o documentos)
-- ============================================================
create or replace function trigger_parq_vehiculo_editado()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_detalles jsonb := '{}'::jsonb;
  v_cambio boolean := false;
begin
  -- Detectar cambios en datos básicos
  if old.placa is distinct from new.placa then
    v_detalles := v_detalles || jsonb_build_object('placa_anterior', old.placa, 'placa_nueva', new.placa);
    v_cambio := true;
  end if;

  if old.marca is distinct from new.marca then
    v_detalles := v_detalles || jsonb_build_object('marca_anterior', old.marca, 'marca_nueva', new.marca);
    v_cambio := true;
  end if;

  if old.modelo is distinct from new.modelo then
    v_detalles := v_detalles || jsonb_build_object('modelo_anterior', old.modelo, 'modelo_nuevo', new.modelo);
    v_cambio := true;
  end if;

  -- Detectar cambios en documentos
  if old.soat_vencimiento is distinct from new.soat_vencimiento then
    v_detalles := v_detalles || jsonb_build_object('soat_vencimiento_anterior', old.soat_vencimiento, 'soat_vencimiento_nuevo', new.soat_vencimiento);
    v_cambio := true;
  end if;

  if old.tecnomecanica_vencimiento is distinct from new.tecnomecanica_vencimiento then
    v_detalles := v_detalles || jsonb_build_object('tecno_vencimiento_anterior', old.tecnomecanica_vencimiento, 'tecno_vencimiento_nuevo', new.tecnomecanica_vencimiento);
    v_cambio := true;
  end if;

  -- Detectar activación/desactivación (tratamos aparte)
  if old.activo is distinct from new.activo then
    perform registrar_auditoria_parqueadero(
      new.id,
      null,
      case when new.activo then 'parq_vehiculo_activado' else 'parq_vehiculo_desactivado' end,
      jsonb_build_object('placa', new.placa),
      old.activo::text,
      new.activo::text
    );
    -- Si el único cambio fue activo, no registrar edición
    if not v_cambio then
      return new;
    end if;
  end if;

  -- Registrar edición si hubo cambios en datos
  if v_cambio then
    v_detalles := v_detalles || jsonb_build_object('placa', new.placa);
    perform registrar_auditoria_parqueadero(
      new.id,
      null,
      'parq_vehiculo_editado',
      v_detalles
    );
  end if;

  return new;
end;
$$;

-- ============================================================
-- Trigger: Inspección creada
-- ============================================================
create or replace function trigger_parq_inspeccion_creada()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_placa text;
  v_operador text;
  v_inspector text;
begin
  select placa into v_placa from public.parq_vehiculos where id = new.vehiculo_id;
  select nombre_completo into v_operador from public.perfiles where id = new.operador_id;
  select nombre_completo into v_inspector from public.perfiles where id = new.inspector_id;

  perform registrar_auditoria_parqueadero(
    new.vehiculo_id,
    new.id,
    'parq_inspeccion_creada',
    jsonb_build_object(
      'placa', v_placa,
      'consecutivo', new.consecutivo,
      'fecha', new.fecha,
      'turno', new.turno,
      'es_apto', new.es_apto,
      'operador', v_operador,
      'inspector', v_inspector
    ),
    null,
    case when new.es_apto then 'apto' else 'no_apto' end,
    new.creado_por
  );
  return new;
end;
$$;

-- ============================================================
-- Trigger: Novedad subsanada (item marcado como resuelto)
-- ============================================================
create or replace function trigger_parq_novedad_subsanada()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_vehiculo_id uuid;
  v_placa text;
begin
  -- Solo disparar cuando subsanado cambia de false a true
  if old.subsanado is distinct from new.subsanado and new.subsanado = true then
    select i.vehiculo_id into v_vehiculo_id
    from public.parq_inspecciones i
    where i.id = new.inspeccion_id;

    select placa into v_placa from public.parq_vehiculos where id = v_vehiculo_id;

    perform registrar_auditoria_parqueadero(
      v_vehiculo_id,
      new.inspeccion_id,
      'parq_novedad_subsanada',
      jsonb_build_object(
        'placa', v_placa,
        'item_nombre', new.item_nombre,
        'item_categoria', new.item_categoria,
        'estado_original', new.estado,
        'observacion_original', new.observacion,
        'observacion_subsanacion', new.subsanado_observacion
      ),
      new.estado,
      'subsanado',
      new.subsanado_por
    );
  end if;

  return new;
end;
$$;

-- ============================================================
-- Trigger: Datos de personal actualizados
-- ============================================================
create or replace function trigger_parq_personal_actualizado()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nombre text;
  v_correo text;
  v_detalles jsonb := '{}'::jsonb;
begin
  select nombre_completo, correo into v_nombre, v_correo
  from public.perfiles where id = new.perfil_id;

  -- En INSERT registrar todos los datos
  if (TG_OP = 'INSERT') then
    v_detalles := jsonb_build_object(
      'nombre', v_nombre,
      'correo', v_correo,
      'licencia_numero', new.licencia_numero,
      'licencia_categoria', new.licencia_categoria,
      'licencia_vencimiento', new.licencia_vencimiento,
      'documento_tipo', new.documento_tipo,
      'documento_numero', new.documento_numero
    );
  else
    -- En UPDATE registrar solo los cambios
    v_detalles := jsonb_build_object('nombre', v_nombre, 'correo', v_correo);

    if old.licencia_numero is distinct from new.licencia_numero then
      v_detalles := v_detalles || jsonb_build_object('licencia_numero_anterior', old.licencia_numero, 'licencia_numero_nueva', new.licencia_numero);
    end if;

    if old.licencia_categoria is distinct from new.licencia_categoria then
      v_detalles := v_detalles || jsonb_build_object('licencia_categoria_anterior', old.licencia_categoria, 'licencia_categoria_nueva', new.licencia_categoria);
    end if;

    if old.licencia_vencimiento is distinct from new.licencia_vencimiento then
      v_detalles := v_detalles || jsonb_build_object('licencia_vencimiento_anterior', old.licencia_vencimiento, 'licencia_vencimiento_nueva', new.licencia_vencimiento);
    end if;
  end if;

  perform registrar_auditoria_parqueadero(
    null,
    null,
    'parq_personal_actualizado',
    v_detalles
  );

  return new;
end;
$$;
