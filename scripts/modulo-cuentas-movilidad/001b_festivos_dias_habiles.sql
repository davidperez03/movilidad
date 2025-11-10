-- =====================================================
-- MÓDULO: CUENTAS DE MOVILIDAD
-- Archivo: 001b_festivos_dias_habiles.sql
-- Descripción: Festivos colombianos y funciones para
--              cálculo de días hábiles
-- Ejecutar después de: 001_cuentas_schema.sql
-- Ejecutar antes de: 002_procesos_schema.sql
-- =====================================================

-- Crear tabla de festivos colombianos
create table if not exists public.mov_festivos_colombia (
  fecha date primary key,
  nombre text not null,
  tipo text check (tipo in ('religioso', 'civil', 'puente')) not null,
  creado_en timestamp with time zone default now() not null
);

-- Insertar festivos fijos de Colombia (que no cambian de fecha)
insert into public.mov_festivos_colombia (fecha, nombre, tipo) values
  -- 2025
  ('2025-01-01', 'Año Nuevo', 'civil'),
  ('2025-05-01', 'Día del Trabajo', 'civil'),
  ('2025-07-20', 'Día de la Independencia', 'civil'),
  ('2025-08-07', 'Batalla de Boyacá', 'civil'),
  ('2025-12-08', 'Día de la Inmaculada Concepción', 'religioso'),
  ('2025-12-25', 'Navidad', 'religioso'),

  -- Festivos móviles 2025 (se trasladan al lunes siguiente)
  ('2025-01-06', 'Reyes Magos', 'religioso'), -- Lunes
  ('2025-03-24', 'San José', 'religioso'), -- Lunes
  ('2025-04-17', 'Jueves Santo', 'religioso'),
  ('2025-04-18', 'Viernes Santo', 'religioso'),
  ('2025-06-02', 'Ascensión del Señor', 'religioso'), -- Lunes
  ('2025-06-23', 'Corpus Christi', 'religioso'), -- Lunes
  ('2025-06-30', 'Sagrado Corazón de Jesús', 'religioso'), -- Lunes
  ('2025-08-18', 'Asunción de la Virgen', 'religioso'), -- Lunes
  ('2025-10-13', 'Día de la Raza', 'civil'), -- Lunes
  ('2025-11-03', 'Todos los Santos', 'religioso'), -- Lunes
  ('2025-11-17', 'Independencia de Cartagena', 'civil'), -- Lunes

  -- 2026
  ('2026-01-01', 'Año Nuevo', 'civil'),
  ('2026-01-12', 'Reyes Magos', 'religioso'), -- Lunes
  ('2026-03-23', 'San José', 'religioso'), -- Lunes
  ('2026-04-02', 'Jueves Santo', 'religioso'),
  ('2026-04-03', 'Viernes Santo', 'religioso'),
  ('2026-05-01', 'Día del Trabajo', 'civil'),
  ('2026-05-18', 'Ascensión del Señor', 'religioso'), -- Lunes
  ('2026-06-08', 'Corpus Christi', 'religioso'), -- Lunes
  ('2026-06-15', 'Sagrado Corazón de Jesús', 'religioso'), -- Lunes
  ('2026-06-29', 'San Pedro y San Pablo', 'religioso'), -- Lunes
  ('2026-07-20', 'Día de la Independencia', 'civil'),
  ('2026-08-07', 'Batalla de Boyacá', 'civil'),
  ('2026-08-17', 'Asunción de la Virgen', 'religioso'), -- Lunes
  ('2026-10-12', 'Día de la Raza', 'civil'), -- Lunes
  ('2026-11-02', 'Todos los Santos', 'religioso'), -- Lunes
  ('2026-11-16', 'Independencia de Cartagena', 'civil'), -- Lunes
  ('2026-12-08', 'Día de la Inmaculada Concepción', 'religioso'),
  ('2026-12-25', 'Navidad', 'religioso'),

  -- 2027
  ('2027-01-01', 'Año Nuevo', 'civil'),
  ('2027-01-11', 'Reyes Magos', 'religioso'), -- Lunes
  ('2027-03-22', 'San José', 'religioso'), -- Lunes
  ('2027-03-25', 'Jueves Santo', 'religioso'),
  ('2027-03-26', 'Viernes Santo', 'religioso'),
  ('2027-05-01', 'Día del Trabajo', 'civil'),
  ('2027-05-10', 'Ascensión del Señor', 'religioso'), -- Lunes
  ('2027-05-31', 'Corpus Christi', 'religioso'), -- Lunes
  ('2027-06-07', 'Sagrado Corazón de Jesús', 'religioso'), -- Lunes
  ('2027-06-28', 'San Pedro y San Pablo', 'religioso'), -- Lunes
  ('2027-07-20', 'Día de la Independencia', 'civil'),
  ('2027-08-07', 'Batalla de Boyacá', 'civil'),
  ('2027-08-16', 'Asunción de la Virgen', 'religioso'), -- Lunes
  ('2027-10-11', 'Día de la Raza', 'civil'), -- Lunes
  ('2027-11-01', 'Todos los Santos', 'religioso'), -- Lunes
  ('2027-11-15', 'Independencia de Cartagena', 'civil'), -- Lunes
  ('2027-12-08', 'Día de la Inmaculada Concepción', 'religioso'),
  ('2027-12-25', 'Navidad', 'religioso')

  -- NOTA: Para años posteriores a 2027, se deben añadir los festivos correspondientes
  -- Festivos fijos de Colombia que se repiten cada año:
  --   * 1 de enero: Año Nuevo
  --   * 1 de mayo: Día del Trabajo
  --   * 20 de julio: Día de la Independencia
  --   * 7 de agosto: Batalla de Boyacá
  --   * 8 de diciembre: Inmaculada Concepción
  --   * 25 de diciembre: Navidad
  --
  -- Festivos móviles (se trasladan al lunes siguiente según Ley Emiliani):
  --   * Reyes Magos (6 de enero)
  --   * San José (19 de marzo)
  --   * Jueves Santo y Viernes Santo (dependen de Semana Santa)
  --   * Ascensión del Señor (43 días después del Domingo de Pascua)
  --   * Corpus Christi (64 días después del Domingo de Pascua)
  --   * Sagrado Corazón (71 días después del Domingo de Pascua)
  --   * San Pedro y San Pablo (29 de junio)
  --   * Asunción de la Virgen (15 de agosto)
  --   * Día de la Raza (12 de octubre)
  --   * Todos los Santos (1 de noviembre)
  --   * Independencia de Cartagena (11 de noviembre)
  --
  -- Para calcular festivos móviles usar:
  -- INSERT INTO mov_festivos_colombia (fecha, nombre, tipo) VALUES
  -- ('YYYY-MM-DD', 'Nombre del festivo', 'religioso' o 'civil')
  -- ON CONFLICT (fecha) DO NOTHING;

