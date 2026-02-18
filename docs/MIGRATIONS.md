# Migraciones de Base de Datos

Guía completa para gestionar cambios de esquema y datos en PostgreSQL/Supabase en producción.

## Arquitectura de la BD

### Stack

| Componente | Tecnología | Notas |
|------------|------------|-------|
| Motor | PostgreSQL 14+ (Supabase) | Instancia compartida, schema `public` |
| Autenticación | Supabase Auth (`auth.users`) | JWT, session tokens |
| Autorización | RLS + funciones SECURITY DEFINER | Capas: rol → RLS → permisos JSONB |
| Zona horaria | `America/Bogota` (UTC-5) | Todos los timestamps son `timestamptz` |
| Backups | Automáticos diarios (Supabase) | Retención según plan |

### Esquema de Tablas

```
public
│
├── Sistema (compartido)
│   ├── perfiles              ← extiende auth.users (CASCADE)
│   ├── modulos               ← catálogo de módulos (movilidad, parqueadero)
│   ├── roles_modulo          ← roles por módulo con permisos JSONB
│   ├── usuarios_roles        ← asignación usuario↔módulo↔rol (UNIQUE por par)
│   ├── sys_auditoria         ← log de acciones del sistema
│   └── sys_sesiones          ← sesiones activas con duración calculada (GENERATED)
│
├── Movilidad (mov_)
│   ├── mov_cuentas_vehiculos       ← placa UNIQUE, numero_cuenta auto-generado
│   ├── mov_traslados               ← máquina de estados (7 estados)
│   ├── mov_radicaciones            ← máquina de estados (8 estados)
│   ├── mov_novedades               ← issues con prioridad y resolución
│   ├── mov_adjuntos_novedades      ← archivos adjuntos
│   ├── mov_historial_acciones      ← auditoría del módulo
│   ├── mov_festivos_colombia       ← calendario para días hábiles
│   ├── mov_organismos_transito     ← con TSVECTOR para búsqueda geográfica
│   ├── mov_empresas_transporte     ← catálogo de transportadoras
│   └── mov_notificaciones_radicacion ← control de notificaciones
│
├── Parqueadero (parq_)
│   ├── parq_vehiculos              ← flota con documentos y vencimientos
│   ├── parq_items_catalogo         ← ítems configurables de inspección
│   ├── parq_inspecciones           ← inspecciones con snapshots y firmas base64
│   ├── parq_items_inspeccion       ← resultado por ítem con subsanación
│   ├── parq_datos_personal         ← licencias, documentos, contacto
│   └── parq_historial_acciones     ← auditoría del módulo
│
└── Vistas
    ├── sys_vista_sesiones_activas         (security_invoker)
    ├── sys_vista_resumen_sesiones         (security_invoker)
    ├── sys_vista_auditoria_completa       (UNION de 3 auditorías)
    ├── mov_vista_proceso_activo           (security_invoker, CTEs)
    ├── mov_vista_consulta_publica         (consumida por RPC anon)
    ├── mov_vista_procesos_vencidos        (security_invoker)
    ├── mov_vista_procesos_por_vencer      (security_invoker)
    ├── mov_vista_resumen_novedades        (security_invoker)
    ├── parq_vista_inspecciones            (security_invoker)
    ├── parq_vista_vehiculos               (security_invoker)
    ├── parq_vista_personal                (security_invoker)
    └── parq_vista_alertas_vencimientos    (security_invoker)
```

### Dependencias entre Módulos

```
auth.users (Supabase)
    └─→ perfiles (CASCADE)
            ├─→ usuarios_roles.usuario_id (CASCADE)
            ├─→ sys_auditoria.realizado_por (SET NULL)
            ├─→ sys_sesiones.usuario_id (CASCADE)
            ├─→ mov_cuentas_vehiculos.creado_por (RESTRICT)
            ├─→ mov_traslados.creado_por (RESTRICT)
            ├─→ mov_radicaciones.creado_por (RESTRICT)
            ├─→ parq_inspecciones.operador_id / auxiliar_id / inspector_id
            ├─→ parq_datos_personal.perfil_id (CASCADE)
            └─→ parq_vehiculos.creado_por

modulos
    └─→ roles_modulo.modulo_id (CASCADE)
            └─→ usuarios_roles.rol_id (CASCADE)
```

