-- =====================================================
-- MÓDULO: CUENTAS DE MOVILIDAD
-- Archivo: 006_consultas_publicas.sql
-- Descripción: Configuración de acceso público a consultas
-- =====================================================

-- =====================================================
-- VISTA PÚBLICA: Información completa para consultas externas
-- =====================================================

-- Crear vista pública con información completa incluyendo estados finales y observaciones
create or replace view public.mov_vista_consulta_publica as
select distinct on (cv.id)
  cv.placa,
  cv.numero_cuenta,
  cv.tipo_servicio,
  case
    when t.id is not null then 'traslado'
    when r.id is not null then 'radicacion'
    else null
  end as proceso_tipo,
  coalesce(t.id, r.id) as proceso_id,
  coalesce(t.estado, r.estado) as proceso_estado,
  coalesce(t.fecha_tramite, r.fecha_tramite) as fecha_tramite,
  coalesce(t.fecha_vencimiento, r.fecha_vencimiento) as fecha_vencimiento,
  coalesce(t.fecha_completado, r.fecha_completado) as fecha_completado,
  case
    when coalesce(t.fecha_completado, r.fecha_completado) is null
    then coalesce(t.fecha_vencimiento, r.fecha_vencimiento) - current_date
    else null
  end as dias_restantes,
  case
    when t.id is not null then t.ciudad_destino
    when r.id is not null then r.ciudad_origen
    else null
  end as ciudad,
  coalesce(t.observaciones, r.observaciones) as observaciones,
  coalesce(t.creado_en, r.creado_en) as proceso_creado_en
from public.mov_cuentas_vehiculos cv
left join public.mov_traslados t on cv.id = t.cuenta_id
left join public.mov_radicaciones r on cv.id = r.cuenta_id
where t.id is not null or r.id is not null
order by cv.id, coalesce(t.creado_en, r.creado_en) desc;

-- =====================================================
-- POLÍTICAS DE SEGURIDAD PARA ACCESO PÚBLICO
-- =====================================================

-- Política para permitir consultas públicas sin restricciones de estado
-- Actualizar política existente para incluir todos los estados

-- Permitir lectura pública de traslados (TODOS los estados)
drop policy if exists "Acceso público de lectura a traslados" on public.mov_traslados;
create policy "Acceso público de lectura a traslados"
  on public.mov_traslados for select
  using (true); -- Permite ver todos los estados

-- Permitir lectura pública de radicaciones (TODOS los estados)
drop policy if exists "Acceso público de lectura a radicaciones" on public.mov_radicaciones;
create policy "Acceso público de lectura a radicaciones"
  on public.mov_radicaciones for select
  using (true); -- Permite ver todos los estados

-- =====================================================
-- FUNCIÓN PÚBLICA: Consulta por placa con información completa
-- =====================================================

create or replace function public.consultar_vehiculo_por_placa(p_placa text)
returns table (
  placa text,
  numero_cuenta text,
  tipo_servicio text,
  proceso_tipo text,
  proceso_estado text,
  fecha_tramite date,
  fecha_vencimiento date,
  fecha_completado timestamp with time zone,
  dias_restantes integer,
  ciudad text,
  observaciones text
)
language plpgsql
security definer
stable
as $$
begin
  return query
  select
    v.placa,
    v.numero_cuenta,
    v.tipo_servicio,
    v.proceso_tipo,
    v.proceso_estado,
    v.fecha_tramite::date,
    v.fecha_vencimiento::date,
    v.fecha_completado,
    v.dias_restantes,
    v.ciudad,
    v.observaciones
  from public.mov_vista_consulta_publica v
  where upper(v.placa) = upper(p_placa)
  limit 1;
end;
$$;

-- Dar permisos de ejecución a todos los roles
grant execute on function public.consultar_vehiculo_por_placa(text) to anon;
grant execute on function public.consultar_vehiculo_por_placa(text) to authenticated;
grant execute on function public.consultar_vehiculo_por_placa(text) to public;

-- También dar acceso a la vista
grant select on public.mov_vista_consulta_publica to anon;
grant select on public.mov_vista_consulta_publica to authenticated;
grant select on public.mov_vista_consulta_publica to public;

-- =====================================================
-- COMENTARIOS
-- =====================================================

comment on view public.mov_vista_consulta_publica is 'Vista pública con información completa para consultas externas incluyendo estados finales y observaciones';
comment on function public.consultar_vehiculo_por_placa(text) is 'Función pública para consultar estado completo de vehículo por placa, incluyendo observaciones';

-- =====================================================
-- NOTA IMPORTANTE
-- =====================================================

-- Esta configuración permite a cualquier persona consultar el estado de un vehículo
-- incluyendo estados finales (trasladado, radicado, devuelto) y observaciones.
-- Las observaciones son visibles para que los usuarios sepan qué pasó con su trámite.
