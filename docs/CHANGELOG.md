# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.25.3] - 2026-05-07

### Fix(auditoria): NUNC separado, limpiar sesiones

#### Corregido
- Acciones NUNC (`nunc_sesion_*`, `nunc_registro_*`) clasificadas en módulo propio — ya no aparecen en la card de Movilidad
- Card **NUNC · 7 días** y opción en filtro de tipo agregadas a auditoría
- Limpiar sesiones usaba cliente autenticado (sin permiso) → ahora usa admin client

---

## [1.25.2] - 2026-05-07

### Fix(session): timeout de inactividad web aumentado a 30 minutos

#### Cambiado
- Timeout de inactividad en web/escritorio: 5 min → 30 min. Móvil y tablet se mantienen en 1 hora.

---

## [1.25.1] - 2026-05-07

### Fix(movilidad): Novedades en estados inválidos e historial de acciones

#### Corregido
- Botón *Agregar Novedad* oculto en estados donde la transición a `con_novedades` no es válida (`aprobado`, `enviado_organismo`, `pendiente_radicar`, etc.) — evita el error "Solo se permiten transiciones de estado válidas"
- RLS de `mov_historial_acciones` corregida: estaba limitada a superadmin, ahora permite a usuarios con acceso al módulo de movilidad — el historial de acciones ya es visible en `/movilidad/vehiculos/[placa]`
- Migración 025: aplica corrección de política RLS en producción

---

## [1.25.0] - 2026-05-06

### Feat(nunc): Historial NUNC, base Excel compartida y correcciones

#### Agregado
- Reporte **Historial NUNC**: exporta todos los registros de todas las sesiones con filtro por rango de fechas — columna NUNC con formato `NUNC850016001169202600355` (sin separadores)
- `lib/shared/excel-base.ts`: utilidades comunes (`excelBorder`, `aplicarEstilosTabla`, `formatFecha`, `formatFechaHora`, `descargarExcel`) reutilizadas por movilidad, parqueadero y NUNC

#### Corregido
- API `/api/nunc/reportes` usaba `requireSuperAdmin()` bloqueando a `nunc_admin` — corregido a `nunc.ver`
- Exportadores de sesiones e historial reemplazados por `Dialog` (igual al patrón de parqueadero) — el dropdown anterior se salía del viewport en pantallas pequeñas

---

## [1.24.4] - 2026-05-06

### Perf+Fix(nunc): deduplicación de permisos y múltiples placas por NUNC

#### Corregido
- NUNC permite ahora múltiples placas bajo el mismo número de caso — eliminado índice único `idx_nunc_registros_nunc_unico` y validaciones de duplicado en API de registro y edición

#### Rendimiento
- `obtenerPermisosUsuario()` envuelto en `React.cache()` — las queries de perfil y roles se ejecutan una sola vez por request aunque múltiples Server Components la llamen

---

## [1.24.3] - 2026-05-06

### Security: getUser() en funciones core de autorización

#### Seguridad
- `lib/server/permisos.ts`: `getSession()` → `getUser()` — la función que resuelve permisos para todos los Server Components ahora valida el JWT contra el servidor de Supabase
- `lib/api/require-superadmin.ts`: mismo fix — protege todas las API routes de superadmin
- `lib/api/require-permiso-parqueadero.ts`: mismo fix — protege todas las API routes de parqueadero

---

## [1.24.2] - 2026-05-06

### Fix(session): timeouts de sesión y advertencia sin duplicados

#### Corregido
- Timeout de inactividad en móvil y tablet aumentado de 10 min a **1 hora** — inspectores que se alejan del dispositivo durante inspecciones físicas ya no pierden la sesión
- Advertencia de cierre ampliada de 30 s a **60 s** para dar más tiempo de reacción
- Toast de advertencia usa `id: 'session-warning'` en Sonner — evita que se acumulen múltiples toasts si el timer se reinicia
- Al retomar actividad, el toast pendiente se descarta con `toast.dismiss('session-warning')`

---

## [1.24.1] - 2026-05-06

### Hash chain e inmutabilidad en auditoría NUNC