> **Regla**: Nunca crear FK cross-módulo entre tablas `mov_` y `parq_`. Ambos dependen solo de `perfiles` y `modulos`.

### Modelo de Seguridad (4 capas)

```
Petición HTTP
    │
    ├─ Capa 1: Supabase Auth (JWT)
    │   └─ authenticated vs anon
    │
    ├─ Capa 2: RLS Policies (por tabla)
    │   └─ tiene_acceso_modulo(uid, 'movilidad')
    │   └─ tiene_permiso(uid, 'movilidad', 'crear_cuentas')
    │   └─ es_superadmin(uid)
    │
    ├─ Capa 3: Funciones SECURITY DEFINER
    │   └─ Permisos granulares consultando roles_modulo.permisos (JSONB)
    │
    └─ Capa 4: Hardening global
        └─ REVOKE ALL FROM anon/public
        └─ GRANT explícito solo a authenticated
        └─ Única excepción: consultar_vehiculo_por_placa() → anon
```

---

## Dos Tipos de Scripts

El proyecto separa **setup** (crear la BD desde cero) de **migraciones** (cambios incrementales sobre producción).

```
scripts/
│
├── [Setup: crear BD desde cero]
│   ├── 00_configuracion/           # Timezone America/Bogota
│   ├── 01_sistema-usuarios/        # Auth, perfiles, permisos, auditoría
│   ├── 02_modulo-movilidad/        # Cuentas, traslados, radicaciones
│   ├── 03_modulo-parqueadero/      # Inspecciones, vehículos, personal
│   ├── 99_vistas_finales/          # Vista unificada de auditoría
│   ├── 99_hardening/               # REVOKE ALL + GRANT explícitos
│   └── one-time/                   # Scripts de ejecución única (importar datos históricos)
│
├── [Migraciones incrementales: cambios sobre producción]
│   └── migrations/
│       ├── 001_descripcion.sql     ← primera migración
│       ├── 002_descripcion.sql
│       ├── ...
│       ├── APPLIED.md              ← registro manual de qué se ha aplicado
│       └── README.md
│
└── ejecutar.sh                     # Orquestador (soporta ambos modos)
```

### Setup (BD nueva)

Los scripts de setup crean toda la estructura desde cero. Se ejecutan **una sola vez** por ambiente.

```
scripts/
├── 00_configuracion/           # Timezone America/Bogota, utilidades
│   ├── 01_config/
│   └── 99_utilities/           # ⚠️ NO se ejecuta automáticamente
│
├── 01_sistema-usuarios/        # Auth, perfiles, permisos, auditoría
│   ├── 01_tables/              # perfiles, modulos, roles_modulo, usuarios_roles, sys_*
│   ├── 02_functions/           # timestamps, manejar_usuario, permisos, auditoria, sesiones
│   ├── 03_triggers/            # timestamps, usuario, auditoria
│   ├── 04_policies/            # perfiles_rls, modulos_rls, sesiones_rls, auditoria_rls
│   └── 05_data/                # módulos iniciales (movilidad, parqueadero)
│
├── 02_modulo-movilidad/        # Cuentas, traslados, radicaciones
│   ├── 01_tables/              # cuentas, festivos, organismos, procesos, novedades, historial, notificaciones
│   ├── 02_functions/           # dias_habiles, cuentas, organismos, procesos, novedades, historial, reglas_negocio, consultas_publicas
│   ├── 03_triggers/            # cuentas, organismos, procesos, novedades, notificaciones, reglas_negocio
│   ├── 04_policies/            # RLS para cada tabla
│   ├── 05_data/                # festivos_colombia, empresas_transporte
│   ├── 06_views/               # proceso_activo, resumen_novedades, por_vencer, consulta_publica, vencidos, contadores
│   └── 99_utilities/           # limpiar_datos (manual)
│
├── 03_modulo-parqueadero/      # Inspecciones preoperacionales
│   ├── 01_tables/              # vehiculos, items_catalogo, inspecciones, items_inspeccion, datos_personal, historial
│   ├── 02_functions/           # tiene_rol, get_nombre_perfil, estado_documento, auditoria
│   ├── 03_triggers/            # timestamps, auditoria
│   ├── 04_policies/            # RLS para cada tabla + usuarios_roles
│   ├── 05_data/                # modulo_roles, items_catalogo, storage_bucket
│   └── 06_views/               # inspecciones, vehiculos, personal, alertas_vencimientos
│
├── 99_hardening/               # SIEMPRE se ejecuta al final
│   └── 001_hardening.sql       # REVOKE ALL + GRANT explícitos
│
├── 99_vistas_finales/          # Depende de todos los módulos
│   └── 001_vista_auditoria_completa.sql  # UNION de sys + mov + parq auditorías
│
└── one-time/                   # Scripts de ejecución única
    └── migracion_datos.sql     # 615 cuentas, 595 traslados, 29 radicaciones (Excel→SQL)
```

