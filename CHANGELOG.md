# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.7.1] - 2025-02-17

### Nota de Release
Este release se realizó siguiendo un proceso simplificado debido a la urgencia de los cambios.

### Fixed
- **Responsive**: Mejoras en diseño responsive del formulario de inspecciones
  - Botón "Guardar Inspección" ahora es responsive (se adapta a móvil)
  - Botones de evaluación de items (bueno/regular/malo/no_aplica) más compactos en móvil
  - Botones de resolución de novedades con texto corto en móvil

### Changed
- **Catálogo de Inspecciones**: Actualización de items
  - Eliminado item: `LIQUIDO DE FRENOS` (NIV_FRENOS)
  - Eliminado item: `RAMPAS DE ACCESO` (GRU_RAMPAS)
  - Actualizado item: `ACEITE DE MOTOR` - descripción cambiada a "VALIDAR CON TESTIGO"

### Commits
- `6ddf398` - chore(release): prepare v1.7.1

---

## [1.7.0] - Versión anterior

Versión base antes de los cambios de v1.7.1.

---

## Tipos de Cambios

- `Added` - Nuevas funcionalidades
- `Changed` - Cambios en funcionalidades existentes
- `Deprecated` - Funcionalidades obsoletas que serán eliminadas
- `Removed` - Funcionalidades eliminadas
- `Fixed` - Correcciones de bugs
- `Security` - Mejoras de seguridad

## Convención de Versionado

- **MAJOR** (X.y.z) - Cambios incompatibles con versiones anteriores
- **MINOR** (x.Y.z) - Nuevas funcionalidades (compatibles hacia atrás)
- **PATCH** (x.y.Z) - Correcciones de bugs
