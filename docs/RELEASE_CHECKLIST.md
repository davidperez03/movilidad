# Checklist de Release

## Antes de crear la rama release/vX.Y.Z

- [ ] Verificar que develop está estable
- [ ] `npm run build` pasa sin errores
- [ ] `npm run lint` pasa sin errores

## Al crear la rama release/vX.Y.Z

```bash
git checkout develop
git checkout -b release/vX.Y.Z
```

## Actualizar archivos de versión

1. **package.json** - Cambiar `"version": "X.Y.Z"`
2. **docs/CHANGELOG.md** - Agregar sección con cambios
3. **docs/VERSIONING.md** - Agregar fila en historial

## Formato CHANGELOG

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Título descriptivo

#### Agregado
- Nueva funcionalidad

#### Cambiado
- Cambios en funcionalidad existente

#### Corregido
- Corrección de errores

---
```

## Formato VERSIONING (historial)

```markdown
| X.Y.Z | YYYY-MM-DD | Descripción breve (máx 60 chars) |
```

## Commit de preparación

```bash
git add package.json docs/CHANGELOG.md docs/VERSIONING.md
git commit -m "chore: preparar release vX.Y.Z"
```

## Merge a main y tag

```bash
git checkout main
git pull origin main
git merge release/vX.Y.Z --no-ff -m "Merge release/vX.Y.Z"
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin main --tags
```

## Merge de vuelta a develop

```bash
git checkout develop
git merge release/vX.Y.Z --no-ff
git push origin develop
git branch -d release/vX.Y.Z
```

## Verificar

- [ ] Tag creado en GitHub
- [ ] Vercel desplegó correctamente
- [ ] CHANGELOG refleja todos los cambios
- [ ] VERSIONING tiene la nueva entrada