Orden de ejecución (automático con `npm run db:migrate`):

```
1. 00_configuracion    → timezone
2. 01_sistema-usuarios → tablas base, funciones de permisos
3. 02_modulo-movilidad → tablas, funciones, triggers, policies, datos, vistas
4. 03_modulo-parqueadero → idem
5. 99_vistas_finales   → vista unificada de auditoría (depende de todo)
6. 99_hardening        → REVOKE/GRANT final (SIEMPRE último)
```

Dentro de cada módulo: `01_tables → 02_functions → 03_triggers → 04_policies → 05_data → 06_views`

> Las carpetas `99_utilities/` **nunca** se ejecutan automáticamente. Son herramientas manuales.

### Migraciones Incrementales (`scripts/migrations/`)

Cambios que se aplican sobre una BD de producción que ya tiene datos. **Este es el flujo principal desde v1.7.1.**

```
scripts/migrations/
├── 001_agregar_campo_urgente.sql
├── 002_crear_tabla_documentos.sql
├── 003_rls_documentos.sql
├── 004_actualizar_festivos_2027.sql
├── ...
├── APPLIED.md        ← registro manual
└── README.md
```

#### Nomenclatura

```
NNN_descripcion_breve.sql
```

| Parte | Regla | Ejemplo |
|-------|-------|---------|
| `NNN` | Secuencial, siguiente disponible | `001`, `002`, `015` |
| `descripcion` | snake_case, max 50 chars, verbo + sustantivo | `agregar_campo_urgente` |
| extensión | siempre `.sql` | — |

#### Reglas

1. **Un archivo = un cambio lógico**. No mezclar tabla + policy + datos en un solo script.
2. **Inmutables**: Una vez aplicado en producción, **nunca se modifica**. Si hay que corregir, crear nueva migración.
3. **Idempotentes cuando sea posible**: `IF NOT EXISTS`, `CREATE OR REPLACE`, `ON CONFLICT DO NOTHING`.
4. **Siempre incluir ROLLBACK** comentado al final.
5. **Orden importa**: Se ejecutan en orden numérico. Si 002 depende de 001, el orden natural lo resuelve.
6. **Hardening se re-aplica automáticamente** después de ejecutar migraciones (el script lo hace solo).

#### Registro Manual

Después de ejecutar una migración en producción, registrarla en `scripts/migrations/APPLIED.md`:

```markdown
| 001 | 001_agregar_campo_urgente.sql | 2026-02-20 | Juan | v1.8.0 |
```

#### Cuándo va en `migrations/` vs en los módulos

| Situación | Dónde va |
|-----------|----------|
| La BD de producción ya existe y quiero agregar/cambiar algo | `scripts/migrations/` |
| Estoy creando un módulo completamente nuevo desde cero | `scripts/XX_modulo-nuevo/` (setup) |
| Necesito que un ambiente nuevo incluya el cambio | Ambos: setup + migrations |

> **Regla práctica**: Si el cambio necesita aplicarse sobre una BD que ya tiene datos en producción, va en `migrations/`. Si es solo para ambientes nuevos, va en el módulo.

---

## Convenciones SQL