#### Agregado
- Hash chain SHA-256 encadenado en `nunc_historial_acciones` — trigger `BEFORE INSERT` calcula `hash_anterior` y `hash_registro` con advisory lock para garantizar orden
- Inmutabilidad criptográfica: triggers `BEFORE UPDATE` y `BEFORE DELETE` bloquean modificaciones con `AUDIT_IMMUTABLE`
- `nunc_historial_acciones` incluida en `verificar_integridad_auditoria_completa()` — ahora verifica 5 tablas: sys_auditoria, movilidad, parqueadero, inventarios y NUNC

---

## [1.24.0] - 2026-05-06

### Auditoría NUNC, Excel, seguridad y correcciones

#### Agregado
- Módulo NUNC: tabla `nunc_historial_acciones` con 5 triggers automáticos — registra creación/cierre de sesiones y CRUD de registros; acciones de oficiales externos quedan con `realizado_por = NULL` + `origen = EXTERNO`
- NUNC agregado a `sys_vista_auditoria_completa` (UNION ALL junto a sistema, movilidad, parqueadero e inventarios)
- Exportación Excel de sesiones NUNC con filtro por rango de fechas y orden cronológico
- Exportación Excel de registros de una sesión con NUNC completo desglosado por campo
- Estudios NUNC visible en el switcher de módulos de movilidad y parqueadero para usuarios con acceso
- Rate limiting en las 4 rutas públicas NUNC: validar (10/15 min), registro y edición (60/10 min), cerrar (5/15 min)
- `getClientIp()` extraído a `lib/rate-limit.ts` — centraliza la extracción de IP real considerando proxies

#### Corregido
- Página `/nunc` usaba `permisos.movilidad` en lugar de `permisos.nunc` para el guard y el botón "Nueva sesión"
- Título "Peritajes" corregido a "Estudios NUNC" en la página de listado

#### Seguridad
- Layouts de movilidad, parqueadero y superadmin migrados de `getSession()` a `getUser()` — elimina riesgo de tokens no verificados en rutas protegidas

---

## [1.23.0] - 2026-05-06

### Módulo Estudios NUNC

#### Agregado
- **Módulo independiente Estudios NUNC** — registro de estudios externos sin cuenta de usuario
- Sesiones con código `PER-XXXXXX` generadas por admin, expiran automáticamente a medianoche Colombia
- Formulario público `/nunc/acceso`: registro de vehículos con NUNC completo, edición y eliminación inline con confirmación, vista toggle Registrar/Registros para sesiones con muchos vehículos
- Admin en `/nunc`: lista de sesiones con estado, detalle con tabla de vehículos, cierre manual de sesión
- NUNC único garantizado: validación en API + `UNIQUE INDEX` en BD (6 campos)
- Roles propios `nunc_admin` y `nunc_operador` con sistema de permisos independiente de movilidad
- Migración 022: tablas `nunc_sesiones` + `nunc_registros`, módulo y roles en BD
- Módulo visible en superadmin: dropdown, nav móvil y página sin-acceso

#### Rendimiento (sesión anterior)
- Dashboards Movilidad y Parqueadero: reducción de 3 round-trips a 1 (Promise.all)
- Admin dashboard: carga inicial en 1 round-trip paralelo + actividad
- Índices de rendimiento (migración 019): `fin_sesion`, compuesto sesiones, inspecciones, novedades pendientes
- Vista `mov_vista_proceso_activo_detalle` (migración 020): detalle de vehículo en 1 query
- Vista `mov_vista_procesos_completados` (migración 021): reporte completados con UNION SQL

---

## [1.22.2] - 2026-05-05

### Optimización de navegación entre módulos

#### Rendimiento
- Se reemplazó `auth.getUser()` por `auth.getSession()` en layouts server de `movilidad`, `parqueadero` y `superadmin`, evitando revalidaciones remotas redundantes durante navegación.
- Se removieron queries duplicadas de validación de rol en layouts de módulo; ahora se reutiliza el resultado de `obtenerLayoutData`.
- Se amplió el throttle del chequeo de estado de sesión en middleware de `30s` a `120s` para reducir carga de BD en transiciones frecuentes.

#### Impacto esperado
- Menor latencia al cambiar entre pestañas y módulos autenticados.
- Menos round-trips a Supabase Auth y a `sys_sesiones` por navegación.

---

## [1.22.1] - 2026-05-05

### Correcciones de sesión y navegación

