# Scripts de Base de Datos - Sistema de Movilidad

Scripts SQL organizados profesionalmente para PostgreSQL/Supabase.

## Estructura de Organización

Los scripts están organizados por **módulos funcionales**, y dentro de cada módulo se separan por **tipo de objeto de base de datos**:

```
scripts/
├── 00_configuracion/           # Configuración inicial del sistema
│   ├── 01_config/              # Configuración de PostgreSQL
│   └── 99_utilities/           # Utilidades de mantenimiento
│
├── 01_sistema-usuarios/        # Sistema de autenticación y permisos
│   ├── 01_tables/              # Tablas del módulo
│   ├── 02_functions/           # Funciones PL/pgSQL
│   ├── 03_triggers/            # Triggers automáticos
│   ├── 04_policies/            # Políticas Row Level Security
│   └── 05_data/                # Datos iniciales
│
├── 02_modulo-movilidad/        # Módulo principal de movilidad
│   ├── 01_tables/              # Tablas del módulo
│   ├── 02_functions/           # Funciones PL/pgSQL
│   ├── 03_triggers/            # Triggers automáticos
│   ├── 04_policies/            # Políticas Row Level Security
│   ├── 05_data/                # Datos iniciales
│   ├── 06_views/               # Vistas de consulta
│   └── 99_utilities/           # Utilidades del módulo
│
└── 99_vistas_finales/          # Vistas consolidadas del sistema
```

---

## Orden de Ejecución Completo

### Paso 1: Configuración (00_configuracion/)

#### 01_config/ - Configuración PostgreSQL
```bash
psql -f 00_configuracion/01_config/001_timezone.sql
```
- Establece zona horaria `America/Bogota` (UTC-5)
- Debe ejecutarse **primero** antes que cualquier otro script

#### 99_utilities/ - Utilidades (OPCIONAL)
```bash
# ⚠️ ADVERTENCIA: Esto ELIMINA TODA la base de datos
psql -f 00_configuracion/99_utilities/001_limpiar_bd.sql
```
- Solo usar en desarrollo para resetear la BD completamente

---

### Paso 2: Sistema de Usuarios (01_sistema-usuarios/)

Ejecutar **en orden** dentro de cada subcarpeta:

#### 01_tables/ - Tablas Base
```bash
psql -f 01_sistema-usuarios/01_tables/001_perfiles.sql
psql -f 01_sistema-usuarios/01_tables/002_modulos.sql
psql -f 01_sistema-usuarios/01_tables/003_auditoria.sql
psql -f 01_sistema-usuarios/01_tables/004_sesiones.sql
```

**Crea:**
- `perfiles` - Perfiles de usuarios (extiende auth.users)
- `modulos` - Catálogo de módulos del sistema
- `roles_modulo` - Roles disponibles por módulo
- `usuarios_roles` - Asignación de roles a usuarios
- `sys_auditoria` - Registro de auditoría del sistema
- `sys_sesiones` - Gestión de sesiones activas

#### 02_functions/ - Funciones PL/pgSQL
```bash
psql -f 01_sistema-usuarios/02_functions/001_actualizar_timestamps.sql
psql -f 01_sistema-usuarios/02_functions/002_manejar_usuario.sql
psql -f 01_sistema-usuarios/02_functions/003_permisos.sql
psql -f 01_sistema-usuarios/02_functions/004_auditoria.sql
psql -f 01_sistema-usuarios/02_functions/005_sesiones.sql
```

**Funciones principales:**
- Actualización automática de timestamps
- Creación automática de perfil al registrarse
- Verificación de permisos (`es_superadmin`, `tiene_permiso`, etc.)
- Registro automático de auditoría
- Gestión de sesiones y tokens JWT

#### 03_triggers/ - Triggers Automáticos
```bash
psql -f 01_sistema-usuarios/03_triggers/001_triggers_timestamps.sql
psql -f 01_sistema-usuarios/03_triggers/002_trigger_usuario.sql
psql -f 01_sistema-usuarios/03_triggers/003_triggers_auditoria.sql
```

**Automatiza:**
- Actualización de campo `actualizado_en`
- Creación de perfil al registrar usuario en Supabase Auth
- Registro de cambios en auditoría

#### 04_policies/ - Row Level Security (RLS)
```bash
psql -f 01_sistema-usuarios/04_policies/001_perfiles_rls.sql
psql -f 01_sistema-usuarios/04_policies/002_modulos_rls.sql
psql -f 01_sistema-usuarios/04_policies/003_auditoria_rls.sql
psql -f 01_sistema-usuarios/04_policies/004_sesiones_rls.sql
```

