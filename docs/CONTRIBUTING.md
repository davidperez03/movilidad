# Guía de Contribución

## Antes de Empezar

1. Lee la [Arquitectura del Sistema](./ARCHITECTURE.md)
2. Familiarízate con el [proceso de versionado](../VERSIONING.md)
3. Configura tu entorno de desarrollo

## Configuración del Entorno

```bash
# 1. Fork y clonar el repositorio
git clone https://github.com/tu-usuario/movilidad.git
cd movilidad

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Iniciar desarrollo
npm run dev
```

## Flujo de Trabajo

### 1. Crear Rama

```bash
# Actualizar develop
git checkout develop
git pull origin develop

# Crear rama de trabajo
git checkout -b feature/nombre-descriptivo
# o
git checkout -b bugfix/descripcion-del-bug
```

### 2. Desarrollar

- Escribe código siguiendo las convenciones del proyecto
- Agrega tests si es necesario
- Verifica que el linter pase: `npm run lint`
- Verifica que el build pase: `npm run build`

### 3. Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/es/):

```bash
# Ejemplos
git commit -m "feat(movilidad): agregar filtro por fecha en reportes"
git commit -m "fix(auth): corregir error de redirección en logout"
git commit -m "docs: actualizar guía de instalación"
git commit -m "refactor(ui): extraer componente AlertBox"
```

### 4. Push y Pull Request

```bash
# Push de la rama
git push -u origin feature/nombre-descriptivo

# Crear PR en GitHub hacia develop
```

## Convenciones de Código

### TypeScript

```typescript
// ✅ Usar tipos explícitos en props de componentes
interface ButtonProps {
  variant: 'primary' | 'secondary'
  onClick: () => void
  children: React.ReactNode
}

// ✅ Usar tipos en lugar de any
function processData(data: ProcessData[]): Result {
  // ...
}

// ❌ Evitar any
function processData(data: any): any {
  // ...
}
```

### Componentes React

```tsx
// ✅ Componentes funcionales con tipos
interface CardProps {
  title: string
  children: React.ReactNode
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  )
}

// ✅ "use client" solo cuando es necesario
"use client"

import { useState } from "react"

export function InteractiveComponent() {
  const [count, setCount] = useState(0)
  // ...
}
```

### Estilos (Tailwind CSS)

```tsx
// ✅ Usar cn() para clases condicionales
import { cn } from "@/lib/utils"

<button
  className={cn(
    "px-4 py-2 rounded",
    isActive && "bg-primary text-white",
    isDisabled && "opacity-50 cursor-not-allowed"
  )}
>

// ✅ Usar componentes de ui/ para consistencia
import { Button } from "@/components/ui/button"
import { AlertBox } from "@/components/ui/alert-box"

<AlertBox variant="warning" title="Advertencia">
  Mensaje aquí
</AlertBox>
```

### Estructura de Archivos

```
components/
├── ui/                    # Componentes base reutilizables
│   └── nuevo-componente.tsx
├── movilidad/             # Componentes del módulo
│   ├── procesos/          # Por funcionalidad
│   └── shared/            # Compartidos en el módulo
```

### Nombres de Archivos

- Componentes: `kebab-case.tsx` (ej: `alert-box.tsx`)
- Hooks: `use-nombre.ts` (ej: `use-dialog-form.ts`)
- Utilidades: `kebab-case.ts` (ej: `lazy-components.ts`)
- Tipos: `kebab-case.ts` en `lib/types/`

## Base de Datos

### Nuevas Migraciones

1. Crear archivo en `scripts/` con número secuencial
2. Documentar el propósito en comentario inicial
3. Incluir rollback si es posible

```sql
-- scripts/03_modulo-movilidad/010_nueva_tabla.sql
-- Descripción: Agregar tabla para X funcionalidad
-- Autor: Tu nombre
-- Fecha: 2025-01-21

-- Crear tabla
CREATE TABLE IF NOT EXISTS nueva_tabla (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- campos...
);

-- Agregar RLS
ALTER TABLE nueva_tabla ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "nombre_politica" ON nueva_tabla
FOR SELECT USING (auth.uid() IS NOT NULL);

-- ROLLBACK (comentado)
-- DROP TABLE IF EXISTS nueva_tabla;
```

### Convenciones de BD

- Tablas: `snake_case` con prefijo de módulo (`mov_`)
- Columnas: `snake_case`
- Índices: `idx_tabla_columna`
- Políticas: `accion_tabla` o descripción clara

## Tests

```bash
# Ejecutar tests (cuando estén configurados)
npm run test

# Tests con coverage
npm run test:coverage
```

## Documentación

- Actualiza el README si agregas funcionalidades
- Documenta componentes complejos con comentarios JSDoc
- Actualiza CHANGELOG.md en releases

```tsx
/**
 * AlertBox - Componente para mostrar mensajes de alerta
 *
 * @param variant - Tipo de alerta (success, error, warning, info, orange)
 * @param title - Título opcional del mensaje
 * @param children - Contenido del mensaje
 *
 * @example
 * <AlertBox variant="warning" title="Cuidado">
 *   Este es un mensaje de advertencia
 * </AlertBox>
 */
export function AlertBox({ variant, title, children }: AlertBoxProps) {
  // ...
}
```

## Review de Código

### Checklist para PRs

- [ ] El código sigue las convenciones del proyecto
- [ ] No hay errores de TypeScript (`npm run build`)
- [ ] No hay errores de lint (`npm run lint`)
- [ ] Los commits siguen Conventional Commits
- [ ] La documentación está actualizada si es necesario
- [ ] No hay console.log o código de debug

### Como Reviewer

- Sé constructivo y específico
- Sugiere mejoras, no solo señales problemas
- Aprueba cuando esté listo, no busques perfección

## Reportar Bugs

Usa GitHub Issues con esta plantilla:

```markdown
## Descripción
Descripción clara del bug

## Pasos para Reproducir
1. Ir a '...'
2. Click en '...'
3. Ver error

## Comportamiento Esperado
Qué debería pasar

## Comportamiento Actual
Qué está pasando

## Screenshots
Si aplica

## Entorno
- Navegador:
- Sistema Operativo:
- Versión de la app:
```

## Preguntas

Si tienes dudas:
1. Revisa la documentación existente
2. Busca en issues cerrados
3. Abre un issue con la etiqueta `question`
