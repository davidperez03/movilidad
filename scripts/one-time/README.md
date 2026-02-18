# Migración de datos desde Excel

## Requisitos

- Python 3 con `openpyxl` instalado
- `psql` (cliente PostgreSQL)
- Archivo `data.xlsx` en la raíz del proyecto

## Paso a paso

### 1. Generar el SQL

```bash
python3 scripts/one-time/generar_sql.py
```

Lee las hojas **TRASLADOS** y **RADICADOS** de `data.xlsx` y genera `scripts/one-time/migracion_datos.sql`.

### 2. Reemplazar el email del administrador

```bash
sed -i "s/ADMIN@EJEMPLO.COM/admin@admin.com/g" scripts/one-time/migracion_datos.sql
```

El email debe existir en la columna `correo` de la tabla `perfiles`.

### 3. Obtener la URL de conexión

Tomar `SUPABASE_POSTGRES_URL_NON_POOLING` del archivo `.env.local` (puerto **5432**, no 6543):

```bash
source .env.local
echo $SUPABASE_POSTGRES_URL_NON_POOLING
```

### 4. Ejecutar con psql

```bash
psql "$SUPABASE_POSTGRES_URL_NON_POOLING" -f scripts/one-time/migracion_datos.sql
```

### 5. Verificar

Al final debe aparecer:

```
NOTICE:  RESULTADO DE LA MIGRACIÓN:
NOTICE:    Cuentas:       XXX
NOTICE:    Traslados:     XXX
NOTICE:    Radicaciones:  XXX
NOTICE:    Organismos:    XXX
COMMIT
```

Si aparece `ROLLBACK`, la migración falló y no se insertó nada.

## Notas

- Usa `DISABLE TRIGGER USER` (no `ALL`) por restricciones de permisos en Supabase.
- Registros sin `fecha_tramite` se omiten; la cuenta del vehículo sí se crea.
- Todo corre en una transacción: si algo falla, se revierte completo.
