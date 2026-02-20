# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.8.10] - 2026-02-20

### Corregido

#### Corregido
- **Login bloqueado por fallo de auditoría**: `registrarInicio` retornaba null (401 Unauthorized) y lanzaba un error que impedía el acceso — autenticación y auditoría son responsabilidades separadas, el fallo de una no debe bloquear la otra
- **401 en funciones de sesiones**: las funciones `registrar_inicio_sesion`, `registrar_fin_sesion`, `actualizar_actividad_sesion` y `obtener_sesion_activa` no tenían `GRANT EXECUTE` para el rol `authenticated` — migración `001` agrega los permisos faltantes

> **Acción requerida en BD**: ejecutar `scripts/migrations/001_grant_execute_sesiones.sql` en Supabase SQL Editor

---

## [1.8.9] - 2026-02-20

### Seguridad

#### Corregido
- **Cierre de sesión por inactividad no funcionaba en producción**: el middleware verificaba solo `estado = 'activa'` en BD — si el browser se cerraba sin que el timer del cliente disparara, la sesión quedaba activa indefinidamente
- **Tokens no se anulaban al cerrar sesión forzada**: `signOut()` limpiaba las cookies en `supabaseResponse` pero el redirect devolvía un response nuevo sin ellas — el browser conservaba los tokens access/refresh. Ahora se copian al redirect en la misma respuesta
- **`checkSession` usaba caché local**: reemplazado `getSession()` por `getUser()` para validar contra el servidor en el montaje del SessionProvider

---

## [1.8.7] - 2026-02-19

### Mantenimiento

#### Eliminado
- `package-lock.json` del repositorio (el proyecto usa pnpm exclusivamente; solo `pnpm-lock.yaml` es el lockfile oficial)

---

## [1.8.6] - 2026-02-19

### Corregido

#### Corregido
- PDF de inspecciones preoperacionales: se agrega margen superior de 36pt y márgenes laterales a la página; la barra de encabezado se muestra con bordes redondeados dentro de los márgenes

---

## [1.8.5] - 2026-02-19

### Corregido

#### Corregido
- PDF de inspecciones preoperacionales: texto de títulos de sección, labels de campos, cabeceras de tabla y celdas de observaciones demasiado pálidos — colores oscurecidos a valores legibles (`#111827`, `#4b5563`, `#1f2937`)

---

## [1.8.4] - 2026-02-19

### Corregido

#### Corregido
- `DataTable`: cambiar `tableLayout` default de `fixed` a `auto`, reducir ancho de última columna de 190px a 80px, aumentar min-width a 700px — mejora distribución de columnas en pantallas normales y responsivas
- PDF de inspecciones preoperacionales: encabezado simplificado a "Inspecciones Preoperacionales" (eliminado subtítulo "Control de Flota · Sistema de Parqueadero"); `wrap={false}` en todas las secciones para evitar cortes de contenido entre páginas

---

## [1.8.3] - 2026-02-19

### Cambiado
- Rediseño profesional de plantillas Excel: cabecera azul marino, autofilter, freeze row, filas alternas, bordes, hoja Resumen estilizada, colores de urgencia (vencidos/por vencer)
- Rediseño profesional de plantillas PDF: barra de encabezado con badge, metadatos en columnas, tabla con cabecera azul, filas alternas, footer con número de página real, colores de urgencia por fila

### Corregido
- `.gitignore`: ignorar `package-lock.json` y `yarn.lock` (proyecto usa pnpm)
- `pnpm-lock.yaml`: sincronizado tras reemplazo de `xlsx` por `exceljs`

---

## [1.8.2] - 2026-02-19

### Seguridad
- Reemplaza dependencia `xlsx` (licencia comercial de pago a partir de v0.18) por `exceljs` (MIT)

### Agregado
- Agrega archivo `LICENSE` — EULA propietario bajo legislación colombiana e internacional

---

## [1.8.1] - 2026-02-18

### Fixed
- **Auth**: al presionar "atrás" desde el dashboard, el login ahora detecta la sesión activa
  y redirige automáticamente al módulo correcto con `router.replace()` (elimina `/auth/login` del historial)

---

## [1.8.0] - 2026-02-18

