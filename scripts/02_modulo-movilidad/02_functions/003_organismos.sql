create or replace function update_organismo_search_vector()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('spanish', coalesce(new.nombre, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(new.municipio, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(new.departamento, '')), 'C');
  return new;
end;
$$;
