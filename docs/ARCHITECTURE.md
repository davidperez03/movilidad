# Arquitectura del Sistema

## Vision General

Movilidad es una aplicacion web moderna construida con Next.js 16 y React 19, utilizando Supabase como backend. Sigue una arquitectura de componentes con separacion clara de responsabilidades.

```
+---------------------------------------------------------+
|                        Cliente                           |
|  +-----------+  +-----------+  +---------------------+  |
|  | Navegador |  |  Mobile   |  |  Consulta Publica   |  |
|  +-----+-----+  +-----+-----+  +----------+----------+  |
+---------+------------+-+-------------------+-------------+
          |            |                     |
          v            v                     v
+---------------------------------------------------------+
|                     Next.js App (PWA)                     |
|  +----------------------------------------------------+  |
|  |                    App Router                       |  |
|  |  +----------+ +----------+ +-----------+ +-------+ |  |
|  |  |/movilidad| |/parquead.| |/superadmin| | /auth | |  |
|  |  +----------+ +----------+ +-----------+ +-------+ |  |
|  +----------------------------------------------------+  |
|  +----------------------------------------------------+  |
|  |              API Routes (/api/admin/*)               |  |
|  |  crear-usuario | aprobar-usuario | resetear-password |  |
|  |  eliminar-usuario | cerrar-sesion | limpiar-sesiones |  |
|  +----------------------------------------------------+  |
|  +----------------------------------------------------+  |
|  |              API Routes (/api/auth/*)                |  |
|  |  forgot-password | sign-up | update-password         |  |
|  +----------------------------------------------------+  |
|  +----------------------------------------------------+  |
|  |              Servicios Compartidos                   |  |
|  |  Email (Nodemailer) | Auth Middleware | Logger       |  |
|  +----------------------------------------------------+  |
+---------------------------------------------------------+
                              |
                              v
+---------------------------------------------------------+
|                        Supabase                          |
|  +-----------+  +-----------+  +---------------------+  |
|  | PostgreSQL |  |   Auth    |  |     Storage         |  |
|  | + RLS      |  | + JWT     |  |   (imagenes)        |  |
|  +-----------+  +-----------+  +---------------------+  |
+---------------------------------------------------------+
```

## Modulos del Sistema

### 1. Movilidad (`/movilidad`)
Gestion de cuentas de vehiculos, traslados, radicaciones y reportes.

### 2. Parqueadero (`/parqueadero`)
Inspecciones preoperacionales, gestion de vehiculos y personal.

### 3. SuperAdmin (`/superadmin`)
Dashboard, gestion de usuarios, sesiones y auditoria.

### 4. Auth (`/auth`)
Login, sign-up, forgot-password, reset-password, cambiar-password.

### 5. Consulta Publica (`/consulta`)
Portal sin autenticacion para consultar estado de vehiculos.

## Estructura de Carpetas