### Added
- **Responsive completo**: layouts corregidos para viewport móvil (< 640px) en 9 archivos
  - Modales de vehículos parqueadero (`modal-nuevo-vehiculo`, `modal-editar-vehiculo`): grids de 2 columnas → 1 col en móvil
  - Modal datos personal (`modal-datos-personal`): 4 grids de 2 columnas → 1 col en móvil
  - Popovers de organismo (`combobox-organismos`) y empresa (`agregar-datos-transporte`): anchos fijos → `95vw` en móvil
  - Dashboards movilidad y parqueadero: stat cards de 2 columnas → 1 col en móvil
  - Modal detalles usuario: información básica 1 col en móvil
  - Historial proceso dialog: datos del proceso 1 col en móvil

---

## [1.7.1] - 2026-02-17

### Nota de Release
Este release se realizó siguiendo un proceso simplificado debido a la urgencia de los cambios.

#### Agregado
- **Responsive completo para móviles** (12 archivos modificados)
  - Headers responsivos con texto adaptativo y navegación compacta
  - Grids adaptativos (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) en dashboards y reportes
  - Padding responsive (`p-3 sm:p-6`) en contenedores principales
  - Stat cards con layout compacto en pantallas pequeñas
  - Timeline de consulta pública compacto en móvil

#### Corregido
- **Responsive inspecciones**: Botón "Guardar Inspección" adaptado a móvil
- Botones de evaluación de items (bueno/regular/malo/no_aplica) más compactos en móvil
- Botones de resolución de novedades con texto corto en móvil
- **Lockfile**: Sincronización de `package-lock.json` con dependencias

#### Cambiado
- **Catálogo de Inspecciones**: Actualización de items
  - Eliminado item: `LIQUIDO DE FRENOS` (NIV_FRENOS)
  - Eliminado item: `RAMPAS DE ACCESO` (GRU_RAMPAS)
  - Actualizado item: `ACEITE DE MOTOR` - descripción cambiada a "VALIDAR CON TESTIGO"

---

## [1.7.0] - 2026-02-17

### Seguridad, Responsividad y UX de Consulta Pública

#### Seguridad
- **Hardening completo de base de datos**
  - Row-Level Security (RLS) reforzado en tablas críticas
  - Vistas SQL con `security_invoker = true`
  - Funciones SQL con `SET search_path = public`
  - Optimización de consultas en vistas frecuentes

#### Agregado
- **UX de errores en consulta pública**: Mensajes visuales diferenciados por tipo de error (no encontrado, sin conexión, error del servidor)
- **Tablas responsivas**: Responsividad completa en tablas de datos con scroll horizontal y columnas adaptativas
- Meta tag `className` para compatibilidad de estilos en `<html>`

#### Corregido
- Mensajes de error genéricos en consulta pública reemplazados por mensajes específicos y amigables

---

## [1.6.0] - 2026-02-17

### Feat: Reportes vencidos, radicaciones y mejoras parqueadero

#### Agregado
- Vista y reporte de procesos vencidos (movilidad)
- Notificaciones de radicación con formulario de registro
- Exportación CSV/Excel/PDF para reportes de vencidos
- Utilidad `humanize()` para convertir valores snake_case a texto legible
- Filtros avanzados en reportes (por vencer, vencidos, activos, completados)

#### Cambiado
- Dashboard parqueadero: últimas inspecciones muestran fecha + hora completa
- Formulario inspección: opción "Mejoró" reemplazada por "Se mantiene"
- PDF inspección: tipo de vehículo humanizado
- Modal personal: selects muestran label descriptivo en vez de código interno
- Consulta pública: vista mejorada con más datos del proceso
- Columnas de radicaciones y traslados ampliadas con información adicional

#### Corregido
- Valores snake_case visibles al usuario en UI y PDFs

---

## [1.5.0] - 2026-02-11

### Feat: Tipografía profesional del sistema

#### Agregado
- **Plus Jakarta Sans** como fuente principal (UI general), reemplaza Geist
- **JetBrains Mono** para datos técnicos/monospace (numero_cuenta, IPs, guías)
- **Share Tech Mono** + clase `.font-plate` para placas vehiculares (estilo industrial/estampado)
- Variable CSS `--font-plate` y clase utilitaria con uppercase, letter-spacing y bold