**Controla acceso a nivel de fila:**
- Usuarios pueden ver/editar su propio perfil
- Superadmins pueden ver/editar todo
- Usuarios solo ven sus propios roles y sesiones

#### 05_data/ - Datos Iniciales
```bash
psql -f 01_sistema-usuarios/05_data/001_modulos_iniciales.sql
```

**Inserta:**
- Módulo "movilidad" con 3 roles:
  - `mov_usuario` - Solo ver (nivel 0)
  - `mov_operador` - Crear y editar (nivel 1)
  - `mov_administrador` - Control total (nivel 2)

---

### Paso 3: Módulo de Movilidad (02_modulo-movilidad/)

Ejecutar **en orden** dentro de cada subcarpeta:

#### 01_tables/ - Tablas del Módulo
```bash
psql -f 02_modulo-movilidad/01_tables/001_cuentas.sql
psql -f 02_modulo-movilidad/01_tables/002_festivos.sql
psql -f 02_modulo-movilidad/01_tables/003_organismos.sql
psql -f 02_modulo-movilidad/01_tables/004_procesos.sql
psql -f 02_modulo-movilidad/01_tables/005_novedades.sql
psql -f 02_modulo-movilidad/01_tables/006_historial.sql
```

**Crea:**
- `mov_cuentas_vehiculos` - Cuentas de movilidad (número auto-generado)
- `mov_festivos_colombia` - Festivos colombianos para cálculo de días hábiles
- `mov_organismos_transito` - Organismos de tránsito con búsqueda full-text
- `mov_empresas_transporte` - Empresas transportadoras
- `mov_traslados` - Procesos de traslado de vehículos
- `mov_radicaciones` - Procesos de radicación de documentos
- `mov_novedades` - Sistema de novedades y seguimiento
- `mov_adjuntos_novedades` - Adjuntos de novedades
- `mov_historial_acciones` - Historial completo de acciones

#### 02_functions/ - Funciones del Negocio
```bash
psql -f 02_modulo-movilidad/02_functions/001_dias_habiles.sql
psql -f 02_modulo-movilidad/02_functions/002_cuentas.sql
psql -f 02_modulo-movilidad/02_functions/003_organismos.sql
psql -f 02_modulo-movilidad/02_functions/004_procesos.sql
psql -f 02_modulo-movilidad/02_functions/005_novedades.sql
psql -f 02_modulo-movilidad/02_functions/006_historial.sql
psql -f 02_modulo-movilidad/02_functions/007_reglas_negocio.sql
psql -f 02_modulo-movilidad/02_functions/008_consultas_publicas.sql
```

**Funciones principales:**
- Cálculo de días hábiles (considerando festivos)
- Generación automática de número de cuenta
- Búsqueda vectorial de organismos
- Cálculo de vencimientos de procesos
- Registro automático en historial
- Validación de reglas de negocio
- Consultas públicas de vehículos

#### 03_triggers/ - Automatización de Procesos
```bash
psql -f 02_modulo-movilidad/03_triggers/001_triggers_cuentas.sql
psql -f 02_modulo-movilidad/03_triggers/002_triggers_organismos.sql
psql -f 02_modulo-movilidad/03_triggers/003_triggers_procesos.sql
psql -f 02_modulo-movilidad/03_triggers/004_triggers_novedades.sql
psql -f 02_modulo-movilidad/03_triggers/005_triggers_reglas_negocio.sql
```

**Automatiza:**
- Generación de número de cuenta al crear
- Actualización de vector de búsqueda de organismos
- Cálculo automático de fecha de vencimiento
- Validación de estados y transiciones
- Registro automático en historial
- Validación de reglas de negocio (proceso único, secuencia correcta)

#### 04_policies/ - Seguridad por Roles
```bash
psql -f 02_modulo-movilidad/04_policies/001_cuentas_rls.sql
psql -f 02_modulo-movilidad/04_policies/002_festivos_rls.sql
psql -f 02_modulo-movilidad/04_policies/003_organismos_rls.sql
psql -f 02_modulo-movilidad/04_policies/004_procesos_rls.sql
psql -f 02_modulo-movilidad/04_policies/005_novedades_rls.sql
psql -f 02_modulo-movilidad/04_policies/006_historial_rls.sql
```

**Control de acceso por rol:**
- `mov_usuario`: Solo lectura
- `mov_operador`: Crear y actualizar sus propios registros
- `mov_administrador`: Control total del módulo
- Consultas públicas sin autenticación

#### 05_data/ - Datos Iniciales
```bash
psql -f 02_modulo-movilidad/05_data/001_festivos_colombia.sql
psql -f 02_modulo-movilidad/05_data/002_empresas_transporte.sql
```