#### Corregido
- **Contraseñas**: se permite el carácter `.` como especial en la validación visual del frontend, alineado con la validación backend.
- **Logout al recargar**: se evita expulsar al usuario por sesiones en estado `cerrada` generadas por `pagehide/beforeunload` durante recargas normales.
- **Navegación lenta entre módulos/pestañas**: se reduce el costo del middleware con un throttle de 30s para el chequeo de `sys_sesiones`, evitando consultar BD en cada navegación inmediata.

#### Cambiado
- `SessionProvider` deja de re-ejecutar validaciones pesadas en cada cambio de ruta cliente, mejorando fluidez de transición.

---

## [1.22.0] - 2026-05-05

### Performance y estabilidad en movilidad/auth

#### Agregado
- **Migración 019**: índices de rendimiento en `sys_sesiones`, `parq_inspecciones` y `mov_novedades` para reducir costo de consultas frecuentes en middleware, dashboard y reportes.
- **Migración 020**: vista `mov_vista_proceso_activo_detalle` para consolidar en una sola query el proceso activo con usuario creador/actualizador, empresa transportadora y notificación.
- **Migración 021**: vista `mov_vista_procesos_completados` para unificar traslados y radicaciones completadas y simplificar reportes.
- Sincronización de scripts base (`scripts/`) con las migraciones 019-021 para instalaciones desde cero.

#### Cambiado
- Endpoints y utilidades de auth/sesiones con ajustes de performance y robustez en cliente admin, cliente server y middleware.
- Mejoras transversales en vistas de movilidad, parqueadero y consulta para reducir round-trips y estabilizar carga inicial.

#### Corregido
- Validaciones y manejo de sesión en rutas protegidas para evitar cierres o regeneraciones incorrectas en navegación autenticada.
- Ajustes en páginas y componentes de carga (`loading`) para comportamiento más consistente entre segmentos.

---

## [1.21.0] - 2026-05-03

### Auditoría — No repudio con hash chain SHA-256

#### Agregado
- **Hash chain SHA-256** en las 4 tablas de auditoría (`sys_auditoria`, `mov_historial_acciones`, `parq_historial_acciones`, `inv_movimientos`) — cada registro tiene firma criptográfica encadenada que detecta cualquier alteración
- **Triggers de inmutabilidad** — bloquean físicamente UPDATE y DELETE en todos los logs de auditoría; lanza excepción si se intenta
- **Botón "Verificar integridad"** en el panel de auditoría — revisa las 4 tablas y muestra qué tabla fue comprometida y desde qué fecha
- **Modal "Historial completo"** — timeline cronológico de cualquier entidad accesible desde el detalle de cada registro de auditoría
- **Módulo inventarios** integrado a la vista unificada de auditoría y tarjeta en estadísticas
- **Row versioning** (columna `version`) en tablas críticas para optimistic locking: `mov_traslados`, `mov_radicaciones`, `mov_cuentas_vehiculos`, `parq_inspecciones`, `parq_vehiculos`
- **`sesion_id`** en todas las tablas de historial — vincula cada evento con la sesión exacta en que ocurrió
- Endpoint `GET /api/admin/auditoria/verificar` — verificación criptográfica de las 4 cadenas
- Endpoint `GET /api/admin/auditoria/entidad` — historial completo de cualquier entidad por tipo e ID
- 7 migraciones SQL (012-018) con rollback documentado

#### Cambiado
- **Vista unificada de auditoría** ahora incluye módulo inventarios (4 módulos en total)
- **Personal inactivo** ocultado en la vista operativa de parqueadero; historial conservado en `parq_historial_acciones`
- **CSP** activado en modo enforcement (antes era `Report-Only`)
- `send-email.ts` usa `logger` estructurado en lugar de `console.error`
- Filtro de tipos en auditoría incluye "Inventarios" como categoría separada

#### Corregido
- **Sesiones regeneradas** al volver al día siguiente — el refresh token de Supabase renovaba el JWT silenciosamente y `checkSession()` creaba una sesión nueva; ahora verifica si hay cierre forzado antes de crear
- **Tabla de sesiones vacía** — ambigüedad entre versión 8-params y 9-params de `registrar_auditoria_sistema` causaba fallo silencioso en `registrar_inicio_sesion`; se eliminó la versión vieja con `DROP FUNCTION`
- **Hash chain incorrecto** en registros pre-migración — backfill usaba `ORDER BY creado_en` pero verificación usaba `ORDER BY secuencia`; alineados en migración 017