#### Cambiado
- 16 ubicaciones de placas vehiculares actualizadas con tipografía consistente (`font-plate`)
- Todas las fuentes cargadas via `next/font/google` (optimización automática)

---

## [1.4.5] - 2026-02-10

### Chore: Calidad de código, seguridad y dependencias

#### Seguridad
- `npm audit fix` — lodash prototype pollution corregido
- Next.js actualizado a 16.1.6 (3 vulnerabilidades DoS corregidas)
- Removido `@types/xlsx` innecesario

#### Configuración
- Removido `eslint.ignoreDuringBuilds` de `next.config.mjs`
- Removido `typescript.ignoreBuildErrors` — tsc compila limpio

#### Tipos
- ~30 instancias de `any` reemplazadas con tipos propios en 20+ archivos
- Interfaces explícitas para procesos, novedades, permisos, reportes y auditoría
- `catch (error: any)` → `catch (error)` + `instanceof Error`

#### Dependencias
- Actualización semver-safe: Supabase, Tailwind, React types, Vercel analytics, etc.

---

## [1.4.4] - 2026-02-10

### Fix: Permisos modulares, licencias admins y capitalización

#### Corregido
- **Bug crítico**: Permisos de usuarios no-superadmin no funcionaban (admins, operadores, usuarios no podían crear cuentas ni acceder a funciones). Causa: `permissions-queries.ts` trataba `permisos` JSONB como `string[]`, `.reduce()` fallaba silenciosamente
- Admins de parqueadero excluidos de alertas y validación de licencias (igual que auxiliares)
- Nombres sin capitalizar en: dashboard parqueadero, detalle inspección, firmas, tabla personal, modal datos, detalle vehículo y PDF de inspección

---

## [1.4.3] - 2026-02-10

### Hotfix: Serialización de iconos server→client

#### Corregido
- Error en producción por pasar componentes React (iconos Lucide) desde server components a client components
- Iconos de módulos en MobileNav ahora se resuelven por nombre (string) en el cliente

---

## [1.4.2] - 2026-02-10

### Mejoras: Navegación móvil, alternancia de módulos y capitalización

#### Agregado
- Alternancia directa entre módulos para usuarios con acceso a movilidad y parqueadero
- Menú móvil completo: info de usuario (nombre, rol), módulos disponibles y cerrar sesión
- Descripciones detalladas en items del catálogo de inspección preoperacional

#### Corregido
- Nombre del usuario sin capitalizar en header de movilidad y parqueadero
- En móvil no se mostraba nombre de usuario, rol ni botón de cerrar sesión

---

## [1.4.1] - 2026-02-10

### Hotfix: Email, Templates, Parqueadero y Auditoría

#### Corregido
- Email de recuperacion enviaba URL con `localhost:3000` en produccion (ahora usa Host header)
- Trailing slash en `NEXT_PUBLIC_SITE_URL` generaba doble `/` en enlaces
- Admins de parqueadero aparecian como operarios/auxiliares en inspecciones
- Nombres sin capitalizar en formulario y tabla de inspecciones

#### Cambiado
- Templates de email simplificados: menos decoracion, mas directos y profesionales
- CHANGELOG: agregada entrada faltante de v1.3.1

---

## [1.4.0] - 2026-02-09

### Emails Independientes de Supabase, UX y Reestructuración

#### Agregado

**Independencia Total de Emails de Supabase**
- Endpoint `POST /api/auth/forgot-password` — usa `admin.generateLink()` + SMTP propio
- Endpoint `POST /api/auth/sign-up` — usa `admin.createUser()` sin email de verificación
- Endpoint `POST /api/auth/update-password` — usa `admin.updateUserById()` sin email de notificación
- Template de recuperación de contraseña (`recuperar-password.ts`)
- Supabase ya NO envía ningún email (sign-up, recovery, password changed)

**Componentes Auth Compartidos**
- `PasswordInput` — Input con toggle de visibilidad (ojito) en login, reset y cambiar contraseña
- `PasswordForm` — Formulario compartido entre reset-password y cambiar-password
- `BackToLogin` — Link "Volver al inicio de sesión" en todas las páginas auth

