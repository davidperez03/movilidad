# Migraciones Incrementales

Scripts SQL que se aplican sobre la BD de producción **después** del setup inicial.

## Nomenclatura

```
NNN_descripcion_breve.sql
```

- `NNN` = número secuencial (001, 002, 003...)
- Siempre usar el siguiente número disponible
- Descripción en snake_case, máximo 50 caracteres

## Reglas

1. **Un archivo = un cambio lógico**. No mezclar tabla nueva + datos + policy en un solo archivo.
2. **Inmutables**: Una vez aplicado en producción, el archivo **nunca se modifica**. Si hay que corregir, crear una nueva migración.
3. **Idempotentes cuando sea posible**: Usar `IF NOT EXISTS`, `CREATE OR REPLACE`, `ON CONFLICT DO NOTHING`.
4. **Siempre incluir ROLLBACK** comentado al final del archivo.
5. **Orden importa**: Se ejecutan en orden numérico. Si 002 depende de 001, el orden natural lo resuelve.

## Cómo Ejecutar

```bash
# Ejecutar una migración específica
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/migrations/001_descripcion.sql

# Ejecutar todas las pendientes (revisar cuáles faltan primero)
./scripts/ejecutar.sh --migrations
```

## Registro Manual

Después de aplicar una migración en producción, marcarla en el archivo `APPLIED.md` de esta carpeta.

Ver `docs/MIGRATIONS.md` para la guía completa.