#### Seguridad
- `REVOKE EXECUTE` en funciones CRON (`cerrar_sesiones_inactivas`, `cerrar_sesiones_token_expirado`) del rol `authenticated`
- Política de storage del bucket `parqueadero` ajustada para no permitir listado completo de archivos

---

## [1.20.0] - 2026-04-18

### Inventarios — rediseño móvil completo

#### Corregido
- **Header en móvil**: botones de acción agrupados en dropdown "Acciones" + botón primario "Agregar" — elimina el caos de botones que se envolvían sin orden
- **Filtros de categoría**: scroll horizontal con `shrink-0`, etiqueta "Stickers" en xs en lugar de "Stickers de Inventario"
- **Card de sticker**: botones "Actualizar"/"Ampliar" en grid 2 columnas en móvil, lado a lado en desktop
- **Teclado virtual**: `onOpenAutoFocus={(e) => e.preventDefault()}` y `max-h-[90dvh] overflow-y-auto` en todos los modales — evita el corte por teclado al abrir

---

## [1.19.0] - 2026-04-18

### Performance API y sesiones móvil

#### Corregido
- **Sesiones móvil**: `SessionProvider` verifica `forzada_cierre` antes de crear sesión nueva — resuelve regeneración de sesiones con tokens que ya no debían servir en superadmin
- **Middleware**: omite check de `sys_sesiones` en rutas `/api/` (tienen su propia capa de autenticación), eliminando queries innecesarias

#### Cambiado
- **Admin client**: singleton a nivel de módulo — reutiliza la misma instancia entre requests en lugar de crear una nueva por cada llamada
- **Guards de API**: `getSession()` en lugar de `getUser()` en `requirePermisoParqueadero` y `requireSuperAdmin` — elimina la llamada de red a Supabase Auth (~100-400ms por request)
- **`requirePermisoParqueadero`**: queries de perfil y rol en paralelo con `Promise.all` — ahorra un round-trip para usuarios no-superadmin

---

## [1.18.0] - 2026-04-18

### Inventarios — UX, exportes y deshacer

#### Agregado
- **Banner de deshacer**: componente `UndoBanner` con barra de progreso de 10 segundos, centrado en la parte inferior — disponible tras agregar stock, mover stock, actualizar sticker y ampliar rango
- **Endpoint `POST /api/parqueadero/inventarios/deshacer`**: revierte operaciones de tipo `agregar`, `mover`, `sticker` y `ampliar_rango`
- **Exportes PDF/Excel/CSV**: informes de stock actual con detalle de stickers — botones agrupados en dropdown "Exportar" en el header
- **Reportes de inventario**: `DocumentoStockPDF`, `generarExcelInventario`, `generarCSVInventario` usando plantillas compartidas del sistema
- **Fix móvil superadmin**: nombre de usuario en `MobileNav` y botón de logout oculto en xs (disponible en el sheet)

#### Cambiado
- **Sticker — actualizar último usado**: ahora abre un modal (igual que ampliar rango) en lugar de edición inline
- **Agregar stock**: paso de confirmación con preview del ítem, cantidad y stock bodega antes/después antes de ejecutar

---

## [1.17.0] - 2026-04-17

### Parqueadero — módulo de inventarios

#### Agregado
- **Control de stock por ubicación**: libretas y sellos con seguimiento por bodega y por grúa
- **Gestión de stickers por rango**: numeración secuencial con inicialización, actualización y ampliación de rango
- **Cierre de turno**: reporte de cantidades finales con descuento automático del stock total
- **Permisos granulares**: `gestionar_inventario` — accesible por superadmin, parq_administrador y parq_auxiliar
- **`requirePermisoParqueadero`**: helper de autorización reutilizable para rutas API del módulo
- **`useMutation` + `apiFetch`**: hook y utilidad en `lib/` para mutaciones idempotentes con `useTransition`
- **Migraciones SQL 009–011**: tablas de inventario, RLS, y permiso `gestionar_inventario` en roles existentes

---

## [1.16.0] - 2026-04-16

### Auditoría — refactorización completa y cierre de brechas