**Inserta:**
- 58 festivos colombianos (2025-2027)
- Empresa INTERRAPIDISIMO

#### 06_views/ - Vistas de Consulta
```bash
psql -f 02_modulo-movilidad/06_views/001_vista_proceso_activo.sql
psql -f 02_modulo-movilidad/06_views/002_vista_resumen_novedades.sql
psql -f 02_modulo-movilidad/06_views/003_vista_procesos_por_vencer.sql
psql -f 02_modulo-movilidad/06_views/004_vista_consulta_publica.sql
```

**Vistas disponibles:**
- `mov_vista_proceso_activo` - Proceso activo por vehículo
- `mov_vista_resumen_novedades` - Resumen de novedades
- `mov_vista_procesos_por_vencer` - Procesos próximos a vencer
- `mov_vista_consulta_publica` - Consulta pública de vehículos (acceso anónimo)

#### 99_utilities/ - Utilidades del Módulo
```bash
# ⚠️ ADVERTENCIA: Solo usar en desarrollo
psql -f 02_modulo-movilidad/99_utilities/001_limpiar_datos.sql
```

---

### Paso 4: Vistas Finales (99_vistas_finales/)

```bash
psql -f 99_vistas_finales/001_vista_auditoria_completa.sql
```

**Crea:**
- `sys_vista_auditoria_completa` - Vista consolidada de toda la auditoría del sistema

---

## Script de Ejecución Automática

### Ejecución completa en orden correcto:

```bash
#!/bin/bash
# Script para ejecutar todos los scripts en orden

SCRIPTS_DIR="/workspaces/movilidad/scripts"
DB_CONN="postgresql://user:password@host:5432/database"

echo "=== 1. CONFIGURACIÓN ==="
psql $DB_CONN -f "$SCRIPTS_DIR/00_configuracion/01_config/001_timezone.sql"

echo ""
echo "=== 2. SISTEMA DE USUARIOS ==="
for dir in 01_tables 02_functions 03_triggers 04_policies 05_data; do
  echo "--- $dir ---"
  for file in "$SCRIPTS_DIR/01_sistema-usuarios/$dir"/*.sql; do
    [ -f "$file" ] && psql $DB_CONN -f "$file"
  done
done

echo ""
echo "=== 3. MÓDULO DE MOVILIDAD ==="
for dir in 01_tables 02_functions 03_triggers 04_policies 05_data 06_views; do
  echo "--- $dir ---"
  for file in "$SCRIPTS_DIR/02_modulo-movilidad/$dir"/*.sql; do
    [ -f "$file" ] && psql $DB_CONN -f "$file"
  done
done

echo ""
echo "=== 4. VISTAS FINALES ==="
psql $DB_CONN -f "$SCRIPTS_DIR/99_vistas_finales/001_vista_auditoria_completa.sql"

echo ""
echo "✅ Base de datos configurada correctamente"
```

---

## Arquitectura del Sistema

### Sistema de Roles (Granular)

**Dos niveles de roles:**

1. **Rol Global** (tabla `perfiles`):
   - `usuario` - Acceso estándar al sistema
   - `superadmin` - Acceso administrativo total

2. **Roles Modulares** (tabla `roles_modulo`):
   - Específicos por módulo
   - Permisos granulares en JSONB
   - Un usuario puede tener roles diferentes en cada módulo

**Ejemplo - Módulo Movilidad:**
- `mov_usuario` (nivel 0): Solo lectura
- `mov_operador` (nivel 1): Crear y editar
- `mov_administrador` (nivel 2): Control total + configuración

### Sistema de Auditoría

**Registro automático de:**
- Cambios en perfiles de usuario
- Asignación/revocación de roles
- Inicio/cierre de sesiones
- Operaciones críticas del sistema

**Campos registrados:**
- Quién hizo el cambio
- Qué cambió (valores antes/después en JSONB)
- Cuándo cambió
- IP y User-Agent

### Sistema de Sesiones

**Características:**
- Seguimiento de sesiones activas
- Validación de expiración de tokens JWT
- Cierre automático de sesiones inactivas
- Panel de gestión para superadmins
- Registro de última actividad

### Reglas de Negocio (Movilidad)

**Validaciones automáticas:**
1. Un vehículo solo puede tener un proceso activo a la vez
2. Secuencia correcta: Traslado → Radicación
3. No se puede iniciar radicación si hay traslado activo
4. Transiciones de estado válidas por tipo de proceso
5. No se puede modificar proceso finalizado

