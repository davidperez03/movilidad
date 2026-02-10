# Guía de Versionado

Este proyecto utiliza [Semantic Versioning 2.0.0](https://semver.org/lang/es/) para el control de versiones.

## Formato de Versión

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de errores compatibles con versiones anteriores

### Ejemplos

| Versión | Tipo de cambio |
|---------|----------------|
| 1.0.0 → 2.0.0 | Cambio de API, migración de BD requerida, cambios breaking |
| 1.0.0 → 1.1.0 | Nueva funcionalidad, nuevo módulo, mejoras significativas |
| 1.0.0 → 1.0.1 | Bug fix, corrección de typos, ajustes menores |

## Flujo de Git (GitFlow)

### Ramas Principales

```
main        → Producción (solo releases estables)
develop     → Desarrollo (integración de features)
```

### Ramas de Trabajo

```
feature/*   → Nuevas funcionalidades
bugfix/*    → Corrección de errores en develop
hotfix/*    → Corrección urgente en producción
release/*   → Preparación de nueva versión
refactor/*  → Refactorización de código
```

### Flujo de Trabajo

```
1. Crear rama desde develop
   git checkout develop
   git checkout -b feature/nueva-funcionalidad

2. Desarrollar y hacer commits
   git add .
   git commit -m "feat: descripción del cambio"

3. Push y crear PR
   git push -u origin feature/nueva-funcionalidad

4. Merge a develop (después de revisión)
   git checkout develop
   git merge feature/nueva-funcionalidad --no-ff

5. Crear release cuando esté listo
   git checkout -b release/vX.Y.Z
   # Actualizar CHANGELOG.md y versión
   git commit -m "chore: preparar release vX.Y.Z"

6. Merge a main y tag
   git checkout main
   git merge release/vX.Y.Z --no-ff
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   git push origin main --tags

7. Merge release de vuelta a develop
   git checkout develop
   git merge release/vX.Y.Z --no-ff
```

## Convenciones de Commits

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/).

### Formato

```
<tipo>(<ámbito opcional>): <descripción>

[cuerpo opcional]

[pie opcional]
```

### Tipos de Commit

| Tipo | Descripción | Impacto en versión |
|------|-------------|-------------------|
| `feat` | Nueva funcionalidad | MINOR |
| `fix` | Corrección de error | PATCH |
| `docs` | Documentación | - |
| `style` | Formato (sin cambio de código) | - |
| `refactor` | Refactorización | - |
| `perf` | Mejora de rendimiento | PATCH |
| `test` | Agregar/modificar tests | - |
| `chore` | Tareas de mantenimiento | - |
| `ci` | Cambios en CI/CD | - |
| `build` | Cambios en build/deps | - |

### Ejemplos de Commits

```bash
# Nueva funcionalidad
feat(movilidad): agregar exportación de reportes a Excel

# Corrección de error
fix(auth): corregir redirección después de login

# Documentación
docs: actualizar guía de instalación

# Refactorización
refactor(ui): extraer componente AlertBox reutilizable

# Breaking change
feat(api)!: cambiar formato de respuesta de endpoints

BREAKING CHANGE: El campo 'data' ahora es un array en lugar de objeto
```

## Proceso de Release

### 1. Preparación

```bash
# Asegurar que develop está actualizado
git checkout develop
git pull origin develop

# Verificar que el build pasa
npm run build
npm run lint
```

### 2. Crear Rama de Release

```bash
git checkout -b release/v1.1.0
```

### 3. Actualizar Versión

1. Actualizar `package.json`:
```json
{
  "version": "1.1.0"
}
```

2. Actualizar `CHANGELOG.md` con los cambios

3. Commit de preparación:
```bash
git add .
git commit -m "chore: preparar release v1.1.0"
```

### 4. Merge y Tag

```bash
# Merge a main
git checkout main
git pull origin main
git merge release/v1.1.0 --no-ff -m "Merge release/v1.1.0"

# Crear tag
git tag -a v1.1.0 -m "Release v1.1.0"

# Push
git push origin main --tags

# Merge de vuelta a develop
git checkout develop
git merge release/v1.1.0 --no-ff

# Limpiar rama de release
git branch -d release/v1.1.0
```

### 5. Despliegue

El despliegue a producción se realiza automáticamente cuando se hace push a `main` (via Vercel).

## Hotfixes

Para correcciones urgentes en producción:

```bash
# Crear hotfix desde main
git checkout main
git checkout -b hotfix/v1.0.1

# Hacer la corrección
git commit -m "fix: descripción del hotfix"

# Merge a main
git checkout main
git merge hotfix/v1.0.1 --no-ff
git tag -a v1.0.1 -m "Hotfix v1.0.1"
git push origin main --tags

# Merge a develop también
git checkout develop
git merge hotfix/v1.0.1 --no-ff
git push origin develop
```

## Historial de Versiones

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| 1.4.4 | 2026-02-10 | Fix: permisos modulares, licencias admins, capitalización parqueadero |
| 1.4.3 | 2026-02-10 | Fix: serialización iconos server→client en nav móvil |
| 1.4.2 | 2026-02-10 | Nav móvil completa, alternancia módulos, capitalización nombre |
| 1.4.1 | 2026-02-10 | Fix: URL email recovery, templates, parqueadero roles, capitalize |
| 1.4.0 | 2026-02-09 | Emails independientes, UX auth, auditoria completa, parqueadero audit |
| 1.3.1 | 2026-02-08 | Fix: reset password PKCE, PWA, branding Movilidad |
| 1.3.0 | 2026-02-07 | Gestión de usuarios, emails, PWA, parqueadero, refactorización DRY/SOLID |
| 1.2.2 | 2026-01-28 | Fix: mejorar visualización auditoría y agregar placa a historial |
| 1.2.1 | 2026-01-27 | Parche: login simplificado, fecha aprobación, estado aprobado en timeline |
| 1.2.0 | 2026-01-27 | Mejoras UI dashboard y tablas |
| 1.1.0 | 2026-01-27 | Estado aprobado para traslados |
| 1.0.1 | 2026-01-21 | Mejoras consulta pública y seguridad |
| 1.0.0 | 2026-01-21 | Primera versión estable |

## Herramientas Recomendadas

- **Git Graph** (VS Code): Visualizar ramas y commits
- **Conventional Commits** (VS Code): Helper para formato de commits
- **GitLens** (VS Code): Información de git en el editor