#### Agregado
- **Severidad visual por fila**: ícono rojo (crítico), naranja (alto), azul (medio), gris (info) — permite identificar eventos de riesgo de un vistazo
- **Filtros rápidos**: chips *Hoy*, *Esta semana*, *Críticos*, *Logins fallidos* sobre la tabla
- **Banner de alertas automático**: aparece si hay ≥3 logins fallidos, cuentas eliminadas o sesiones cerradas por admin en las últimas 24h
- **Panel de detalle mejorado**: secciones organizadas (Quién · Cuándo · Desde dónde · Afectado · Cambios · Contexto), user_agent parseado a lenguaje humano, labels en español
- **Cards de estadísticas**: ventana de 7 días con descripción clara; "Hoy" usa hora local del navegador (corrige bug UTC)
- **Auditoría de contraseñas**: `password_cambiado` al cambiar contraseña propia, `password_reseteado` al resetear por admin, `usuario_aprobado` al aprobar cuenta — todos con IP y user-agent
- **`lib/utils/get-client-ip.ts`**: utilidad compartida para extraer IP real del cliente (DRY)
- **Migraciones SQL 005–008**: nuevas acciones en CHECK constraint, `ip_address`/`user_agent` en historial de módulos, trigger en tabla `modulos`, RLS historial movilidad solo superadmin

#### Cambiado
- **Columnas de la tabla**: reorganizadas a Severidad · Evento (badge+descripción legible) · Responsable · Afectado · Cuándo · IP
- **RLS `mov_historial_acciones`**: restringido a solo superadmin (consistente con parqueadero y sistema)
- Scripts principales (`scripts/`) sincronizados para instalaciones desde cero

---

## [1.15.1] - 2026-04-15

### Corrección de hydration mismatch en navegación SuperAdmin

#### Corregido
- **SuperAdmin nav tabs**: extraído a componente `'use client'` propio (`SuperAdminNavTabs`) que renderiza el `<nav>`, los `NavLink` y el `ModulosDropdown` en un solo árbol cliente — elimina el mismatch de hidratación causado por pasar elementos React como props a través del límite RSC/cliente

---

## [1.15.0] - 2026-04-15

### Refactorización de navegación y mejoras visuales del header

#### Agregado
- **ModuleSwitcher**: dropdown desde el ícono del módulo activo para cambiar entre módulos y acceder al Panel Admin — reemplaza los botones sueltos del header
- **ModuleHeader compartido**: componente genérico que unifica el header de Movilidad y Parqueadero, eliminando ~80 líneas duplicadas
- **NavTabsGeneric**: componente de tabs configurable reutilizado por ambos módulos
- **lib/parqueadero/server/layout-data.ts**: queries en paralelo para el layout de parqueadero (patrón equivalente al de movilidad)
- **lib/types/layout.ts**: tipos compartidos `RolModulo`, `MOVILIDAD_ROL_COLORS`, `PARQUEADERO_ROL_COLORS`

#### Cambiado
- **SuperAdmin layout**: convertido a RSC async con validación server-side — elimina dependencia de `RequireSuperAdmin` client-side y el flicker de "Verificando permisos..."
- **Espaciado general del header**: altura aumentada a 4.5rem, padding de contenedor y tabs ampliado para reducir sensación de amontonamiento
- **Mobile nav**: mayor separación entre items y sección de usuario con fondo sutil

---

## [1.14.1] - 2026-04-15

### Corrección de cierres por inactividad en todos los dispositivos

#### Corregido
- **Sesión persistía indefinidamente**: `autoRefreshToken` de Supabase renovaba el JWT silenciosamente cada ~55 min aunque el usuario llevara días sin actividad — desactivado; el token solo se renueva con actividad real del usuario
- **Timer de inactividad no disparaba en background**: los browsers congelan `setTimeout` en tabs de fondo — se agregó handler `visibilitychange` que calcula el tiempo transcurrido real al volver al tab y cierra sesión si corresponde
- **iOS Safari `pagehide` cerraba sesiones incorrectamente**: el evento se disparaba al entrar a bfcache (cambiar de tab / minimizar app) — corregido con chequeo `event.persisted`
- **Mensaje de login desincronizado**: mostraba "10 minutos" fijo; ahora lee el valor real desde `SESSION_CONFIG`

#### Cambiado
- **Timeouts diferenciados por dispositivo**: web=5min, mobile=10min, tablet=10min

---

## [1.14.0] - 2026-03-14

### Filtro por placa en PDF y eliminación de inspecciones

