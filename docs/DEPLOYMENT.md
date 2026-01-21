# Guía de Despliegue

## Entornos

| Entorno | Rama | URL | Propósito |
|---------|------|-----|-----------|
| Desarrollo | `develop` | localhost:3000 | Desarrollo local |
| Staging | `develop` | (configurar) | Pruebas pre-producción |
| Producción | `main` | (configurar) | Producción |

## Requisitos Previos

### 1. Cuenta de Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Obtener credenciales:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWT_SECRET`

### 2. Cuenta de Vercel (Producción)

1. Crear cuenta en [vercel.com](https://vercel.com)
2. Conectar repositorio de GitHub

## Configuración de Base de Datos

### Ejecutar Migraciones

Las migraciones deben ejecutarse en orden desde el SQL Editor de Supabase:

```bash
# Orden de ejecución
scripts/
├── 00_configuracion/
│   ├── 001_timezone_colombia.sql      # 1. Timezone
│   └── 002_limpiar_bd.sql             # 2. Limpiar (opcional)
│
├── 01_sistema-usuarios/
│   ├── 001_tabla_perfiles.sql         # 3. Perfiles
│   ├── 002_trigger_nuevo_usuario.sql  # 4. Trigger de usuarios
│   ├── 003_roles_permisos.sql         # 5. Sistema de roles
│   ├── 004_tabla_sesiones.sql         # 6. Sesiones
│   ├── 005_tabla_auditoria.sql        # 7. Auditoría
│   └── 006_rls_perfiles.sql           # 8. RLS de perfiles
│
├── 03_modulo-movilidad/
│   ├── 001_tabla_organismos.sql       # 9. Organismos
│   ├── 002_tabla_cuentas.sql          # 10. Cuentas
│   ├── 003_tabla_traslados.sql        # 11. Traslados
│   ├── 004_tabla_radicaciones.sql     # 12. Radicaciones
│   ├── 005_tabla_novedades.sql        # 13. Novedades
│   ├── 006_tabla_transiciones.sql     # 14. Transiciones
│   ├── 007_tabla_empresas_transporte.sql  # 15. Empresas
│   ├── 008_dias_habiles.sql           # 16. Días hábiles
│   └── 009_rls_movilidad.sql          # 17. RLS movilidad
│
└── 99_vistas_finales/
    └── 001_vista_auditoria_completa.sql  # 18. Vista auditoría
```

### Verificar Migraciones

```sql
-- Verificar tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Verificar políticas RLS
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

## Variables de Entorno

### Archivo `.env.local` (Desarrollo)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret

# URLs de redirección
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/movilidad
```

### Variables en Vercel (Producción)

Configurar en: Project Settings → Environment Variables

| Variable | Entorno |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Production |
| `SUPABASE_JWT_SECRET` | Production |

## Despliegue Local

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/movilidad.git
cd movilidad

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Ejecutar migraciones en Supabase
# (usar SQL Editor de Supabase)

# 5. Iniciar servidor de desarrollo
npm run dev

# 6. Abrir http://localhost:3000
```

## Despliegue en Vercel

### Configuración Inicial

1. **Importar Proyecto**
   - Ir a [vercel.com/new](https://vercel.com/new)
   - Seleccionar repositorio de GitHub
   - Framework: Next.js (auto-detectado)

2. **Configurar Variables de Entorno**
   - Agregar todas las variables listadas arriba
   - Marcar las sensibles como "Sensitive"

3. **Configurar Dominio** (opcional)
   - Settings → Domains
   - Agregar dominio personalizado

### Despliegue Automático

Vercel despliega automáticamente cuando:
- Se hace push a `main` → Producción
- Se hace push a otras ramas → Preview

### Despliegue Manual

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar
vercel --prod
```

## Configuración de Supabase

### 1. Autenticación

En Supabase Dashboard → Authentication → Settings:

```
Site URL: https://tu-dominio.vercel.app
Redirect URLs:
  - https://tu-dominio.vercel.app/movilidad
  - http://localhost:3000/movilidad (desarrollo)
```

### 2. Row-Level Security

Verificar que RLS esté habilitado:

```sql
-- Listar tablas sin RLS (deberían ser 0)
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN (
    SELECT tablename FROM pg_policies WHERE schemaname = 'public'
  );
```

### 3. Funciones Edge (Opcional)

Si necesitas funciones serverless de Supabase:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Desplegar funciones
supabase functions deploy
```

## Verificación Post-Despliegue

### Checklist

- [ ] Página de login carga correctamente
- [ ] Login con credenciales funciona
- [ ] Redirección post-login correcta
- [ ] Dashboard muestra datos
- [ ] CRUD de cuentas funciona
- [ ] Generación de PDF funciona
- [ ] Consulta pública accesible
- [ ] Auditoría registra acciones

### Monitoreo

1. **Vercel Analytics**
   - Habilitar en Project Settings
   - Ver métricas de rendimiento

2. **Supabase Dashboard**
   - Monitorear queries
   - Ver logs de autenticación
   - Revisar uso de base de datos

## Rollback

### En Vercel

1. Ir a Deployments
2. Encontrar deployment anterior estable
3. Click en "..." → "Promote to Production"

### En Base de Datos

```sql
-- Antes de migraciones destructivas, hacer backup
-- Supabase hace backups automáticos diarios

-- Para rollback manual, restaurar desde backup
-- O revertir cambios con scripts de rollback
```

## Troubleshooting

### Error: "Invalid JWT"

- Verificar `SUPABASE_JWT_SECRET` coincide con Supabase
- Limpiar cookies del navegador

### Error: "RLS Policy Violation"

- Verificar políticas RLS están correctas
- Verificar usuario tiene permisos necesarios

### Error: "Build Failed"

```bash
# Verificar build localmente
npm run build

# Ver errores detallados
npm run lint
```

### Error: "Function Timeout"

- Verificar queries no son muy lentas
- Agregar índices si es necesario
- Considerar paginación para datos grandes
