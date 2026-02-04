# Scripts de Base de Datos

Scripts SQL para PostgreSQL/Supabase organizados por módulos.

## Estructura

```
scripts/
├── 00_configuracion/
│   ├── 01_config/
│   └── 99_utilities/
│
├── 01_sistema-usuarios/
│   ├── 01_tables/
│   ├── 02_functions/
│   ├── 03_triggers/
│   ├── 04_policies/
│   └── 05_data/
│
├── 02_modulo-movilidad/
│   ├── 01_tables/
│   ├── 02_functions/
│   ├── 03_triggers/
│   ├── 04_policies/
│   ├── 05_data/
│   ├── 06_views/
│   └── 99_utilities/
│
├── 03_modulo-parqueadero/
│   ├── 01_tables/
│   ├── 02_functions/
│   ├── 03_triggers/
│   ├── 04_policies/
│   ├── 05_data/
│   └── 06_views/
│
└── 99_vistas_finales/
```

## Ejecución

```bash
# Ejecutar un módulo completo
./scripts/ejecutar.sh scripts/01_sistema-usuarios
./scripts/ejecutar.sh scripts/02_modulo-movilidad
./scripts/ejecutar.sh scripts/03_modulo-parqueadero
```

## Módulos

### 00_configuracion

Configuración inicial del sistema.

| Carpeta | Descripción |
|---------|-------------|
| 01_config | Timezone America/Bogota |
| 99_utilities | Limpiar BD (solo desarrollo) |

### 01_sistema-usuarios

Sistema de autenticación, perfiles y permisos.

| Tabla | Descripción |
|-------|-------------|
| perfiles | Extiende auth.users con datos adicionales |
| modulos | Catálogo de módulos del sistema |
| roles_modulo | Roles disponibles por módulo |
| usuarios_roles | Asignación de roles a usuarios |
| sys_auditoria | Registro de auditoría |
| sys_sesiones | Sesiones activas |

### 02_modulo-movilidad

Gestión de cuentas, traslados y radicaciones de vehículos.

| Tabla | Descripción |
|-------|-------------|
| mov_cuentas_vehiculos | Cuentas de vehículos |
| mov_festivos_colombia | Festivos para días hábiles |
| mov_organismos_transito | Organismos de tránsito |
| mov_empresas_transporte | Empresas transportadoras |
| mov_traslados | Procesos de traslado |
| mov_radicaciones | Procesos de radicación |
| mov_novedades | Novedades y seguimiento |
| mov_historial_acciones | Historial de acciones |

**Roles:**
- `mov_usuario` - Solo lectura
- `mov_operador` - Crear y editar
- `mov_administrador` - Control total

### 03_modulo-parqueadero

Inspecciones preoperacionales de grúas. Normativa: Res. 315/2013, Dec. 1072/2015.

| Tabla | Descripción |
|-------|-------------|
| parq_vehiculos | Grúas y plataformas |
| parq_items_catalogo | Catálogo de ítems de inspección |
| parq_inspecciones | Inspecciones preoperacionales |
| parq_items_inspeccion | Detalle de ítems inspeccionados |
| parq_datos_personal | Datos adicionales del personal |

**Vistas:**
- `parq_vista_inspecciones` - Inspecciones con datos completos
- `parq_vista_vehiculos` - Vehículos con estado de documentos
- `parq_vista_personal` - Personal con datos de licencia
- `parq_vista_alertas_vencimientos` - Documentos por vencer

**Roles:**
- `parq_operario` - Solo lectura
- `parq_auxiliar` - Crear inspecciones (no requiere licencia)
- `parq_administrador` - Control total

## Convenciones

### Nomenclatura

| Tipo | Prefijo | Ejemplo |
|------|---------|---------|
| Sistema | sys_ | sys_auditoria |
| Movilidad | mov_ | mov_cuentas_vehiculos |
| Parqueadero | parq_ | parq_vehiculos |
| Compartidas | - | perfiles, modulos |

### Estilo SQL

- Minúsculas: `create table`, no `CREATE TABLE`
- Sin headers decorativos
- Solo `comment on` para documentación

### Campos estándar

```sql
creado_en timestamp with time zone default now() not null
actualizado_en timestamp with time zone default now() not null
creado_por uuid references perfiles(id)
```

## Sistema de Roles

**Dos niveles:**

1. **Rol Global** (perfiles.rol_global):
   - `usuario` - Acceso estándar
   - `superadmin` - Acceso total

2. **Roles Modulares** (roles_modulo):
   - Específicos por módulo
   - Permisos granulares en JSONB
   - Un usuario puede tener roles diferentes en cada módulo

## Seguridad

- **RLS** habilitado en todas las tablas
- **SECURITY DEFINER** para funciones que evitan recursión RLS
- **Auditoría automática** de cambios críticos

## Requisitos

- PostgreSQL 12+ (recomendado 14+)
- Extensiones: uuid-ossp, pg_trgm
- Supabase Auth (auth.users)

## Agregar nuevo módulo

```sql
-- 1. Insertar módulo
insert into public.modulos (id, nombre, descripcion, ruta, icono)
values ('nuevo', 'Nuevo Módulo', 'Descripción', '/nuevo', 'icon');

-- 2. Crear roles
insert into public.roles_modulo (modulo_id, codigo, nombre, permisos, nivel)
values
  ('nuevo', 'nuevo_usuario', 'Usuario', '{"ver": true}'::jsonb, 0),
  ('nuevo', 'nuevo_admin', 'Admin', '{"ver": true, "editar": true}'::jsonb, 1);
```

## Zona horaria

Todos los timestamps usan `America/Bogota` (UTC-5).