#### Agregado
- **Filtro por placa en descarga por rango**: el diálogo de descarga PDF ahora incluye un select con las placas activas — permite descargar solo las inspecciones de un vehículo específico o de todos
- **Eliminar inspección**: opción disponible exclusivamente para superadmin en el menú de acciones de cada inspección, con confirmación previa. API route `DELETE /api/parqueadero/inspecciones/[id]` protegido con `requireSuperAdmin`

#### Corregido
- **Límite de inspecciones en listado**: subido de 100 a 1000 para que no se corten registros históricos al cargar la página

---

## [1.13.1] - 2026-03-11

### Compresión adaptativa de fotos en inspecciones

#### Corregido
- **Fotos pesadas rechazadas**: las imágenes de cámaras móviles modernas (8–15MB) ya no son rechazadas — se comprimen automáticamente en el cliente hasta ≤ 2MB antes de subirse
- **Límite de entrada**: sube de 5MB a 30MB para aceptar cualquier foto de dispositivo móvil; solo se rechaza si supera los 30MB (imposible comprimir en browser)
- **Compresión iterativa**: escala dimensiones a máx 1920×1080 y reduce calidad JPEG progresivamente (0.85 → 0.35) hasta alcanzar el target
- **Feedback al usuario**: toast informativo cuando la imagen fue optimizada automáticamente

---

## [1.13.0] - 2026-03-10

### Descarga de inspecciones por rango de fechas

#### Agregado
- **Descarga por rango**: nuevo botón "Descargar por rango" en la página de inspecciones — permite seleccionar fecha inicio y fecha fin para generar un PDF unificado con todas las inspecciones del período
- **PDF unificado**: portada con índice, estadísticas (total, aptas, no aptas) y tabla resumen; cada inspección incluye su contenido completo (info general, documentación, ítems, firmas, anexos fotográficos)

#### Corregido
- **Primeras inspecciones sin detalle de verificación**: la query de ítems ahora pagina en bloques de 1000 filas para evitar el límite por defecto de Supabase, que truncaba los ítems de las inspecciones más antiguas en rangos grandes
- **`[SE_MANTIENE]` en crudo en PDF**: `subsanado_observacion` con prefijo `[SE_MANTIENE]`, `[SUBSANADO]` o `[EMPEORO]` ahora se muestra como texto legible ("Se mantiene", "Subsanado", "Empeoró")
- **Colores de novedades en PDF**: cada novedad ahora tiene fondo y borde de color según su estado de resolución — verde (subsanado), amarillo/ámbar (se mantiene), rojo (empeoró), naranja (sin resolver)

---

## [1.12.0] - 2026-03-06

### Auditoría de logins fallidos y correcciones de consistencia

#### Agregado
- **Registro de logins fallidos**: cada intento de autenticación fallido queda registrado en `sys_auditoria` con correo, razón, IP y user agent, incluso sin sesión activa (función `registrar_login_fallido` con `GRANT TO anon`)
- **Migración 004**: `004_registrar_login_fallido.sql` — función SQL + GRANTs aplicados en producción

#### Corregido
- **Inconsistencias de auditoría en frontend**: `password_reseteado` se clasificaba como `movilidad` en vez de `usuario`; `modulo_activado/desactivado/configuracion_modificada` no tenían categoría ni descripción; filtro "Usuarios y Roles" no incluía eventos de tipo `rol`
- **Hardening compatible con `anon`**: `001_hardening.sql` ahora re-concede explícitamente `EXECUTE` de `registrar_login_fallido` a `anon` para no perder el permiso al re-ejecutar el script de hardening

---

## [1.11.3] - 2026-03-06

### Corrección de sesiones en móvil

#### Corregido
- **Sesiones duplicadas en navegación móvil**: `checkSession` corría en cada cambio de ruta, creando una sesión nueva por cada página visitada. Ahora `sessionInitializedRef` lo limita a una sola vez por montado
- **Error de red creaba sesión nueva**: `actualizarActividad()` retornaba `false` tanto para sesión cerrada como para error de red. Ahora tristate `'active' | 'inactive' | 'error'` — solo `'inactive'` confirmado por BD dispara creación de nueva sesión
- **Sesiones huérfanas en iOS**: `beforeunload` no dispara en iOS Safari. Agregado `pagehide` para cubrir cierre de pestaña/app en móviles

---

## [1.11.2] - 2026-03-06

### Corrección de sesiones — cierre confiable y auditoría completa

