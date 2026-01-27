# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.2.0] - 2026-01-27

### Mejoras UI Dashboard y Tablas

#### Agregado
- Estado General: nueva vista consolidada de procesos activos con stats
- TablaProcesosActivos: tabla unificada de traslados y radicaciones
- Stats en Estado General: total, vencidos, por vencer, en proceso

#### Cambiado
- N° Cuenta como primera columna en todas las tablas
- Ordenamiento por N° Cuenta (desc) por defecto en todas las tablas
- Dashboard con diseño más compacto y limpio
- StatCards horizontales con colores por tipo
- Quick actions siguiendo orden del nav
- Headers estandarizados (text-2xl font-bold tracking-tight)
- Descripciones simplificadas en todas las páginas
- BadgeEstadoProceso usa colores de ESTADOS_CONFIG
- CardTipoReporte más compacto con ChevronRight
- Columnas de tablas simplificadas y consistentes

#### Eliminado
- Botón "Volver al Dashboard" en páginas (redundante con nav)
- Descripciones largas innecesarias

---

## [1.1.0] - 2026-01-27

### Estado Aprobado para Traslados

#### Agregado
- Nuevo estado "aprobado" en el flujo de traslados
- Transición directa de sin_asignar → aprobado
- Campo `fecha_aprobacion` en traslados
- Trigger para calcular fecha de vencimiento (60 días hábiles) al aprobar
- Mensaje informativo en formulario de traslados sobre conteo de días

#### Cambiado
- La fecha de vencimiento ahora se calcula al aprobar, no al crear el traslado
- Removido campo fecha_tramite del formulario de traslados (solo aplica a radicaciones)
- Proceso activo muestra "Pendiente de aprobación" cuando traslado no está aprobado
- Alertas prioritarias filtran traslados sin fecha_vencimiento
- Rediseño de AlertCard con estilo timeline consistente

#### Flujo de Estados Actualizado (Traslados)
```
sin_asignar → revisado → aprobado → enviado_organismo → trasladado
           ↘ con_novedades ↗      ↘ devuelto
           ↘ aprobado (directo)
```

---

## [1.0.1] - 2026-01-21

### Mejoras en consulta pública y seguridad

#### Cambiado
- Rediseño completo del card de resultados en consulta pública
- Nuevo componente ProcessTimeline con visualización de estados
- Línea de progreso centrada y animada en timeline
- Reducción de tamaño de placa para mejor proporción visual
- Agregada información de empresa transportadora y número de guía en traslados

#### Seguridad
- Agregado `SET search_path = public` a 29 funciones SQL
- Agregado `WITH (security_invoker = true)` a 4 vistas SQL
- Corrección de warnings del linter de Supabase

---

## [1.0.0] - 2026-01-21

### Primera versión estable del Sistema de Movilidad

#### Agregado

**Módulo de Movilidad**
- Sistema de cuentas de vehículos con numeración automática (formato: YYYYMMDD-XXXXX)
- Gestión completa de traslados con flujo de estados
- Gestión completa de radicaciones con flujo de estados
- Control de transiciones de estado válidas mediante base de datos
- Sistema de novedades para registrar y resolver incidencias
- Alertas de vencimiento con código de colores (verde > 15 días, amarillo 7-15, naranja 3-7, rojo < 3)
- Generación automática de documentos PDF de remisión
- Cálculo automático de días hábiles restantes (excluyendo fines de semana y festivos)
- Historial completo de acciones por vehículo

**Sistema de Usuarios y Autenticación**
- Autenticación mediante Supabase Auth
- Sistema de roles multinivel (superadmin, administrador, operador, usuario)
- Permisos granulares por módulo y funcionalidad
- Gestión de usuarios desde panel de superadmin
- Activación/desactivación de cuentas
- Suspensión temporal con fecha de expiración

**Gestión de Sesiones**
- Cierre automático por inactividad (configurable, default 5 min)
- Advertencia antes del cierre de sesión
- Registro de sesiones en base de datos
- Tracking de IP, dispositivo y user agent
- Historial de sesiones por usuario
- Limpieza manual y automática de sesiones

**Panel de SuperAdmin**
- Dashboard con métricas del sistema
- Gestión completa de usuarios
- Visualización de sesiones activas
- Sistema de auditoría con filtros avanzados
- Registro de todas las acciones del sistema

**Consulta Pública**
- Portal sin autenticación para consultar estado de vehículos
- Búsqueda por placa
- Información de estado, tipo de proceso y vencimiento
- Soporte para modo oscuro

**Arquitectura y Calidad**
- Next.js 16 con App Router y React 19
- TypeScript estricto en todo el proyecto
- Componentes accesibles basados en Radix UI
- Row-Level Security (RLS) en base de datos
- Error Boundaries para manejo de errores
- Loading Skeletons para mejor UX
- Componentes reutilizables (AlertBox, SubmitButton, etc.)

**Base de Datos**
- Esquema completo en PostgreSQL via Supabase
- Funciones y triggers para automatización
- Vistas optimizadas para consultas frecuentes
- Scripts de migración organizados y documentados

#### Seguridad
- Autenticación JWT via Supabase
- Row-Level Security en todas las tablas
- Validación de permisos en cliente y servidor
- Auditoría completa de acciones
- Protección contra inyección SQL
- Sanitización de inputs

---

## Historial de Desarrollo

### Fase 1: Fundamentos (Enero 2026)
- Configuración inicial del proyecto Next.js
- Integración con Supabase
- Sistema base de autenticación
- Estructura de carpetas y convenciones

### Fase 2: Módulo de Movilidad
- Diseño de esquema de base de datos
- CRUD de cuentas de vehículos
- Implementación de traslados y radicaciones
- Sistema de estados y transiciones
- Generación de PDFs

### Fase 3: Administración
- Panel de superadmin
- Gestión de usuarios y roles
- Sistema de auditoría
- Gestión de sesiones

### Fase 4: UX y Calidad
- Error Boundaries y manejo de errores
- Loading Skeletons
- Validación en tiempo real
- Mejoras de accesibilidad (ARIA, navegación por teclado)
- Optimización de rendimiento (React.memo, lazy loading)
- Refactorización de código duplicado

---

## Tipos de Cambios

- `Agregado` para nuevas funcionalidades
- `Cambiado` para cambios en funcionalidades existentes
- `Obsoleto` para funcionalidades que serán eliminadas próximamente
- `Eliminado` para funcionalidades eliminadas
- `Corregido` para corrección de errores
- `Seguridad` para vulnerabilidades corregidas
