create or replace function trigger_marcar_resolucion()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.estado = 'resuelta' and old.estado != 'resuelta' then
    new.resuelta_en := now();
    if new.resuelta_por is null then
      new.resuelta_por := auth.uid();
    end if;
  end if;
  return new;
end;
$$;

create or replace function trigger_actualizar_estado_proceso()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  tiene_pendientes boolean;
begin
  if tg_op = 'INSERT' and new.estado != 'resuelta' then
    if new.proceso_tipo = 'traslado' then
      update public.mov_traslados
      set estado = 'con_novedades'
      where id = new.proceso_id and estado not in ('trasladado', 'devuelto');
    elsif new.proceso_tipo = 'radicacion' then
      update public.mov_radicaciones
      set estado = 'con_novedades'
      where id = new.proceso_id and estado not in ('radicado', 'devuelto');
    end if;
  end if;

  if tg_op = 'UPDATE' and new.estado = 'resuelta' and old.estado != 'resuelta' then
    select exists(
      select 1 from public.mov_novedades
      where proceso_tipo = new.proceso_tipo
      and proceso_id = new.proceso_id
      and estado != 'resuelta'
      and id != new.id
    ) into tiene_pendientes;

    if not tiene_pendientes then
      if new.proceso_tipo = 'traslado' then
        update public.mov_traslados
        set estado = 'revisado'
        where id = new.proceso_id and estado = 'con_novedades';
      elsif new.proceso_tipo = 'radicacion' then
        update public.mov_radicaciones
        set estado = 'revisado'
        where id = new.proceso_id and estado = 'con_novedades';
      end if;
    end if;
  end if;

  return new;
end;
$$;
