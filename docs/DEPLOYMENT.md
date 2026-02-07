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

Las migraciones deben ejecutarse en orden desde el SQL Editor de Supabase.

**Ver documentación completa en:** `scripts/README.md`

```bash
# Estructura de scripts
scripts/
├── 00_configuracion/       # Configuración inicial
├── 01_sistema-usuarios/    # Autenticación y permisos
├── 02_modulo-movilidad/    # Módulo principal
│   ├── 01_tables/          # Tablas
│   ├── 02_functions/       # Funciones
│   ├── 03_triggers/        # Triggers
│   ├── 04_policies/        # RLS
│   ├── 05_data/            # Datos iniciales
│   └── 06_views/           # Vistas
└── 99_vistas_finales/      # Vistas consolidadas
```

**Orden de ejecución:** Ejecutar cada carpeta en orden numérico, y dentro de cada subcarpeta ejecutar los archivos en orden.

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

# Email (SMTP - Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM=Sistema Movilidad <tu-correo@gmail.com>
```

### Variables en Vercel (Producción)

Configurar en: Project Settings → Environment Variables

| Variable | Entorno | Descripción |
|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Clave pública anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Production | Clave de servicio (admin) |
| `SUPABASE_JWT_SECRET` | Production | Secreto JWT |
| `SMTP_HOST` | Production | Servidor SMTP (ej: smtp.gmail.com) |
| `SMTP_PORT` | Production | Puerto SMTP (ej: 587) |
| `SMTP_USER` | Production | Usuario SMTP |
| `SMTP_PASS` | Production | Contraseña SMTP / App Password |
| `SMTP_FROM` | Production | Remitente (ej: Sistema <correo>) |

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
  - https://tu-dominio.vercel.app/auth/confirm
  - https://tu-dominio.vercel.app/auth/reset-password
  - https://tu-dominio.vercel.app/auth/cambiar-password
  - http://localhost:3000/movilidad (desarrollo)
  - http://localhost:3000/auth/confirm (desarrollo)
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
- [ ] Redirección post-login correcta según rol
- [ ] Dashboard muestra datos
- [ ] CRUD de cuentas funciona
- [ ] Generación de PDF funciona
- [ ] Consulta pública accesible sin auth
- [ ] Auditoría registra acciones
- [ ] Crear usuario desde admin → queda pendiente
- [ ] Aprobar usuario → recibe email con contraseña temporal
- [ ] Login con contraseña temporal → redirige a cambiar contraseña
- [ ] Cambiar contraseña → acceso normal al módulo
- [ ] Resetear contraseña desde admin → email con nueva temporal
- [ ] Olvidé contraseña → email con link → nueva contraseña
- [ ] Sign-up público → pendiente de aprobación
- [ ] PWA instalable desde navegador
- [ ] Navegación responsive (hamburguesa en móvil)
- [ ] Variables SMTP configuradas y emails se envían

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