### Nomenclatura

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Tablas sistema | `sys_` | `sys_auditoria`, `sys_sesiones` |
| Tablas movilidad | `mov_` | `mov_traslados`, `mov_novedades` |
| Tablas parqueadero | `parq_` | `parq_inspecciones`, `parq_vehiculos` |
| Tablas compartidas | sin prefijo | `perfiles`, `modulos`, `roles_modulo` |
| Vistas | `{prefijo}_vista_` | `mov_vista_proceso_activo` |
| Funciones helper | descriptivas | `es_superadmin()`, `tiene_permiso()` |
| Triggers | `trigger_` | `trigger_actualizar_perfiles` |
| Policies | texto descriptivo | `"Todos pueden ver cuentas"` |
| FKs | `{entidad}_id` | `cuenta_id`, `vehiculo_id`, `usuario_id` |
| Timestamps | `{accion}_en` | `creado_en`, `resuelta_en`, `aprobado_en` |
| Auditoría | `{accion}_por` | `creado_por`, `realizado_por` |
| Estados | `estado` | CHECK con valores en snake_case |

### Estilo SQL

```sql
-- minúsculas siempre (no CREATE TABLE, sino create table)
-- indentación con 2 espacios
-- comment on para documentar columnas no obvias

create table if not exists mov_nueva_tabla (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'activo', 'completado')),
  detalles jsonb default '{}',
  creado_por uuid not null references perfiles(id) on delete restrict,
  creado_en timestamptz default now() not null,
  actualizado_en timestamptz default now() not null
);

comment on table mov_nueva_tabla is 'Descripción de la tabla';
```

### Campos Obligatorios en Toda Tabla Nueva

```sql
id             uuid default gen_random_uuid() primary key
creado_en      timestamptz default now() not null
actualizado_en timestamptz default now() not null
creado_por     uuid references perfiles(id)  -- RESTRICT o SET NULL según el caso
```

### Funciones: Patrones Obligatorios

```sql
-- TODA función debe incluir SET search_path = public
create or replace function mi_funcion()
returns void
language plpgsql
set search_path = public
as $$
begin
  -- ...
end;
$$;

-- Funciones de permisos/auditoría → SECURITY DEFINER
-- Funciones de negocio normales → SECURITY INVOKER (default)
```

### Vistas: Patrón Obligatorio

```sql
-- TODA vista nueva debe usar security_invoker
create or replace view mov_vista_ejemplo
with (security_invoker = true)
as
select ...
from mov_tabla t
where ...;
```

---

## Crear una Migración Incremental

### Flujo

```
¿Producción ya tiene la BD corriendo?
│
├─ SÍ → scripts/migrations/NNN_descripcion.sql
│       (un archivo por cambio lógico, secuencial)
│
└─ NO (ambiente nuevo) → scripts/XX_modulo/YY_tipo/ZZZ_archivo.sql
                          (estructura por módulo, setup inicial)
```

### Plantilla Base

```sql
-- =============================================================================
-- Migración: [descripción breve]
-- Módulo:    [sistema-usuarios | movilidad | parqueadero | hardening]
-- Tipo:      [table | function | trigger | policy | data | view]
-- Fecha:     YYYY-MM-DD
-- Versión:   vX.Y.Z
-- Autor:     [nombre]
-- =============================================================================
-- [Descripción detallada: qué cambia, por qué, qué impacto tiene]
-- [Si es destructiva: qué datos se pierden, qué funcionalidad se afecta]

begin;

-- ▼ MIGRACIÓN ▼

-- ... SQL ...

-- ▼ VERIFICACIÓN ▼

-- select ... ; -- query para verificar que el cambio se aplicó

commit;

-- ▼ ROLLBACK (ejecutar manualmente si la migración falla) ▼

-- begin;
-- ... SQL inverso ...
-- commit;
```

### Clasificación de Operaciones

