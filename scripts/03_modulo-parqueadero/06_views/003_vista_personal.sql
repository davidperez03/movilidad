drop view if exists public.parq_vista_personal;

create view public.parq_vista_personal as
select
  p.id, p.nombre_completo, p.correo,
  rm.codigo as rol_codigo, rm.nombre as rol_nombre,
  dp.licencia_numero, dp.licencia_categoria, dp.licencia_vencimiento, dp.licencia_restricciones,
  dp.documento_tipo, dp.documento_numero, dp.telefono,
  case when rm.codigo = 'parq_auxiliar' then 'no_aplica'
    else parq_estado_documento(dp.licencia_vencimiento)
  end as estado_licencia
from public.usuarios_roles ur
join public.roles_modulo rm on ur.rol_id = rm.id
join public.perfiles p on ur.usuario_id = p.id
left join public.parq_datos_personal dp on dp.perfil_id = p.id
where ur.modulo_id = 'parqueadero'
  and coalesce(p.activo, true) = true;

alter view public.parq_vista_personal set (security_invoker = true);

comment on view public.parq_vista_personal is 'Vista del personal de parqueadero con estado de licencia';
