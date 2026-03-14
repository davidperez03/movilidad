# Movilidad

![Versión](https://img.shields.io/badge/versión-1.14.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1.0-black)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)

Sistema web integral para la gestión de procesos de movilidad vehicular, diseñado para organismos de tránsito. Permite administrar traslados y radicaciones de vehículos con control completo de estados, auditoría y consulta pública.

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [CHANGELOG](./docs/CHANGELOG.md) | Historial de cambios y versiones |
| [Versiones](./docs/VERSIONING.md) | Historial de versiones |
| [GitFlow](./docs/GITFLOW.md) | Flujo Git, versionado semántico y proceso de release |
| [Migraciones](./docs/MIGRATIONS.md) | Guía de migraciones de base de datos |
| [Arquitectura](./docs/ARCHITECTURE.md) | Arquitectura técnica del sistema |
| [Despliegue](./docs/DEPLOYMENT.md) | Guía de despliegue |
| [Contribución](./docs/CONTRIBUTING.md) | Guía para contribuidores |

## Características Principales

### Gestión de Movilidad
- **Cuentas de Vehículos**: Sistema centralizado de seguimiento con números de cuenta únicos (formato: YYYYMMDD-XXXXX)
- **Traslados**: Gestión completa del proceso de envío de vehículos a otros organismos de tránsito
- **Radicaciones**: Administración del proceso de recepción y registro de vehículos
- **Control de Novedades**: Registro y resolución de inconsistencias durante los procesos
- **Alertas de Vencimiento**: Sistema de priorización con código de colores según fecha de expiración
- **Documentos de Remisión**: Generación automática de PDFs para traslados

### Administración y Seguridad
- **Sistema de Roles Multi-nivel**: SuperAdmin > Administrador de Módulo > Operador > Usuario
- **Permisos Granulares**: Control de permisos por módulo y funcionalidad
- **Auditoría Completa**: Registro detallado de todas las acciones del sistema
- **Gestión de Sesiones**: Cierre automático por inactividad (5 minutos configurable)
- **Historial de Sesiones**: Tracking completo con IP, dispositivo y user agent

### Consulta Pública
- **Portal de Consulta**: Interfaz pública para consultar el estado de vehículos sin autenticación
- **Búsqueda por Placa**: Acceso rápido al estado actual del proceso
- **Información en Tiempo Real**: Estado, tipo de proceso, fecha de vencimiento y días restantes

## Stack Tecnológico

### Frontend & Framework
- **Next.js 16.1.0** - Framework React con App Router
- **React 19.2.0** - Con soporte para Server Components
- **TypeScript 5** - Desarrollo type-safe
- **Tailwind CSS 4.1.9** - Framework CSS utility-first
- **Radix UI** - Componentes accesibles y sin estilos
- **Shadcn/ui** - Biblioteca de componentes pre-construidos

### Backend & Base de Datos
- **Supabase** - PostgreSQL con características en tiempo real
- **Supabase Auth** - Sistema de autenticación
- **Row-Level Security (RLS)** - Seguridad a nivel de fila en base de datos

### Librerías Complementarias
- **React Hook Form** - Gestión de formularios
- **Zod** - Validación de esquemas
- **@react-pdf/renderer** - Generación de documentos PDF
- **Recharts** - Visualización de datos
- **Date-fns** - Utilidades de fechas
- **Lucide React** - Iconos
- **Sonner** - Notificaciones toast

## Estructura del Proyecto

```
sistema-movilidad/
├── app/                          # Next.js App Router
│   ├── api/                     # Rutas de API
│   ├── auth/                    # Páginas de autenticación
│   ├── movilidad/               # Módulo principal de movilidad
│   ├── superadmin/              # Panel de administración
│   └── consulta/                # Consulta pública
├── components/                   # Componentes React
│   ├── ui/                      # Componentes base (Shadcn)
│   ├── movilidad/               # Componentes del módulo
│   ├── dashboard/               # Componentes de dashboard
│   └── superadmin/              # Componentes de administración
├── lib/                         # Utilidades y configuración
│   ├── supabase/                # Clientes de Supabase
│   ├── hooks/                   # React hooks personalizados
│   ├── types/                   # Tipos TypeScript
│   └── utils/                   # Utilidades generales
├── scripts/                     # Scripts de migración de BD
│   ├── 00_configuracion/        # Configuración inicial
│   ├── 01_sistema-usuarios/     # Sistema de usuarios y roles
│   └── 03_modulo-movilidad/     # Esquema del módulo de movilidad
└── public/                      # Archivos estáticos
```

## Requisitos Previos

- Node.js 18+ y npm/pnpm
- Cuenta de Supabase con proyecto configurado
- PostgreSQL (a través de Supabase)

## Configuración e Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd sistema-movilidad
```

### 2. Instalar dependencias

```bash
npm install
# o
pnpm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SUPABASE_JWT_SECRET=tu_jwt_secret

# Database Connection
SUPABASE_POSTGRES_URL=postgresql://...
SUPABASE_POSTGRES_PRISMA_URL=postgresql://...

# Session Configuration
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/movilidad
```

### 4. Configurar la base de datos

Ejecutar los scripts de migración en orden desde la carpeta `scripts/`:

```bash
# 1. Configuración inicial
scripts/00_configuracion/001_timezone_colombia.sql
scripts/00_configuracion/002_limpiar_bd.sql

# 2. Sistema de usuarios
scripts/01_sistema-usuarios/*.sql (en orden numérico)

# 3. Módulo de movilidad
scripts/03_modulo-movilidad/*.sql (en orden numérico)

# 4. Vistas finales
scripts/99_vistas_finales/001_vista_auditoria_completa.sql
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
# o
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

## Scripts Disponibles

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Construye para producción
npm run start    # Inicia servidor de producción
npm run lint     # Ejecuta el linter
```

## Sistema de Permisos

### Roles Globales
- **usuario**: Usuario estándar del sistema
- **superadmin**: Administrador con acceso total

### Roles por Módulo (Movilidad)
- **mov_usuario**: Usuario básico del módulo
- **mov_operador**: Operador con permisos extendidos
- **mov_administrador**: Administrador del módulo

### Permisos Granulares
- `ver_dashboard`: Ver panel de control
- `crear_cuentas`: Crear nuevas cuentas de vehículos
- `editar_cuentas`: Modificar cuentas existentes
- `eliminar_cuentas`: Eliminar cuentas
- `crear_traslados`: Crear traslados
- `editar_traslados`: Modificar traslados
- `eliminar_traslados`: Eliminar traslados
- `crear_radicaciones`: Crear radicaciones
- `editar_radicaciones`: Modificar radicaciones
- `eliminar_radicaciones`: Eliminar radicaciones
- `gestionar_novedades`: Gestionar novedades
- `ver_reportes`: Ver reportes del sistema

## Configuración de Sesiones

La configuración de sesiones se encuentra en `lib/config/session.ts`:

```typescript
{
  INACTIVITY_TIMEOUT: 300000,        // 5 minutos
  WARNING_BEFORE_TIMEOUT: 30000,     // Advertencia 30s antes
  ENABLE_INACTIVITY_TIMEOUT: true,   // Activar/desactivar
  ACTIVITY_THROTTLE: 2000,           // Throttle de actividad
  ACTIVITY_EVENTS: ['mousedown', 'keydown', 'touchstart', 'click']
}
```

## Estados de Procesos

### Traslados
- `sin_asignar`: Sin asignar
- `enviado_organismo`: Enviado a organismo
- `revisado`: Revisado
- `con_novedades`: Con novedades
- `trasladado`: Completado
- `devuelto`: Devuelto

### Radicaciones
- Estados similares adaptados al flujo de recepción

## Características de Seguridad

- **Row-Level Security (RLS)**: Implementado en todas las tablas
- **Autenticación JWT**: Basada en tokens de Supabase
- **Auditoría Completa**: Registro de todas las modificaciones
- **Gestión de Sesiones**: Tracking de IP, dispositivo y actividad
- **Roles y Permisos**: Control granular de acceso
- **Protección CSRF**: Vía middleware de Supabase

## Desarrollo

### Arquitectura
- Server Components de Next.js para fetching de datos
- API Routes mínimos (principalmente endpoints de admin)
- Componentes accesibles basados en Radix UI
- SSR + Static Generation según necesidad

### Convenciones de Código
- TypeScript estricto
- ESLint para calidad de código
- Componentes reutilizables en `components/ui/`
- Hooks personalizados en `lib/hooks/`
- Utilidades en `lib/utils/`

## Despliegue

El proyecto está configurado para despliegue en Vercel:

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente desde la rama `main`