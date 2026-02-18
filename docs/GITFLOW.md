# GitFlow - Movilidad

Guía de flujo de trabajo con Git, versionamiento semántico y proceso de release.

## Ramas

### Principales

| Rama | Propósito | Protegida |
|------|-----------|-----------|
| `main` | Producción estable | Sí |
| `develop` | Desarrollo e integración | Sí |

### De Soporte

| Tipo | Prefijo | Base | Merge a | Ejemplo |
|------|---------|------|---------|---------|
| Feature | `feature/` | develop | develop | `feature/MOV-123-validacion-api` |
| Hotfix | `hotfix/` | main | main + develop | `hotfix/MOV-789-login-error` |
| Release | `release/` | develop | main + develop | `release/v1.8.0` |
| Bugfix | `bugfix/` | develop | develop | `bugfix/MOV-456-filtros-reportes` |

### Nomenclatura

```
feature/[ticket-id]-descripcion-corta
bugfix/[ticket-id]-descripcion-corta
hotfix/[ticket-id]-descripcion-corta
release/vX.Y.Z
```

---

## Flujo de Trabajo

### 1. Nueva Funcionalidad (Feature)

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nombre-descriptivo

# Trabajar en la funcionalidad
git add .
git commit -m "feat: descripción del cambio"

# Subir rama y crear PR a develop
git push -u origin feature/nombre-descriptivo
```

### 2. Corrección Urgente (Hotfix)

```bash
git checkout main
git pull origin main
git checkout -b hotfix/descripcion-bug

# Corregir el bug
git add .
git commit -m "fix: descripción de la corrección"

# Subir rama → crear PR a main Y a develop
git push -u origin hotfix/descripcion-bug
```

### 3. Bugfix en Desarrollo

```bash
git checkout develop
git pull origin develop
git checkout -b bugfix/descripcion-bug

git add .
git commit -m "fix: descripción"

git push -u origin bugfix/descripcion-bug
```

### 4. Preparar Release

```bash
git checkout develop
git pull origin develop
git checkout -b release/vX.Y.Z
```

Después de crear la rama, seguir el **Proceso de Release** (sección siguiente).

---

## Convención de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos

| Tipo | Uso | Impacto en versión |
|------|-----|-------------------|
| `feat` | Nueva funcionalidad | MINOR |
| `fix` | Corrección de bug | PATCH |
| `security` | Corrección de seguridad | PATCH |
| `perf` | Mejora de rendimiento | PATCH |
| `docs` | Documentación | — |
| `style` | Formato, espacios | — |
| `refactor` | Refactorización sin cambio funcional | — |
| `test` | Agregar o corregir tests | — |
| `chore` | Tareas de mantenimiento | — |
| `ci` | Cambios en CI/CD | — |
| `build` | Cambios en build o dependencias | — |

### Ejemplos

```bash
feat(api): agregar validación con Zod en crear-usuario
fix(auth): corregir expiración de sesión
docs(readme): actualizar instrucciones de instalación
refactor(reportes): extraer lógica duplicada a componente genérico
perf(queries): agregar caché a consultas del dashboard
chore(deps): actualizar dependencias de seguridad

# Breaking change
feat(api)!: cambiar formato de respuesta de endpoints

BREAKING CHANGE: El campo 'data' ahora es un array en lugar de objeto
```

---

## Versionamiento Semántico

Determinar la nueva versión revisando **todos** los commits desde el último tag:

| Incremento | Cuándo aplicar | Ejemplo |
|------------|----------------|---------|
| **PATCH** (x.y.**Z**) | Solo `fix:`, `security:`, `perf:`, `chore:`, `docs:` | v1.7.0 → v1.7.1 |
| **MINOR** (x.**Y**.0) | Al menos un `feat:` (sin breaking changes) | v1.7.1 → v1.8.0 |
| **MAJOR** (**X**.0.0) | Breaking changes con `BREAKING CHANGE:` en footer | v1.8.0 → v2.0.0 |

> Si hay mezcla de tipos, gana el mayor: un `feat:` + varios `fix:` = MINOR.

---

## Proceso de Release

### Pre-requisitos

```bash
# Verificar que develop está estable
npm run build
npm run lint
```

### Checklist paso a paso

```bash
# 1. Revisar commits desde el último tag → determinar tipo de versión
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# 2. Actualizar docs/CHANGELOG.md con TODOS los cambios categorizados
#    (usar formato de la sección "Formato CHANGELOG" abajo)