#### Corregido
- **Sesiones no se cerraban en BD al hacer logout**: `BotonCerrarSesion` llamaba `signOut()` antes de `registrarFin()` — para ese momento `auth.uid()` ya era NULL y el RPC fallaba silenciosamente. Ahora `registrarFin()` se ejecuta primero mientras la sesión Supabase aún es válida
- **Race condition en `SIGNED_OUT` listener**: el listener intentaba llamar `registrarFin()` después de que `signOut()` invalidaba el token, causando que `realizado_por` quedara NULL en auditoría. Eliminado — los flujos normales ya cierran correctamente antes del `signOut()`
- **Cierre de pestaña sin logout dejaba sesión `activa` indefinidamente**: agregado handler `beforeunload` con `navigator.sendBeacon` hacia `/api/close-session` para registrar el cierre en BD
- **Ctrl+Shift+T restauraba sessionStorage stale**: al reabrir una pestaña cerrada, Chrome restauraba el sessionId de la sesión ya cerrada impidiendo crear una nueva. Ahora `checkSession` verifica que el sessionId local siga activo en BD; si no, limpia y crea nueva sesión
- **`cerrar_sesiones_inactivas()` no dejaba rastro en auditoría**: la función cerraba sesiones en bulk sin registrar nada en `sys_auditoria`. Ahora audita individualmente cada sesión cerrada con `usuario_id` y motivo
- **`/api/close-session` llamaba `signOut()` innecesariamente**: al ser invocado vía `sendBeacon` (pestaña cerrándose), el `signOut()` causaba que un F5 expulsara al usuario. Eliminado — el JWT expira naturalmente

#### Agregado
- **`SessionManager.clearSessionId()`**: método público para limpiar estado stale de sesión en memoria y `sessionStorage`
- **`pg_cron` configurado**: limpieza automática horaria de sesiones expiradas por token JWT (`cerrar_sesiones_token_expirado`) e inactividad > 65 min (`cerrar_sesiones_inactivas`)
- **Migración 003**: `cerrar_sesiones_inactivas` mejorada + configuración `pg_cron`
- **Scripts SQL sincronizados**: fuentes de migraciones 001 y 002 actualizados para reflejar el estado real de producción (GRANTs, columnas `fotos`, `observaciones_fotos`, constraints e índices)

---

## [1.11.1] - 2026-03-04

### Corrección crítica — Redirect loop al iniciar sesión

#### Corregido
- **Login bloqueado en todos los tipos de usuario**: el middleware verificaba `sys_sesiones` fail-closed — si `registrarInicio` fallaba (RPC 401 sin GRANT EXECUTE) no se creaba el registro y el middleware redirigía a login en un loop. Ahora solo bloquea cuando hay evidencia de cierre forzado por admin (`forzada_cierre`) posterior al último login del usuario; logins frescos y sesiones pendientes de registro pasan sin redirección
- **Errores silenciosos en SessionManager**: `registrarInicio` ahora emite `console.warn` al fallar para facilitar diagnóstico

> **Acción requerida en BD** (si no se aplicó antes): ejecutar `scripts/migrations/001_grant_execute_sesiones.sql` en Supabase SQL Editor para otorgar `GRANT EXECUTE` a las funciones de sesión.

---

## [1.11.0] - 2026-03-03

### Seguridad (Olas 2–4) y correcciones en inspecciones

#### Seguridad
- Ola 2: Hardening de endpoints admin — validación de permisos, cierre de sesión robusto y limpieza de sesiones residuales
- Ola 3: Validación de contraseñas seguras y escape HTML en todas las plantillas de email
- Ola 4: Security headers globales (X-Frame-Options, CSP report-only, HSTS, Permissions-Policy), refactorización del middleware de sesión y limpieza de cookie residual

#### Corregido
- Firmas del inspector y del operador ahora son obligatorias para guardar una inspección preoperacional
- PDF de inspecciones: la observación de subsanación ahora aparece en la sección Novedades
- Middleware de sesión: eliminada verificación de inactividad duplicada (ya la maneja `SessionProvider` en cliente), evitando expulsiones incorrectas de sesión

---

## [1.10.0] - 2026-03-03

### Seguridad — Ola 1: Rate Limiting y Fix Host Header Injection