**UX y Navegación**
- Botón "Panel Admin" en movilidad y parqueadero para superadmins (desktop y mobile)
- Página `/sin-acceso` muestra todos los módulos del sistema con links directos
- Nombres de usuarios capitalizados automáticamente al guardar (David Perez, no david perez)
- `capitalizeName` aplicado en displays: lista usuarios, detalles, sesiones, auditoría

**Auditoría Reestructurada**
- Hook `useAuditoria` extrae lógica de datos, filtros y exportación
- Componente `FiltrosAuditoriaComponent` separado
- Categoría "Parqueadero" agregada al filtro de tipos
- Acciones de sesión: `sesion_cerrada_por_admin`, `sesiones_token_expirado`

#### Cambiado
- Templates de email separados en archivos individuales (`lib/email/templates/`)
- Reset-password usa `verifyOtp(token_hash)` en vez de PKCE `exchangeCodeForSession`
- Cambiar-password ahora cierra sesión y redirige a login (más robusto)
- Middleware permite `/api/auth/*` como rutas auth (acceso sin sesión)

#### Corregido
- Password recovery: enlace inválido por falta de `code_verifier` cookie (PKCE)
- Doble submit en formularios de contraseña (200 + 401)
- Sesión inválida al cambiar contraseña: token se pasa directamente en body
- Cookie `session_registered` stale causaba redirect a session_closed

---

## [1.3.1] - 2026-02-08

### Hotfix: PWA, Reset Password y Branding

#### Corregido
- Reset password: intercambiar codigo PKCE por verificacion `token_hash` via `verifyOtp`
- Unificar requisitos de contraseña entre reset-password y cambiar-password
- Evitar timeout de inactividad en rutas auth (reset-password, forgot-password)
- Redirect a login en forgot/reset-password cuando no hay sesion
- Confirm route: preservar cookies en redirect
- Remitente de emails como "Do Not Reply - Movilidad"
- Resolver alerta GitGuardian en templates de email
- Service worker: no interceptar rutas auth

#### Cambiado
- Reemplazar "Sistema de Movilidad" por "Movilidad" en todo el proyecto

#### Agregado
- Service worker PWA basico

---

## [1.3.0] - 2026-02-07

### Gestión Completa de Usuarios, Emails, PWA, Parqueadero y Refactorización DRY/SOLID

#### Agregado

**Gestión de Usuarios**
- Flujo completo de aprobación: admin crea → pendiente → aprueba → email con contraseña temporal
- Endpoint `POST /api/admin/aprobar-usuario` para aprobar usuarios pendientes
- Endpoint `POST /api/admin/resetear-password` para resetear contraseñas
- Endpoint `POST /api/admin/eliminar-usuario` para eliminar usuarios
- Endpoint `POST /api/admin/cerrar-sesion` para cerrar sesión de un usuario
- Endpoint `POST /api/admin/limpiar-sesiones` para limpiar sesiones inactivas
- Generador de contraseñas temporales seguras (`lib/utils/generate-password.ts`)
- Flag `debe_cambiar_password` en metadata para forzar cambio en primer login
- Sign-up público con flujo de aprobación (mismo que creación por admin)

**Sistema de Email (Nodemailer)**
- Configuración SMTP con Nodemailer (`lib/email/transporter.ts`)
- Templates HTML para emails en español (`lib/email/templates.ts`)
- Función de envío reutilizable (`lib/email/send-email.ts`)
- Email de cuenta aprobada con contraseña temporal
- Email de reseteo de contraseña

**Páginas de Auth nuevas**
- `/auth/forgot-password` — Solicitar recuperación de contraseña
- `/auth/reset-password` — Establecer nueva contraseña (via link de email)
- `/auth/cambiar-password` — Cambio obligatorio en primer login
- `/auth/confirm` — Callback para intercambio de tokens de email
- `/auth/sign-up-success` — Confirmación de solicitud enviada

**Módulo Parqueadero**
- Inspecciones preoperacionales completas con items configurables
- Gestión de vehículos del parqueadero
- Gestión de personal
- Navegación independiente con colores cyan

**PWA (Progressive Web App)**
- `manifest.json` con nombre, iconos y colores del tema
- Iconos en 192px, 512px y SVG
- `apple-touch-icon` para iOS
- Modo `standalone` display