```
sistema-movilidad/
|-- app/                          # Next.js App Router
|   |-- api/                      # API Routes
|   |   |-- admin/                # Endpoints de administracion
|   |   |   |-- aprobar-usuario/  # Aprobar usuario pendiente
|   |   |   |-- cerrar-sesion/    # Cerrar sesion de usuario
|   |   |   |-- crear-usuario/    # Crear nuevo usuario
|   |   |   |-- eliminar-usuario/ # Eliminar usuario
|   |   |   |-- limpiar-sesiones/ # Limpiar sesiones inactivas
|   |   |   +-- resetear-password/# Resetear contrasena
|   |   |-- auth/                  # Auth sin emails de Supabase
|   |   |   |-- forgot-password/  # Recuperar (admin.generateLink + SMTP)
|   |   |   |-- sign-up/          # Registro (admin.createUser, sin email)
|   |   |   +-- update-password/  # Cambiar (admin.updateUserById, sin email)
|   |   |-- client-info/          # Info del cliente
|   |   +-- close-session/        # Cierre de sesion (beacon)
|   |-- auth/                     # Autenticacion
|   |   |-- login/                # Inicio de sesion
|   |   |-- sign-up/              # Solicitar cuenta
|   |   |-- sign-up-success/      # Solicitud enviada
|   |   |-- forgot-password/      # Recuperar contrasena
|   |   |-- reset-password/       # Nueva contrasena (via link)
|   |   |-- cambiar-password/     # Cambio obligatorio (primer login)
|   |   |-- confirm/              # Callback para tokens de email
|   |   +-- error/                # Errores de auth
|   |-- movilidad/                # Modulo movilidad
|   |   |-- cuentas/              # Gestion de cuentas
|   |   |-- traslados/            # Gestion de traslados
|   |   |-- radicaciones/         # Gestion de radicaciones
|   |   |-- vehiculos/[placa]/    # Detalle de vehiculo
|   |   |-- reportes/             # Reportes y metricas
|   |   +-- estado/               # Estado general consolidado
|   |-- parqueadero/              # Modulo parqueadero
|   |   |-- inspecciones/         # Inspecciones preoperacionales
|   |   |-- vehiculos/            # Gestion de vehiculos
|   |   +-- personal/             # Gestion de personal
|   |-- superadmin/               # Panel de administracion
|   |   |-- dashboard/            # Dashboard principal
|   |   |-- usuarios/             # Gestion de usuarios
|   |   |-- sesiones/             # Gestion de sesiones
|   |   +-- auditoria/            # Sistema de auditoria
|   |-- consulta/                 # Consulta publica (sin auth)
|   +-- sin-acceso/               # Pagina sin permisos
|
|-- components/                    # Componentes React
|   |-- ui/                       # Componentes base (ShadCN)
|   |-- shared/                   # Componentes globales compartidos
|   |   |-- nav-link.tsx          # NavLink con color configurable
|   |   |-- confirm-dialog.tsx    # Dialogo de confirmacion
|   |   |-- mobile-nav.tsx        # Navegacion responsive (hamburguesa)
|   |   +-- empty-state.tsx       # Estado vacio reutilizable
|   |-- auth/                     # Componentes de autenticacion
|   |   |-- password-requirements.tsx  # Validacion visual de contrasena
|   |   |-- password-input.tsx    # Input con toggle de visibilidad (ojito)
|   |   |-- password-form.tsx     # Formulario compartido de contrasena
|   |   |-- back-to-login.tsx     # Link "Volver al inicio de sesion"
|   |   +-- RequirePermission.tsx # Guard de permisos
|   |-- movilidad/                # Componentes del modulo
|   |-- parqueadero/              # Componentes del modulo
|   |-- superadmin/               # Componentes de admin
|   +-- dashboard/                # Componentes de dashboard
|
|-- lib/                          # Utilidades y configuracion
|   |-- supabase/                 # Clientes de Supabase
|   |   |-- client.ts             # Cliente del navegador
|   |   |-- server.ts             # Cliente del servidor
|   |   |-- admin.ts              # Cliente admin (service role key)
|   |   +-- middleware.ts         # Cliente de middleware
|   |-- api/                      # Utilidades para API routes
|   |   +-- require-superadmin.ts # Middleware compartido de auth
|   |-- email/                    # Sistema de email
|   |   |-- transporter.ts        # Configuracion SMTP (Nodemailer)
|   |   |-- templates/            # Templates HTML de email
|   |   |   |-- base.ts           # Layout base, credentialBox, alertBox
|   |   |   |-- cuenta-aprobada.ts # Template aprobacion de cuenta
|   |   |   |-- recuperar-password.ts # Template recuperacion
|   |   |   |-- reset-password.ts # Template reset por admin
|   |   |   +-- index.ts          # Barrel export
|   |   +-- send-email.ts         # Funcion de envio
|   |-- types/                    # Tipos TypeScript globales
|   |   |-- usuario.ts            # Usuario, ConfirmState, FiltrosUsuarios
|   |   +-- permissions.ts        # Roles, modulos, permisos
|   |-- hooks/                    # React hooks personalizados
|   |-- utils/                    # Utilidades generales
|   |   |-- generate-password.ts  # Generador de contrasenas temporales
|   |   |-- capitalize.ts         # Capitalizar nombres (espanol)
|   |   +-- error-handler.ts      # Manejo de errores
|   |-- logger.ts                 # Logger estructurado (reemplaza console.error)
|   +-- env.ts                    # Variables de entorno validadas (Zod)
|
|-- public/                       # Archivos estaticos
|   |-- manifest.json             # PWA manifest
|   +-- icons/                    # Iconos PWA (192, 512, SVG)
|
|-- scripts/                      # Scripts de BD
|   |-- 00_configuracion/         # Setup inicial
|   |-- 01_sistema-usuarios/      # Usuarios y roles
|   |-- 02_modulo-movilidad/      # Esquema movilidad
|   |-- 03_modulo-parqueadero/    # Esquema parqueadero
|   +-- 99_vistas_finales/        # Vistas optimizadas
|
+-- docs/                         # Documentacion
```

## Patrones DRY/SOLID

### Middleware compartido de autenticacion
Todas las rutas API admin usan `requireSuperAdmin()` en lugar de repetir la logica de auth:
```ts
import { requireSuperAdmin } from '@/lib/api/require-superadmin'

export async function POST(request: NextRequest) {
  const auth = await requireSuperAdmin()
  if (auth.response) return auth.response
  // auth.userId contiene el ID del admin autenticado
}
```

