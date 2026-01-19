# GitFlow - Sistema de Movilidad

Guía de flujo de trabajo con Git para el proyecto.

## Ramas Principales

| Rama | Propósito | Protegida |
|------|-----------|-----------|
| `main` | Producción estable | Sí |
| `develop` | Desarrollo e integración | Sí |

## Ramas de Soporte

| Tipo | Prefijo | Base | Merge a | Ejemplo |
|------|---------|------|---------|---------|
| Feature | `feature/` | develop | develop | `feature/validacion-api` |
| Hotfix | `hotfix/` | main | main + develop | `hotfix/fix-login` |
| Release | `release/` | develop | main + develop | `release/v1.2.0` |
| Bugfix | `bugfix/` | develop | develop | `bugfix/corregir-filtros` |

## Flujo de Trabajo

### 1. Nueva Funcionalidad (Feature)

```bash
# Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nombre-descriptivo

# Trabajar en la funcionalidad
git add .
git commit -m "feat: descripción del cambio"

# Subir rama
git push -u origin feature/nombre-descriptivo

# Crear PR a develop cuando esté listo
```

### 2. Corrección Urgente (Hotfix)

```bash
# Crear rama desde main
git checkout main
git pull origin main
git checkout -b hotfix/descripcion-bug

# Corregir el bug
git add .
git commit -m "fix: descripción de la corrección"

# Subir rama
git push -u origin hotfix/descripcion-bug

# Crear PR a main Y a develop
```

### 3. Preparar Release

```bash
# Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Ajustes finales (version bump, changelog)
git add .
git commit -m "chore: prepare release v1.2.0"

# Subir rama
git push -u origin release/v1.2.0

# Crear PR a main
# Después de merge a main, crear PR a develop
```

### 4. Bugfix en Desarrollo

```bash
# Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b bugfix/descripcion-bug

# Corregir
git add .
git commit -m "fix: descripción"

# Subir y crear PR a develop
git push -u origin bugfix/descripcion-bug
```

## Convención de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos de Commit

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Cambios en documentación |
| `style` | Formato, espacios, puntos y comas |
| `refactor` | Refactorización sin cambio funcional |
| `perf` | Mejoras de rendimiento |
| `test` | Agregar o corregir tests |
| `chore` | Tareas de mantenimiento |
| `ci` | Cambios en CI/CD |
| `build` | Cambios en build o dependencias |

### Ejemplos

```bash
feat(api): agregar validación con Zod en crear-usuario
fix(auth): corregir expiración de sesión
docs(readme): actualizar instrucciones de instalación
refactor(reportes): extraer lógica duplicada a componente genérico
perf(queries): agregar caché a consultas del dashboard
test(hooks): agregar tests para usePermissions
chore(deps): actualizar dependencias de seguridad
```

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

### Nomenclatura de Ramas

```
feature/[ticket-id]-descripcion-corta
bugfix/[ticket-id]-descripcion-corta
hotfix/[ticket-id]-descripcion-corta
release/vX.Y.Z
```

Ejemplos:
```
feature/MOV-123-validacion-api
bugfix/MOV-456-filtros-reportes
hotfix/MOV-789-login-error
release/v1.2.0
```

## Comandos Útiles

```bash
# Ver todas las ramas
git branch -a

# Ver estado actual
git status

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
git rebase -i HEAD~3  # últimos 3 commits
```

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

## Protección de Ramas (Configurar en GitHub)

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