**Componentes compartidos**
- `NavLink` compartido con color configurable (`components/shared/nav-link.tsx`)
- `ConfirmDialog` reutilizable (`components/shared/confirm-dialog.tsx`)
- `MobileNav` hamburguesa responsive (`components/shared/mobile-nav.tsx`)
- `EmptyState` para estados vacíos (`components/shared/empty-state.tsx`)
- `PasswordRequirements` validación visual de contraseña

#### Cambiado

**Refactorización DRY/SOLID**
- Middleware compartido `requireSuperAdmin()` en todas las API routes admin (~70 líneas eliminadas)
- Tipos centralizados en `lib/types/usuario.ts` (`Usuario`, `ConfirmState`, `FiltrosUsuarios`, `CONFIRM_INITIAL`)
- NavLink unificado (eliminados `movilidad/nav-link.tsx` y `parqueadero/nav-link.tsx`)
- Logger estructurado (`lib/logger.ts`) reemplaza `console.error` en rutas de servidor
- Cliente admin reutilizable (`lib/supabase/admin.ts`)

**Creación de usuario por admin**
- Ya no pide contraseña al crear (se genera al aprobar)
- Solo requiere email + nombre completo
- Usuario queda como pendiente de aprobación

**Login**
- Detecta `debe_cambiar_password` y redirige a `/auth/cambiar-password`
- Manejo de query param `?message=password_updated` para confirmación

#### Seguridad
- Prevención de enumeración de emails en sign-up (respuesta genérica para email duplicado)
- Traducción de errores Supabase Auth de inglés a español en todas las páginas auth
- No se exponen mensajes internos al usuario final
- Variables de entorno validadas con Zod (`lib/env.ts`)

#### Eliminado
- Componentes NavLink duplicados (`movilidad/nav-link.tsx`, `parqueadero/nav-link.tsx`)
- Interfaces locales duplicadas de `Usuario`, `ConfirmState`, `Filtros` en múltiples archivos
- `console.error` directo en rutas API de servidor

---

## [1.2.2] - 2026-01-28

### Correcciones

#### Corregido
- Errores TypeScript en componentes
- Eliminado console.error en producción

#### Cambiado
- Mejorada visualización del historial de auditoría
- Agregada placa de vehículo en historial de acciones

---

## [1.2.1] - 2026-01-27

### Parche

#### Cambiado
- Login simplificado
- Fecha de aprobación visible en traslados
- Estado aprobado en timeline de consulta pública

---

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

### Primera versión estable de Movilidad

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

### Fase 5: Gestión de Usuarios y Email (Febrero 2026)
- Flujo completo de aprobación de usuarios
- Sistema de email con Nodemailer
- Cambio obligatorio de contraseña temporal
- Recuperación de contraseña por email
- Reseteo de contraseña por admin

### Fase 6: Parqueadero y PWA (Febrero 2026)
- Módulo completo de parqueadero (inspecciones, vehículos, personal)
- Progressive Web App (manifest, iconos, standalone)
- Navegación responsive con hamburguesa

### Fase 7: Refactorización DRY/SOLID (Febrero 2026)
- Middleware compartido de autenticación
- Tipos centralizados
- Componentes compartidos (NavLink, ConfirmDialog, MobileNav)
- Logger estructurado
- Seguridad: prevención de enumeración de emails, traducción de errores

### Fase 8: Reportes y Calidad (Febrero 2026)
- Sistema de reportes de vencidos
- Exportación CSV/Excel/PDF
- Filtros avanzados
- Mejoras responsive en inspecciones

### Fase 9: Seguridad y Responsividad (Febrero 2026)
- Hardening de seguridad en BD (RLS, vistas, funciones)
- Responsividad completa para móviles en tablas y páginas
- UX mejorada en consulta pública con errores diferenciados
- Proceso de release estandarizado con semver

---

## Tipos de Cambios

- `Agregado` para nuevas funcionalidades
- `Cambiado` para cambios en funcionalidades existentes
- `Obsoleto` para funcionalidades que serán eliminadas próximamente
- `Eliminado` para funcionalidades eliminadas
- `Corregido` para corrección de errores
- `Seguridad` para vulnerabilidades corregidas
