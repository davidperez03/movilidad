# Historial de Versiones

Resumen de todas las versiones del proyecto. Para detalle completo de cada release ver [CHANGELOG.md](./CHANGELOG.md).

Para el proceso de release y reglas de versionamiento semántico ver [GITFLOW.md](./GITFLOW.md).

| Versión | Fecha | Descripción |
|---------|-------|-------------|
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
