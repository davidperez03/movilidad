-- ============================================================
-- FIX: Supabase Linter - Security issues
-- Copiar y pegar completo en Supabase SQL Editor
-- ============================================================

-- === 1. VISTAS: Cambiar de SECURITY DEFINER a SECURITY INVOKER ===

ALTER VIEW public.parq_vista_inspecciones SET (security_invoker = true);
ALTER VIEW public.parq_vista_vehiculos SET (security_invoker = true);
ALTER VIEW public.parq_vista_personal SET (security_invoker = true);
ALTER VIEW public.parq_vista_alertas_vencimientos SET (security_invoker = true);
ALTER VIEW public.sys_vista_auditoria_completa SET (security_invoker = true);

-- === 2. FUNCIONES: Agregar SET search_path = public ===

-- parq_tiene_rol
create or replace function public.parq_tiene_rol(user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.usuarios_roles
    where usuario_id = user_id
    and modulo_id = 'parqueadero'
  );
$$;

-- parq_get_nombre_perfil
create or replace function public.parq_get_nombre_perfil(perfil_id uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select nombre_completo from public.perfiles where id = perfil_id;
$$;

-- parq_estado_documento (sin fecha ref)
create or replace function public.parq_estado_documento(fecha_venc date)
returns text
language sql
stable
set search_path = public
as $$
  select case
    when fecha_venc is null then 'sin_datos'
    when fecha_venc < current_date then 'vencido'
    when fecha_venc <= current_date + 30 then 'por_vencer'
    else 'vigente'
  end;
$$;

-- parq_estado_documento (con fecha ref)
create or replace function public.parq_estado_documento(fecha_venc date, fecha_ref date)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when fecha_venc is null then 'sin_datos'
    when fecha_venc < fecha_ref then 'vencido'
    when fecha_venc <= fecha_ref + 30 then 'por_vencer'
    else 'vigente'
  end;
$$;

-- parq_actualizar_timestamp
create or replace function public.parq_actualizar_timestamp()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

-- parq_generar_consecutivo
create or replace function public.parq_generar_consecutivo()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_fecha text;
  v_secuencia int;
  v_consecutivo text;
begin
  v_fecha := to_char(new.fecha, 'YYYY-MM-DD');

  select coalesce(max(
    nullif(split_part(consecutivo, '-', 4), '')::int
  ), 0) + 1
  into v_secuencia
  from public.parq_inspecciones
  where fecha = new.fecha;

  v_consecutivo := v_fecha || '-' || lpad(v_secuencia::text, 3, '0');

  new.consecutivo := v_consecutivo;
  return new;
end;
$$;