**Estados de Traslados:**
`sin_asignar` → `revisado` → `aprobado` → `enviado_organismo` → `trasladado`
                ↘ `con_novedades` ↗        ↘ `devuelto`

**Estados de Radicaciones:**
`sin_asignar` → `recibido` → `revisado` → `pendiente_radicar` → `radicado`
                             ↘ `con_novedades` ↗    ↘ `devuelto`

---

## Convenciones y Estándares

### Nomenclatura

**Tablas:**
- Sistema: `sys_*` (ej: `sys_auditoria`, `sys_sesiones`)
- Movilidad: `mov_*` (ej: `mov_cuentas_vehiculos`, `mov_traslados`)
- Compartidas: Sin prefijo (ej: `perfiles`, `modulos`)

**Funciones:**
- `snake_case`
- Verbos descriptivos (ej: `registrar_*`, `validar_*`, `obtener_*`)

**Políticas RLS:**
- En español, descriptivas
- Formato: "Los usuarios pueden [acción] [objeto]"

**Índices:**
- Formato: `idx_[tabla]_[columna]`
- Índices GIN para JSONB y búsqueda full-text
- Índices parciales para consultas específicas

### Campos Estándar

**Todas las tablas principales incluyen:**
```sql
creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
creado_por UUID REFERENCES perfiles(id)
actualizado_por UUID REFERENCES perfiles(id)
```

**Automatización:**
- `creado_en`, `actualizado_en`: Automático via triggers
- `actualizado_por`: Automático via triggers (usa `auth.uid()`)

---

## Dependencias Técnicas

### Requisitos
- **PostgreSQL**: 12+ (recomendado 14+)
- **Extensiones**:
  - `uuid-ossp` - Generación de UUIDs
  - `pg_trgm` - Búsqueda de similitud
- **Supabase Auth**: Para autenticación (tabla `auth.users`)

### Características Utilizadas
- Row Level Security (RLS)
- Triggers y funciones PL/pgSQL
- Índices GIN para JSONB
- Búsqueda full-text vectorial
- Constraints y validaciones
- JSONB para datos dinámicos

---

## Mantenimiento

### Actualizar Festivos (después de 2027)

```sql
INSERT INTO public.mov_festivos_colombia (fecha, nombre, tipo)
VALUES
  ('2028-01-01', 'Año Nuevo', 'civil'),
  ('2028-01-10', 'Reyes Magos', 'religioso')
ON CONFLICT (fecha) DO NOTHING;
```

### Agregar Nuevo Módulo

```sql
-- 1. Insertar módulo
INSERT INTO public.modulos (id, nombre, descripcion, ruta, icono)
VALUES ('tickets', 'Tickets', 'Sistema de tickets', '/tickets', 'ticket');

-- 2. Crear roles
INSERT INTO public.roles_modulo (modulo_id, codigo, nombre, permisos, nivel)
VALUES
  ('tickets', 'tick_usuario', 'Usuario', '{"ver": true}', 0),
  ('tickets', 'tick_soporte', 'Soporte', '{"ver": true, "responder": true}', 1);

-- 3. Asignar roles a usuarios
INSERT INTO public.usuarios_roles (usuario_id, modulo_id, rol_id)
SELECT
  p.id,
  'tickets',
  r.id
FROM perfiles p
JOIN roles_modulo r ON r.codigo = 'tick_usuario'
WHERE p.rol_global = 'usuario';
```

### Limpiar Datos (Solo Desarrollo)

```bash
# Limpiar módulo de movilidad completo
psql -f 02_modulo-movilidad/99_utilities/001_limpiar_datos.sql

# Limpiar TODA la base de datos
psql -f 00_configuracion/99_utilities/001_limpiar_bd.sql
```

---

## Notas de Seguridad

### Row Level Security (RLS)
- **Todas** las tablas tienen RLS habilitado
- Las políticas se verifican **automáticamente** en cada consulta
- No se puede deshabilitar sin permisos de superadmin

### Funciones SECURITY DEFINER
- Algunas funciones críticas usan `SECURITY DEFINER`
- Ejecutan con privilegios del creador, no del llamador
- Usadas para operaciones que requieren bypass controlado de RLS

### Auditoría Automática
- Cambios críticos se registran automáticamente
- No se puede deshabilitar a nivel de aplicación
- Almacena valores antes/después en JSONB

---

## Soporte

Para consultas sobre la estructura de base de datos:
1. Revisa los `COMMENT ON` en cada tabla/función
2. Consulta este README
3. Revisa el código fuente de funciones y triggers

**Zona Horaria:** Todos los timestamps usan `America/Bogota` (UTC-5)