| Operación | Riesgo | Lock | Notas |
|-----------|--------|------|-------|
| `CREATE TABLE IF NOT EXISTS` | Bajo | No | Segura, idempotente |
| `ALTER TABLE ADD COLUMN` | Bajo | Breve | Usar `DEFAULT` para NOT NULL. **No** `IF NOT EXISTS` en PG < 16 |
| `ALTER TABLE ADD COLUMN IF NOT EXISTS` | Bajo | Breve | Solo PG 16+ (Supabase soporta) |
| `CREATE OR REPLACE FUNCTION` | Bajo | No | Reemplaza atómicamente |
| `CREATE OR REPLACE VIEW` | Bajo | No | Reemplaza atómicamente |
| `INSERT ... ON CONFLICT DO NOTHING` | Bajo | No | Idempotente |
| `CREATE POLICY` | Bajo | Breve | Verificar que no exista primero (ver ejemplo) |
| `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER` | Medio | Breve | Patrón obligatorio para triggers |
| `CREATE INDEX CONCURRENTLY` | Medio | No lock | Usar `CONCURRENTLY` en tablas grandes |
| `ALTER TABLE ALTER COLUMN TYPE` | **Alto** | Lock tabla | Requiere rewrite si cambia storage. Probar en staging |
| `ALTER TABLE DROP COLUMN` | **Alto** | Breve | Verificar que código no la use. Deploy código ANTES |
| `DROP TABLE` | **Destructivo** | Lock tabla | Solo con backup verificado |
| `TRUNCATE` | **Destructivo** | Lock tabla | Solo en desarrollo |

---

## Ejemplos de Migraciones Comunes

### 1. Nueva tabla con RLS completo

```sql
-- scripts/migrations/002_crear_tabla_documentos.sql

begin;

create table if not exists mov_documentos (
  id uuid default gen_random_uuid() primary key,
  cuenta_id uuid not null references mov_cuentas_vehiculos(id) on delete cascade,
  tipo text not null check (tipo in ('soat', 'tecnomecanica', 'tarjeta_propiedad')),
  url_archivo text not null,
  nombre_archivo text not null,
  vencimiento date,
  creado_por uuid not null references perfiles(id) on delete restrict,
  creado_en timestamptz default now() not null,
  actualizado_en timestamptz default now() not null
);

alter table mov_documentos enable row level security;

comment on table mov_documentos is 'Documentos digitalizados asociados a cuentas de vehículos';

create index if not exists idx_mov_documentos_cuenta on mov_documentos(cuenta_id);
create index if not exists idx_mov_documentos_vencimiento on mov_documentos(vencimiento);

commit;
```

La tabla necesita trigger + RLS. En migraciones incrementales, crear archivos separados:

```
scripts/migrations/
├── 002_crear_tabla_documentos.sql    ← tabla + índices (este archivo)
├── 003_trigger_documentos.sql        ← trigger de timestamp
├── 004_rls_documentos.sql            ← policies de lectura/escritura
```

> Hardening se re-aplica automáticamente al ejecutar `npm run db:migrate:incremental`.

### 2. Nueva columna en tabla existente

```sql
-- scripts/migrations/005_traslados_agregar_urgente.sql

begin;

alter table mov_traslados
add column if not exists es_urgente boolean default false not null;

comment on column mov_traslados.es_urgente is 'Marca el traslado como prioritario (reduce plazo a 30 días hábiles)';

commit;

-- ROLLBACK:
-- alter table mov_traslados drop column if exists es_urgente;
```

### 3. Nueva función de negocio

```sql
-- scripts/migrations/006_funcion_plazo_urgente.sql

create or replace function calcular_plazo_urgente(p_fecha_inicio date)
returns date
language plpgsql
stable
set search_path = public
as $$
begin
  return sumar_dias_habiles(p_fecha_inicio, 30);
end;
$$;

-- ROLLBACK:
-- drop function if exists calcular_plazo_urgente(date);
```

### 4. Nueva policy RLS (idempotente)

```sql
-- scripts/migrations/004_rls_documentos.sql

do $$
begin
  -- SELECT: usuarios con acceso al módulo
  if not exists (
    select 1 from pg_policies
    where policyname = 'mov_documentos_select' and tablename = 'mov_documentos'
  ) then
    create policy "mov_documentos_select"
    on mov_documentos for select
    using (tiene_acceso_modulo(auth.uid(), 'movilidad'));
  end if;

  -- INSERT: usuarios con permiso de crear
  if not exists (
    select 1 from pg_policies
    where policyname = 'mov_documentos_insert' and tablename = 'mov_documentos'
  ) then
    create policy "mov_documentos_insert"
    on mov_documentos for insert
    with check (
      auth.uid() = creado_por
      and (es_superadmin(auth.uid()) or tiene_permiso(auth.uid(), 'movilidad', 'crear_cuentas'))
    );
  end if;
end $$;

-- ROLLBACK:
-- drop policy if exists "mov_documentos_select" on mov_documentos;
-- drop policy if exists "mov_documentos_insert" on mov_documentos;
```