on conflict (fecha) do nothing;

-- Función para verificar si una fecha es día hábil en Colombia
create or replace function es_dia_habil(fecha date)
returns boolean
language plpgsql
immutable
as $$
declare
  dia_semana integer;
begin
  -- Obtener día de la semana (0=domingo, 6=sábado)
  dia_semana := extract(dow from fecha);

  -- Si es sábado o domingo, no es hábil
  if dia_semana = 0 or dia_semana = 6 then
    return false;
  end if;

  -- Verificar si es festivo
  if exists (select 1 from public.mov_festivos_colombia where mov_festivos_colombia.fecha = es_dia_habil.fecha) then
    return false;
  end if;

  return true;
end;
$$;

-- Función para sumar días hábiles a una fecha
create or replace function sumar_dias_habiles(
  fecha_inicio date,
  dias_habiles integer
)
returns date
language plpgsql
immutable
as $$
declare
  fecha_actual date;
  dias_contados integer;
begin
  fecha_actual := fecha_inicio;
  dias_contados := 0;

  while dias_contados < dias_habiles loop
    fecha_actual := fecha_actual + interval '1 day';

    if es_dia_habil(fecha_actual) then
      dias_contados := dias_contados + 1;
    end if;
  end loop;

  return fecha_actual;
end;
$$;

-- Función para contar días hábiles entre dos fechas
create or replace function contar_dias_habiles(
  fecha_inicio date,
  fecha_fin date
)
returns integer
language plpgsql
immutable
as $$
declare
  fecha_actual date;
  dias_contados integer;
begin
  if fecha_fin < fecha_inicio then
    return 0;
  end if;

  fecha_actual := fecha_inicio;
  dias_contados := 0;

  while fecha_actual < fecha_fin loop
    fecha_actual := fecha_actual + interval '1 day';

    if es_dia_habil(fecha_actual) then
      dias_contados := dias_contados + 1;
    end if;
  end loop;

  return dias_contados;
end;
$$;

-- Crear índice para mejorar rendimiento de búsquedas de festivos
create index if not exists idx_mov_festivos_fecha on public.mov_festivos_colombia(fecha);

-- Habilitar RLS
alter table public.mov_festivos_colombia enable row level security;

-- Políticas de seguridad
create policy "Todos pueden ver festivos"
  on public.mov_festivos_colombia for select
  using (true);

create policy "Solo admins pueden modificar festivos"
  on public.mov_festivos_colombia for all
  using (
    es_superadmin(auth.uid())
    or tiene_permiso(auth.uid(), 'movilidad', 'configurar')
  );

-- Comentarios
comment on table public.mov_festivos_colombia is 'Festivos nacionales de Colombia para cálculo de días hábiles';
comment on function es_dia_habil(date) is 'Verifica si una fecha es día hábil (no sábado, domingo ni festivo)';
comment on function sumar_dias_habiles(date, integer) is 'Suma N días hábiles a una fecha inicial';
comment on function contar_dias_habiles(date, date) is 'Cuenta días hábiles entre dos fechas';
