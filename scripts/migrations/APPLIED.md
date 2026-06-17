# Migraciones Aplicadas

Registro manual de migraciones ejecutadas en producción.

| # | Archivo | Fecha aplicado | Aplicado por | Versión app |
|---|---------|---------------|--------------|-------------|
| 001 | 001_grant_execute_sesiones.sql | 2026-02-20 | — | v1.8.11 |
| 002 | 002_sistema_fotos_multiples_inspecciones.sql | 2026-02-26 | — | v1.9.0 |
| 003 | 003_sesiones_auditoria_y_cron.sql | 2026-03-06 | — | v1.11.2 |
| 004 | 004_registrar_login_fallido.sql | 2026-03-06 | — | v1.12.0 |
| 005 | 005_auditoria_nuevas_acciones.sql | 2026-04-17 | — | v1.16.0 |
| 006 | 006_historial_ip_user_agent.sql | 2026-04-17 | — | v1.16.0 |
| 007 | 007_trigger_auditoria_modulos.sql | 2026-04-17 | — | v1.16.0 |
| 008 | 008_rls_historial_movilidad.sql | 2026-04-17 | — | v1.16.0 |
| 009 | 009_inventarios_tablas.sql | 2026-04-17 | — | v1.17.0 |
| 010 | 010_inventarios_rls.sql | 2026-04-17 | — | v1.17.0 |
| 011 | 011_inventarios_permisos_roles.sql | — | — | v1.17.0 |
| 012 | 012_auditoria_hash_chain.sql | 2026-05-03 | David | v1.21.0 |
| 013 | 013_auditoria_sesion_id.sql | 2026-05-03 | David | v1.21.0 |
| 014 | 014_auditoria_row_versioning.sql | 2026-05-03 | David | v1.21.0 |
| 015 | 015_inv_auditoria_y_personal_activo.sql | 2026-05-03 | David | v1.21.0 |
| 016 | 016_security_advisor_fixes.sql | 2026-05-03 | David | v1.21.0 |
| 017 | 017_auditoria_hash_fix.sql | 2026-05-03 | David | v1.21.0 |
| 018 | 018_hash_chain_todas_las_auditorias.sql | 2026-05-03 | David | v1.21.0 |
| 019 | 019_performance_indexes.sql | 2026-05-05 | David | v1.22.0 |
| 020 | 020_vista_proceso_activo_detalle.sql | 2026-05-05 | David | v1.22.0 |
| 021 | 021_vista_procesos_completados.sql | 2026-05-05 | David | v1.22.0 |
| 022 | 022_peritajes.sql | 2026-05-06 | David | v1.23.0 |
| 023 | 023_nunc_auditoria.sql | 2026-05-06 | David | v1.24.0 |
| 024 | 024_nunc_hash_chain.sql | 2026-05-06 | David | v1.24.1 |
| 025 | 025_historial_rls_movilidad.sql | 2026-05-07 | David | v1.25.1 |
| 026 | 026_asistencia.sql | 2026-06-17 | David | v1.26.0 |

<!--
Al aplicar una migración, agregar una fila:
| 001 | 001_agregar_campo_urgente.sql | 2026-02-20 | Juan | v1.8.0 |
-->