# 3. Actualizar "version" en package.json
npm version <major|minor|patch> --no-git-tag-version

# 4. Actualizar los demás archivos con versión:
#    - docs/VERSIONING.md → agregar fila en historial
#    - README.md → badge de versión (versión-X.Y.Z-blue)
#    - public/sw.js → CACHE_NAME ('movilidad-vX.Y.Z')

# 5. Commit de preparación
git add package.json package-lock.json docs/CHANGELOG.md docs/VERSIONING.md README.md public/sw.js
git commit -m "chore(release): prepare vX.Y.Z"

# 6. Push release branch → PR a main → merge
git push -u origin release/vX.Y.Z

# 7. Después del merge a main: tag anotado
git checkout main && git pull origin main
git tag -a vX.Y.Z -m "Release vX.Y.Z — descripción breve"

# 8. Push tag
git push origin main --tags

# 9. Merge main → develop
git checkout develop && git merge main && git push origin develop
```

> **Nunca** crear un tag sin haber actualizado CHANGELOG y package.json primero.

### Archivos a actualizar en cada release

| Archivo | Qué cambiar |
|---------|-------------|
| `package.json` | `"version": "X.Y.Z"` |
| `docs/CHANGELOG.md` | Agregar sección con cambios categorizados |
| `docs/VERSIONING.md` | Agregar fila en historial de versiones |
| `README.md` | Badge: `versión-X.Y.Z-blue` |
| `public/sw.js` | `CACHE_NAME = 'movilidad-vX.Y.Z'` |
| `scripts/migrations/APPLIED.md` | Registrar migraciones aplicadas (si las hay) |

### Formato CHANGELOG

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Título descriptivo

#### Agregado
- Nueva funcionalidad

#### Cambiado
- Cambios en funcionalidad existente

#### Corregido
- Corrección de errores

#### Seguridad
- Vulnerabilidades corregidas

---
```

### Verificación post-release

```
- [ ] Tag visible en GitHub
- [ ] Vercel desplegó correctamente
- [ ] CHANGELOG refleja todos los cambios
- [ ] VERSIONING tiene la nueva fila
- [ ] Badge en README.md actualizado
- [ ] CACHE_NAME en public/sw.js actualizado
- [ ] App en producción funciona correctamente
```

El despliegue a producción es automático cuando se hace push a `main` (via Vercel).

---

## Reglas del Proyecto

### Antes de crear PR

1. Asegurar que el código compila: `npm run build`
2. Pasar linting: `npm run lint`
3. Ejecutar tests: `npm run test` (cuando existan)
4. Actualizar documentación si aplica

### Revisión de PR

- Mínimo 1 aprobación requerida
- CI debe pasar (lint, build, tests)
- No merge directo a `main` o `develop`

---

## Diagrama de Flujo

```
main     ─────●─────────────────●─────────────────●───────
              │                 ↑                 ↑
              │                 │                 │
hotfix        │         ●───●───┘                 │
              │         ↑                         │
              │         │                         │
release       │         │                 ●───●───┘
              │         │                 ↑
              ↓         │                 │
develop  ─────●─────●───┼─────●─────●─────┼─────●─────────
              ↓     ↑   │     ↓     ↑     │
              │     │   │     │     │     │
feature       ●─●───┘   │     ●─●───┘     │
                        │                 │
bugfix                  ●─────────────────┘
```

---

## Protección de Ramas (GitHub)

### main
- Require pull request reviews (1+)
- Require status checks to pass
- Require branches to be up to date
- No force push
- No deletions

### develop
- Require pull request reviews (1+)
- Require status checks to pass
- No force push

---

## Comandos Útiles

```bash
# Ver todas las ramas
git branch -a

# Ver historial de commits
git log --oneline -10

# Actualizar develop local
git checkout develop && git pull origin develop

# Eliminar rama local después de merge
git branch -d feature/nombre-rama

# Eliminar rama remota
git push origin --delete feature/nombre-rama

# Rebase de feature sobre develop actualizado
git checkout feature/mi-feature
git fetch origin
git rebase origin/develop

# Squash commits antes de PR
git rebase -i HEAD~3
```