#### Seguridad
- Rate limiter in-memory en endpoints públicos: `forgot-password` (3/15 min por IP + 3/60 min por email), `sign-up` (3/60 min), `consulta` (10/1 min), `update-password` (10/15 min)
- Eliminado fallback inseguro al header `Host` en `forgot-password` — la URL de reset ahora deriva exclusivamente de variables de entorno (`NEXT_PUBLIC_SITE_URL` / `VERCEL_PROJECT_PRODUCTION_URL`)
- Bucket doble en `forgot-password`: por IP y por email, previniendo spam focalizado con rotación de IP
- Validación Zod de formato de email y longitud de nombre en `forgot-password` y `sign-up`
- Prioridad de extracción de IP: `x-vercel-forwarded-for` → `x-real-ip` → `x-forwarded-for`
- `encodeURIComponent` aplicado al `token_hash` en el reset URL
- Respuesta 429 estandarizada con header `Retry-After` en todos los endpoints limitados

---

## [1.9.2] - 2026-02-27

### Mejoras en inspecciones preoperacionales

#### Agregado
- Botón "Subsanar" en detalle de inspección, visible solo en la inspección más reciente del vehículo (inspecciones anteriores quedan en solo lectura)
- Formulario inline de subsanación por novedad: textarea de cierre + confirmar/cancelar

#### Corregido
- `observaciones_fotos` ahora se obtiene directamente de `parq_inspecciones` (no existía en la vista)
- Fechas de fotos eliminadas del PDF (la marca de agua en la imagen ya las incluye)
- Observación duplicada en formulario: al resolver novedad como "se mantiene" ya no aparece un segundo textarea redundante; la observación de resolución se sincroniza al nuevo item
- Bug: detección de inspección más reciente usaba `placa` en lugar de `vehiculo_id`

---

## [1.9.1] - 2026-02-26

### Corregido

#### Corregido
- Campo `fotos` faltaba en el SELECT de `parq_items_inspeccion` en `boton-descargar-inspeccion.tsx`
- Objeto de retrocompatibilidad `foto_url` en `documento-inspeccion-pdf.tsx` faltaba el campo `origen` requerido por `FotoConTimestamp`

---

## [1.9.0] - 2026-02-26

### Sistema de fotos multiples en inspecciones

#### Agregado
- Soporte de hasta 3 fotos por item de inspeccion y 5 fotos para observaciones generales
- Procesamiento de imagen en cliente con Canvas API: watermark de fecha/hora en esquina inferior derecha y badge de origen en esquina inferior izquierda
- Dos botones separados en el modal de captura para distinguir camara vs galeria (badge verde CAMARA / naranja GALERIA)
- Badge visual de origen en previsualizacion y vista de detalles de la inspeccion
- Nuevo tipo `FotoConTimestamp` con campos `url`, `timestamp` y `origen`
- Nuevo modulo `lib/parqueadero/procesamiento-imagen.ts` con funciones de Canvas API y optimizacion de imagen para movil
- Migracion `002_sistema_fotos_multiples_inspecciones.sql`: columnas JSONB `fotos` en `parq_items_inspeccion` y `observaciones_fotos` en `parq_inspecciones`
- PDF de inspeccion con anexos de fotos multiples, una por pagina con su timestamp

#### Cambiado
- Vista de detalles de inspeccion responsive: header con flex-wrap, grid de fotos adaptativo por breakpoint
- PDF actualizado para mostrar fotos multiples como paginas de anexo independientes

#### Corregido
- Zona horaria Colombia en `formatearFechaHora` usando `toColombiaTime()`
- Imports de `@radix-ui/react-*` en alert-dialog, button y sheet (reemplazaban importacion de `radix-ui` unificado)

#### Retrocompatibilidad
- Columna `foto_url` se conserva permanentemente con la primera foto del array para datos historicos

---

## [1.8.11] - 2026-02-20

### Seguridad / Corrección crítica

#### Corregido
- **Redirect loop silencioso en login**: el middleware verificaba `sys_sesiones` incondicionalmente para todos los usuarios autenticados — si `registrarInicio` fallaba (401), no se creaba registro nuevo pero sí podía existir un registro antiguo con `ultima_actividad` desactualizada, lo que disparaba el cierre por inactividad inmediatamente al ingresar al dashboard. La cookie `session_registered` ahora actúa como guardia: el middleware solo consulta BD si esa cookie existe

---

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
