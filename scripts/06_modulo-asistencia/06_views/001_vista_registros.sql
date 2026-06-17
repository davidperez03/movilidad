create or replace view public.asist_vista_registros as
  select
    r.id,
    r.tipo,
    r.timestamp,
    r.punto,
    r.user_agent,
    p.id              as usuario_id,
    p.documento_tipo,
    p.documento_numero,
    p.nombre_completo,
    p.url_avatar,
    rm.nombre         as rol_nombre
  from public.asist_registros          r
  join public.perfiles                  p on p.id = r.usuario_id
  left join public.usuarios_roles      ur on ur.usuario_id = p.id and ur.modulo_id = 'parqueadero'
  left join public.roles_modulo        rm on rm.id = ur.rol_id
  order by r.timestamp desc;

alter view public.asist_vista_registros set (security_invoker = true);