### 5. Trigger (patrón DROP + CREATE)

```sql
-- scripts/migrations/003_trigger_documentos.sql

create or replace function trigger_actualizar_timestamp_documentos()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

drop trigger if exists trigger_actualizar_documentos on mov_documentos;
create trigger trigger_actualizar_documentos
  before update on mov_documentos
  for each row
  execute function trigger_actualizar_timestamp_documentos();

-- ROLLBACK:
-- drop trigger if exists trigger_actualizar_documentos on mov_documentos;
-- drop function if exists trigger_actualizar_timestamp_documentos();
```

### 6. Datos semilla (idempotente)

```sql
-- scripts/migrations/008_nuevo_item_catalogo.sql

insert into parq_items_catalogo (codigo, nombre, categoria, descripcion, orden, activo)
values
  ('EXT_RETROVISORES', 'RETROVISORES', 'exterior', 'Verificar estado de ambos retrovisores', 45, true)
on conflict (codigo) do nothing;

-- ROLLBACK:
-- delete from parq_items_catalogo where codigo = 'EXT_RETROVISORES';
```

### 7. Migración de datos en tabla existente

```sql
-- scripts/migrations/009_backfill_urgentes.sql
-- Migración: Marcar traslados con plazo < 30 días como urgentes

begin;

-- Contar afectados antes
-- select count(*) from mov_traslados where fecha_vencimiento - fecha_aprobacion < 40;

update mov_traslados
set es_urgente = true
where fecha_aprobacion is not null
  and fecha_vencimiento is not null
  and (fecha_vencimiento - fecha_aprobacion) < 40;

-- Verificar
-- select es_urgente, count(*) from mov_traslados group by es_urgente;

commit;

-- ROLLBACK:
-- update mov_traslados set es_urgente = false where es_urgente = true;
```

---

## Proceso en Producción

### Pre-migración

```
- [ ] Script probado en local o staging
- [ ] Usa IF NOT EXISTS / IF EXISTS / ON CONFLICT donde aplique
- [ ] Incluye sección ROLLBACK comentada
- [ ] Incluye sección VERIFICACIÓN
- [ ] Wrapped en BEGIN/COMMIT si modifica datos
- [ ] Código que consume el cambio ya está deployado (o es backwards-compatible)
- [ ] Verificar backup reciente: Supabase Dashboard → Database → Backups
- [ ] Si es destructiva: comunicar al equipo y definir ventana de mantenimiento
```

### Ejecución

```bash
# Opción A: SQL Editor de Supabase (recomendado para scripts pequeños)
# Copiar contenido del .sql → ejecutar

# Opción B: psql directo (para scripts grandes o con datos)
# Usar la URL non-pooling (NO pooler) para DDL
psql "$SUPABASE_POSTGRES_URL_NON_POOLING" -v ON_ERROR_STOP=1 -f scripts/XX/YY/ZZZ.sql

# Opción C: Script automático (solo para módulos completos)
./scripts/ejecutar.sh 02_modulo-movilidad
```

> **Importante**: Siempre usar la conexión **non-pooling** para DDL (`ALTER TABLE`, `CREATE FUNCTION`, etc.). La conexión con pooler (PgBouncer) puede causar errores con transacciones DDL.

### Post-migración

```
- [ ] Script ejecutó sin errores
- [ ] Cambio verificable en BD (tabla/columna/función existe)
- [ ] App funciona correctamente
- [ ] Si tabla nueva: RLS habilitado + policies creadas
- [ ] Si vista nueva: security_invoker = true
- [ ] Si función nueva: SET search_path = public
- [ ] Hardening re-ejecutado si se creó tabla/función nueva
- [ ] Commit del script al repositorio
```