### Tipos centralizados
Todas las interfaces de usuario se importan desde `lib/types/usuario.ts`:
```ts
import type { Usuario, ConfirmState, FiltrosUsuarios } from '@/lib/types/usuario'
import { CONFIRM_INITIAL } from '@/lib/types/usuario'
```

### NavLink compartido
Un solo componente `NavLink` con color configurable para todos los modulos:
```tsx
// Movilidad: usa colores por defecto (primary)
<NavLink href="/movilidad">Dashboard</NavLink>

// Parqueadero: usa cyan
<NavLink href="/parqueadero" activeClass="border-cyan-600 text-foreground">Dashboard</NavLink>
```

### Logger en lugar de console.error
Todas las rutas API usan `logger` para errores en servidor:
```ts
import { logger } from '@/lib/logger'
logger.error('Error en ruta', error)
```

## Flujo de Gestion de Usuarios

```
1. Admin crea usuario (email + nombre)
   -> pendiente de aprobacion (activo: false, email_confirm: false)

2. Admin aprueba usuario
   -> genera contrasena temporal
   -> confirma email en Supabase
   -> activa perfil
   -> envia email con credenciales via Nodemailer

3. Usuario inicia sesion con contrasena temporal
   -> detecta debe_cambiar_password en metadata
   -> redirige a /auth/cambiar-password

4. Usuario establece su contrasena
   -> limpia flag debe_cambiar_password
   -> redirige al modulo segun rol

5. Admin puede resetear contrasena
   -> genera nueva contrasena temporal
   -> envia email

6. Usuario puede recuperar contrasena
   -> /auth/forgot-password -> API genera link (admin.generateLink)
   -> Email via SMTP propio (no Supabase)
   -> /auth/reset-password -> verifyOtp(token_hash) -> nueva contrasena

7. Sign-up publico
   -> /auth/sign-up -> API crea usuario (admin.createUser, sin email)
   -> Mismo flujo de aprobacion que #1
```

## Independencia de Emails de Supabase

El sistema NO usa emails de Supabase para ninguna operacion:
- **Sign-up**: `admin.createUser()` en vez de `auth.signUp()` (no envia email)
- **Recovery**: `admin.generateLink()` + SMTP propio (no `resetPasswordForEmail()`)
- **Password change**: `admin.updateUserById()` (no `updateUser()` que notifica)
- **Reset por admin**: Genera temp password + email via SMTP

## Flujo de Autenticacion

```
1. Usuario ingresa credenciales en /auth/login
2. Supabase Auth valida y genera JWT
3. JWT se almacena en cookies (httpOnly)
4. Middleware valida JWT en cada request
5. Server Components acceden a sesion via createClient()
6. Errores de Supabase se traducen a espanol en el cliente
```

## Seguridad

### Proteccion contra enumeracion de emails
- Sign-up con email duplicado muestra la misma respuesta que sign-up exitoso
- Login no revela si el email existe o no

### Traduccion de errores
- Todos los errores de Supabase Auth se traducen a espanol
- No se exponen mensajes internos al usuario final

### Row-Level Security (RLS)
Cada tabla tiene politicas RLS que verifican usuario autenticado, rol y permisos.

### Validacion en Capas
```
Frontend      -> Validacion de formularios (Zod)
Middleware    -> Verificacion de sesion
API/Server    -> requireSuperAdmin() + validacion de datos
Database      -> RLS + Constraints + Triggers
```

## PWA (Progressive Web App)

- `manifest.json` con icono, nombre, colores del tema
- Iconos en 192px, 512px y SVG
- `apple-touch-icon` para iOS
- `viewport` con theme-color
- `standalone` display mode

## Base de Datos

### Esquema Principal
```
perfiles (auth.users) --> usuarios_roles --> roles_modulo
                                 |
                                 v
                              modulos

mov_cuentas_vehiculos --> mov_traslados --> mov_novedades
                      +-> mov_radicaciones

parq_vehiculos --> parq_inspecciones --> parq_items_inspeccion
```

### Trigger: manejar_nuevo_usuario()
Cuando se crea un usuario en auth, el trigger:
- Crea el perfil en `perfiles`
- Revisa metadata `pendiente_aprobacion`
- Si es pendiente: `activo = false`
- Si no es pendiente: `activo = true`

### Funciones Clave
- `obtener_transiciones_validas()`: Estados siguientes permitidos
- `sumar_dias_habiles()`: Dias habiles excluyendo festivos
- `es_superadmin()`: Verifica rol superadmin
- `tiene_permiso()`: Verifica permiso en modulo
- `manejar_nuevo_usuario()`: Trigger de creacion de perfil
