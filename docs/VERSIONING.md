# Historial de Versiones

Resumen de todas las versiones del proyecto. Para detalle completo de cada release ver [CHANGELOG.md](./CHANGELOG.md).

Para el proceso de release y reglas de versionamiento semántico ver [GITFLOW.md](./GITFLOW.md).

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| 1.27.0 | 2026-06-17 | feat(turnos): módulo de turnos operativos para parqueadero |
| 1.26.3 | 2026-06-17 | fix(asistencia): excel agrupa jornadas y maneja turnos nocturnos |
| 1.26.2 | 2026-06-17 | fix(asistencia): emparejar ingreso/salida en turnos nocturnos que cruzan medianoche |
| 1.26.1 | 2026-06-17 | fix(asistencia): gestión de accesos muestra solo personal de parqueadero |
| 1.26.0 | 2026-06-17 | feat(asistencia): sistema de control de ingreso/salida por QR para parqueadero |
| 1.25.3 | 2026-05-07 | Fix(auditoria): NUNC en card/filtro propios, limpiar sesiones con admin client |
| 1.25.2 | 2026-05-07 | Fix(session): timeout inactividad web 5min → 30min |
| 1.25.1 | 2026-05-07 | Fix(movilidad): ocultar novedad en estados inválidos, RLS historial acciones visible a usuarios de movilidad |
| 1.25.0 | 2026-05-06 | Feat(nunc): Historial NUNC con formato sin separadores, base Excel compartida, Dialog para exportadores |
| 1.24.4 | 2026-05-06 | Perf+Fix(nunc): React.cache() en permisos, múltiples placas por NUNC permitidas |
| 1.24.3 | 2026-05-06 | Security: getUser() en permisos.ts, require-superadmin y require-permiso-parqueadero |
| 1.24.2 | 2026-05-06 | Fix(session): timeout móvil/tablet a 1h, advertencia 60s, toast sin duplicados |
| 1.24.1 | 2026-05-06 | Feat(nunc): hash chain SHA-256 + inmutabilidad en nunc_historial_acciones, verificación de integridad completa |
| 1.24.0 | 2026-05-06 | Security+Feat(nunc): auditoría con triggers, Excel sesiones/registros, rate limiting rutas públicas, getUser() en layouts |
| 1.23.0 | 2026-05-06 | Feat(nunc): módulo Estudios NUNC — sesiones con código temporal, formulario público sin auth, roles independientes, NUNC único validado en API y BD |
| 1.22.2 | 2026-05-05 | Perf(auth/navigation): reduce latencia entre módulos eliminando consultas redundantes de auth/roles en layouts server y ampliando throttle de verificación de sesión en middleware |
| 1.22.1 | 2026-05-05 | Fix(auth/perf): permite "." en contraseña, corrige logout al recargar, reduce latencia de navegación entre módulos con throttle de chequeo de sesión |
| 1.22.0 | 2026-05-05 | Perf+Fix(movilidad/auth): optimización de consultas de sesión y reportes, vistas consolidadas para detalle/completados, índices de rendimiento y mejoras generales de estabilidad |
| 1.21.0 | 2026-05-03 | feat(auditoria): no repudio con hash chain SHA-256 en 4 tablas, triggers de inmutabilidad, verificación de integridad, historial por entidad, inventarios en auditoría, CSP enforcement |
| 1.20.0 | 2026-04-18 | Fix(inventarios): rediseño móvil completo — header con dropdown, filtros scroll horizontal, card sticker grid, fix teclado en modales |
| 1.19.0 | 2026-04-18 | Perf+Fix: admin client singleton, getSession() en guards, Promise.all en permisos, fix sesiones móvil superadmin |
| 1.18.0 | 2026-04-18 | Feat(inventarios): banner deshacer 10s, exportes PDF/Excel/CSV, sticker como modal, confirmación agregar stock, fix móvil superadmin |
| 1.17.0 | 2026-04-17 | Feat(parqueadero): módulo de inventarios — stock por ubicación, stickers por rango, cierre de turno, useMutation/apiFetch reutilizables, migraciones 009-011 |
| 1.16.0 | 2026-04-16 | Feat(auditoria): refactorizar vista completa, cerrar brechas de cobertura — severidad, filtros rápidos, alertas, auditoría de passwords, migraciones 005-008 |
| 1.15.1 | 2026-04-15 | Fix(superadmin): corregir hydration mismatch en nav tabs — SuperAdminNavTabs como componente cliente propio |
| 1.15.0 | 2026-04-15 | Feat(layout): refactorización navegación — ModuleSwitcher, ModuleHeader compartido, NavTabsGeneric, SuperAdmin RSC, mejoras de espaciado |
| 1.14.1 | 2026-04-15 | Fix(session): corregir cierres por inactividad — autoRefreshToken desactivado, visibilitychange handler, fix pagehide iOS, timeouts por dispositivo |
| 1.14.0 | 2026-03-14 | Feat(inspecciones): filtro por placa en PDF por rango, eliminar inspección para superadmin, límite listado 1000 |
| 1.13.1 | 2026-03-11 | Fix(fotos): compresión adaptativa cliente — imágenes pesadas se comprimen a ≤2MB en lugar de rechazarse |
| 1.13.0 | 2026-03-10 | Feat(inspecciones): descarga por rango de fechas en PDF unificado, fix colores novedades y texto resolución |
| 1.12.0 | 2026-03-06 | Feat(auditoria): registrar login fallido con GRANT anon, correcciones de consistencia entre frontend y BD |
| 1.11.3 | 2026-03-06 | Fix(sessions): sesiones duplicadas en móvil, tristate actualizarActividad, pagehide para iOS Safari |
| 1.11.2 | 2026-03-06 | Fix(sessions): cierre confiable de sesiones en BD, auditoría completa, beforeunload para cierre de pestaña, pg_cron automático |
| 1.11.1 | 2026-03-04 | Fix(middleware): corregir redirect loop al login — middleware solo bloquea en cierre forzado por admin, no en ausencia de sesión |
| 1.11.0 | 2026-03-03 | Feat(security): Olas 2–4 SEV-1 — hardening admin, validación passwords, escape HTML emails, security headers, fix firmas obligatorias y PDF subsanación |
| 1.10.0 | 2026-03-03 | Feat(security): Ola 1 SEV-1 — rate limiting en endpoints públicos, fix host header injection, validación Zod, bucket doble por IP+email |
| 1.9.2 | 2026-02-27 | Fix(inspecciones): fotos observaciones desde tabla directa, subsanar solo en inspeccion reciente, sin fechas duplicadas en PDF |
| 1.9.1 | 2026-02-26 | Fix: errores TypeScript en fotos inspecciones — campo fotos en SELECT y origen en objeto legacy |
| 1.9.0 | 2026-02-26 | Feat(inspecciones): fotos multiples por item con timestamp y distincion camara/galeria, responsive y PDF actualizado |
| 1.8.11 | 2026-02-20 | Fix(auth): redirect loop silencioso — middleware solo verifica sys_sesiones con cookie de sesión registrada |
| 1.8.10 | 2026-02-20 | Fix(auth): login bloqueado por fallo de auditoría, GRANT EXECUTE funciones sesiones |
| 1.8.9 | 2026-02-20 | Fix(auth): cierre de sesión por inactividad y anulación completa de tokens |
| 1.8.7 | 2026-02-19 | Chore: eliminar package-lock.json del repo (proyecto usa pnpm) |
| 1.8.6 | 2026-02-19 | Fix: márgenes superiores y laterales en PDF de inspecciones preoperacionales |
| 1.8.5 | 2026-02-19 | Fix: oscurecer texto opaco en títulos y labels del PDF de inspecciones |
| 1.8.4 | 2026-02-19 | Fix: layout DataTable responsivo, PDF inspecciones sin cortes de sección |
| 1.8.3 | 2026-02-19 | Rediseño profesional plantillas Excel y PDF, fix pnpm-lock.yaml y .gitignore |
| 1.8.2 | 2026-02-19 | Fix: reemplazar xlsx (licencia comercial) por exceljs (MIT), agregar LICENSE |
| 1.8.1 | 2026-02-18 | Fix: login redirige al dashboard si hay sesión activa (botón atrás) |
| 1.8.0 | 2026-02-18 | Responsive completo en modales, popovers y dashboards (9 archivos) |
| 1.7.1 | 2026-02-17 | Responsive completo para móviles, lockfile sync, catálogo inspecciones |
| 1.7.0 | 2026-02-17 | Hardening BD, UX errores consulta pública, tablas responsivas |
| 1.6.0 | 2026-02-17 | Feat: reportes vencidos, radicaciones, mejoras parqueadero y humanización UI |
| 1.5.0 | 2026-02-11 | Feat: tipografía profesional (Plus Jakarta Sans, JetBrains Mono, Share Tech Mono) |
| 1.4.5 | 2026-02-10 | Chore: calidad de código, seguridad npm audit, tipos estrictos |
| 1.4.4 | 2026-02-10 | Fix: permisos modulares, licencias admins, capitalización parqueadero |
| 1.4.3 | 2026-02-10 | Fix: serialización iconos server→client en nav móvil |
| 1.4.2 | 2026-02-10 | Nav móvil completa, alternancia módulos, capitalización nombre |
| 1.4.1 | 2026-02-10 | Fix: URL email recovery, templates, parqueadero roles, capitalize |
| 1.4.0 | 2026-02-09 | Emails independientes, UX auth, auditoría completa, parqueadero audit |
| 1.3.1 | 2026-02-08 | Fix: reset password PKCE, PWA, branding Movilidad |
| 1.3.0 | 2026-02-07 | Gestión de usuarios, emails, PWA, parqueadero, refactorización DRY/SOLID |
| 1.2.2 | 2026-01-28 | Fix: mejorar visualización auditoría y agregar placa a historial |
| 1.2.1 | 2026-01-27 | Parche: login simplificado, fecha aprobación, estado aprobado en timeline |
| 1.2.0 | 2026-01-27 | Mejoras UI dashboard y tablas |
| 1.1.0 | 2026-01-27 | Estado aprobado para traslados |
| 1.0.1 | 2026-01-21 | Mejoras consulta pública y seguridad |
| 1.0.0 | 2026-01-21 | Primera versión estable |