### Rollback de Emergencia

| Situación | Acción |
|-----------|--------|
| Script tiene ROLLBACK | Ejecutar la sección ROLLBACK del script |
| No hay ROLLBACK escrito | Restaurar backup: Dashboard → Database → Backups |
| Problema en código (no en BD) | Revert del deploy en Vercel: Deployments → Promote anterior |
| Datos corruptos | Restaurar backup + revert deploy + notificar equipo |

> Para migraciones de alto riesgo, crear un backup manual **antes** de ejecutar: Dashboard → Database → Backups → Create backup.

---

## Agregar un Nuevo Módulo

Checklist completo para registrar un módulo nuevo en el sistema:

```sql
-- 1. Registrar módulo
insert into modulos (id, nombre, descripcion, ruta, icono, orden)
values ('nuevo', 'Nuevo Módulo', 'Descripción del módulo', '/nuevo', 'Package', 10);

-- 2. Crear roles del módulo
insert into roles_modulo (modulo_id, codigo, nombre, permisos, nivel) values
  ('nuevo', 'nuevo_usuario',       'Usuario',       '{"ver": true}'::jsonb, 0),
  ('nuevo', 'nuevo_operador',      'Operador',      '{"ver": true, "crear": true, "editar": true}'::jsonb, 1),
  ('nuevo', 'nuevo_administrador', 'Administrador', '{"ver": true, "crear": true, "editar": true, "eliminar": true, "admin": true}'::jsonb, 2);

-- 3. Crear tablas con prefijo nuevo_ (ej: nuevo_entidades)
-- 4. Habilitar RLS en cada tabla
-- 5. Crear policies usando tiene_acceso_modulo(uid, 'nuevo') y tiene_permiso(uid, 'nuevo', 'crear')
-- 6. Crear triggers de timestamps y auditoría
-- 7. Crear vistas con security_invoker = true
-- 8. Re-ejecutar 99_hardening para que GRANT aplique a las tablas nuevas
```

---

## Comandos

```bash
# Setup (ambiente nuevo, BD vacía)
npm run db:migrate                  # Ejecuta TODOS los scripts de setup en orden
npm run db:migrate:parqueadero      # Solo módulo parqueadero

# Migraciones incrementales (producción)
npm run db:migrate:incremental      # Ejecuta scripts/migrations/*.sql en orden
                                    # Muestra lista y pide confirmación antes de ejecutar
                                    # Re-aplica hardening automáticamente al final

# Utilidades
./scripts/ejecutar.sh --status      # Probar conexión a la BD
npm run db:clean                    # Limpiar BD (SOLO desarrollo, requiere confirmación)

# Ejecutar un script específico manualmente
psql "$SUPABASE_POSTGRES_URL_NON_POOLING" -v ON_ERROR_STOP=1 -f scripts/migrations/001_xxx.sql
```

## Queries de Diagnóstico

```sql
-- Listar todas las tablas del schema public
select table_name from information_schema.tables
where table_schema = 'public' order by table_name;

-- Verificar que RLS está habilitado en todas las tablas
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

-- Listar todas las policies
select tablename, policyname, cmd, qual
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- Listar funciones con su security type
select routine_name, security_type
from information_schema.routines
where routine_schema = 'public'
order by routine_name;

-- Verificar vistas con security_invoker
select viewname
from pg_views
where schemaname = 'public'
order by viewname;

-- Tablas sin RLS (debería ser 0 en producción)
select t.tablename
from pg_tables t
left join (select distinct tablename from pg_policies where schemaname = 'public') p
  on t.tablename = p.tablename
where t.schemaname = 'public'
  and p.tablename is null
  and t.tablename not like 'pg_%';

-- Funciones sin search_path (posible vulnerabilidad)
select proname
from pg_proc p
join pg_namespace n on p.pronamespace = n.oid
where n.nspname = 'public'
  and proconfig is null or not ('search_path=public' = any(proconfig));

-- Tamaño de tablas
select relname as tabla,
       pg_size_pretty(pg_total_relation_size(relid)) as tamano
from pg_catalog.pg_statio_user_tables
order by pg_total_relation_size(relid) desc;
```
