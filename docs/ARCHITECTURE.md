# Arquitectura del Sistema

## Visión General

El Sistema de Movilidad es una aplicación web moderna construida con Next.js 16 y React 19, utilizando Supabase como backend. Sigue una arquitectura de componentes con separación clara de responsabilidades.

```
┌─────────────────────────────────────────────────────────────┐
│                        Cliente                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Navegador │  │   Mobile    │  │   Consulta Pública  │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    App Router                         │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────┐   │   │
│  │  │  /movilidad│ │ /superadmin│ │    /consulta   │   │   │
│  │  └────────────┘ └────────────┘ └────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Server Components (RSC)                  │   │
│  │  - Fetching de datos       - Renderizado inicial     │   │
│  │  - Autenticación           - SEO                     │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Client Components                        │   │
│  │  - Interactividad          - Estado local            │   │
│  │  - Formularios             - Animaciones             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Supabase                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  PostgreSQL │  │    Auth     │  │     Storage         │  │
│  │  + RLS      │  │  + JWT      │  │   (futuro)          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Estructura de Carpetas

```
sistema-movilidad/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── admin/                # Endpoints de administración
│   │   │   ├── cerrar-sesion/    # Cerrar sesión de usuario
│   │   │   ├── crear-usuario/    # Crear nuevo usuario
│   │   │   └── limpiar-sesiones/ # Limpiar sesiones inactivas
│   │   ├── client-info/          # Info del cliente
│   │   └── close-session/        # Cierre de sesión
│   ├── auth/                     # Autenticación
│   │   ├── login/                # Página de login
│   │   ├── sign-up/              # Registro
│   │   ├── sign-up-success/      # Registro exitoso
│   │   └── error/                # Errores de auth
│   ├── movilidad/                # Módulo principal
│   │   ├── cuentas/              # Gestión de cuentas
│   │   │   └── nueva/            # Nueva cuenta
│   │   ├── traslados/            # Gestión de traslados
│   │   │   └── nuevo/            # Nuevo traslado
│   │   ├── radicaciones/         # Gestión de radicaciones
│   │   │   └── nueva/            # Nueva radicación
│   │   ├── vehiculos/[placa]/    # Detalle de vehículo
│   │   ├── reportes/             # Reportes y métricas
│   │   │   ├── activos/          # Procesos activos
│   │   │   ├── completados/      # Procesos completados
│   │   │   └── por-vencer/       # Por vencer
│   │   └── estado/               # Estado general consolidado
│   ├── superadmin/               # Panel de administración
│   │   ├── dashboard/            # Dashboard principal
│   │   ├── usuarios/             # Gestión de usuarios
│   │   ├── sesiones/             # Gestión de sesiones
│   │   └── auditoria/            # Sistema de auditoría
│   ├── consulta/                 # Consulta pública (sin auth)
│   └── sin-acceso/               # Página sin permisos
│
├── components/                    # Componentes React
│   ├── ui/                       # Componentes base (Shadcn)
│   │   ├── data-table/           # Tabla con paginación y filtros
│   │   ├── alert-box.tsx         # AlertBox reutilizable
│   │   ├── submit-button.tsx     # SubmitButton con loading
│   │   └── ...                   # button, card, dialog, etc.
│   ├── movilidad/                # Componentes del módulo
│   │   ├── cuentas/              # Componentes de cuentas
│   │   ├── traslados/            # Tablas y columnas de traslados
│   │   ├── radicaciones/         # Tablas y columnas de radicaciones
│   │   ├── procesos/             # Formularios de procesos
│   │   ├── vehiculos/            # Componentes de vehículos
│   │   ├── estado/               # Componentes de estado general
│   │   ├── reportes/             # Componentes de reportes
│   │   ├── modals/               # Modales específicos
│   │   ├── shared/               # Componentes compartidos (badges)
│   │   └── pdf/                  # Generación de PDFs
│   ├── consulta/                 # Componentes consulta pública
│   ├── auth/                     # Componentes de autenticación
│   ├── dashboard/                # Componentes de dashboard
│   ├── superadmin/               # Componentes de admin
│   └── shared/                   # Componentes globales compartidos
│
├── lib/                          # Utilidades y configuración
│   ├── supabase/                 # Clientes de Supabase
│   │   ├── client.ts             # Cliente del navegador
│   │   ├── server.ts             # Cliente del servidor
│   │   └── middleware.ts         # Cliente de middleware
│   ├── hooks/                    # React hooks personalizados
│   ├── movilidad/                # Lógica del módulo
│   │   ├── config.ts             # Configuración de estados
│   │   ├── formatters.ts         # Formateadores de fechas/estados
│   │   ├── types.ts              # Tipos TypeScript del módulo
│   │   ├── columns/              # Definiciones de columnas de tablas
│   │   ├── reportes/             # Lógica de reportes
│   │   └── server/               # Funciones server-side
│   ├── auth/                     # Utilidades de autenticación
│   ├── server/                   # Funciones del servidor
│   ├── dashboard/                # Lógica del dashboard
│   ├── config/                   # Configuración global
│   ├── types/                    # Tipos TypeScript globales
│   └── utils/                    # Utilidades generales
│
├── scripts/                      # Scripts de BD (ver scripts/README.md)
│   ├── 00_configuracion/         # Setup inicial
│   ├── 01_sistema-usuarios/      # Usuarios y roles
│   ├── 02_modulo-movilidad/      # Esquema movilidad
│   └── 99_vistas_finales/        # Vistas optimizadas
│
└── docs/                         # Documentación
```

## Patrones de Diseño

### 1. Server Components por Defecto

Next.js 16 usa Server Components por defecto. Solo agregamos `"use client"` cuando es necesario:

```tsx
// Server Component (default) - Fetching de datos
export default async function Page() {
  const data = await fetchData()
  return <DataDisplay data={data} />
}

// Client Component - Interactividad
"use client"
export function InteractiveForm() {
  const [state, setState] = useState()
  return <form>...</form>
}
```

### 2. Composición de Componentes

Componentes pequeños y reutilizables que se componen:

```tsx
// Componente base
<AlertBox variant="warning" title="Advertencia">
  Contenido del mensaje
</AlertBox>

// Composición en página
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    <AlertBox variant="info">Info aquí</AlertBox>
    <FormularioProceso />
  </CardContent>
</Card>
```

### 3. Custom Hooks para Lógica Reutilizable

```tsx
// Hook para formularios en diálogos
const { open, setOpen, loading, handleSubmit } = useDialogForm({
  successMessage: "Guardado exitosamente",
  onSuccess: () => router.refresh(),
})

// Uso en componente
await handleSubmit(async () => {
  await supabase.from("tabla").insert(data)
}, { errorMessage: "Error al guardar" })
```

### 4. Configuración Centralizada

```tsx
// lib/movilidad/config.ts
export const ESTADOS_TRASLADO = [
  { value: "sin_asignar", label: "Sin asignar" },
  { value: "revisado", label: "Revisado" },
  { value: "con_novedades", label: "Con novedades" },
  { value: "aprobado", label: "Aprobado" },
  { value: "enviado_organismo", label: "Enviado a organismo" },
  { value: "trasladado", label: "Trasladado" },
  { value: "devuelto", label: "Devuelto" },
]

export const CONFIG_PROCESO = {
  traslado: {
    tabla: "mov_traslados",
    organismoField: "organismo_destino_id",
    // ...
  },
  radicacion: { /* ... */ }
}
```

## Flujo de Datos

### Autenticación

```
1. Usuario ingresa credenciales
2. Supabase Auth valida y genera JWT
3. JWT se almacena en cookies (httpOnly)
4. Middleware valida JWT en cada request
5. Server Components acceden a sesión via createClient()
```

### Operaciones CRUD

```
1. Server Component carga datos iniciales
2. Usuario interactúa con Client Component
3. Client Component llama a Supabase directamente
4. RLS valida permisos en base de datos
5. Trigger registra auditoría
6. router.refresh() actualiza Server Component
```

## Seguridad

### Row-Level Security (RLS)

Cada tabla tiene políticas RLS que verifican:
- Usuario autenticado
- Rol del usuario
- Permisos específicos

```sql
-- Ejemplo: Solo usuarios con permiso pueden ver traslados
CREATE POLICY "ver_traslados" ON mov_traslados
FOR SELECT USING (
  auth.uid() IS NOT NULL AND
  verificar_permiso(auth.uid(), 'movilidad', 'ver_traslados')
);
```

### Validación en Capas

```
┌─────────────────┐
│   Frontend      │  → Validación de formularios (Zod)
├─────────────────┤
│   Middleware    │  → Verificación de sesión
├─────────────────┤
│   API/Server    │  → Validación de datos
├─────────────────┤
│   Database      │  → RLS + Constraints + Triggers
└─────────────────┘
```

## Rendimiento

### Optimizaciones Implementadas

1. **Server Components**: Reducen JavaScript del cliente
2. **React.memo**: En componentes que reciben props estables
3. **Lazy Loading**: Componentes pesados (modales, PDFs)
4. **Parallel Fetching**: Múltiples queries en paralelo

```tsx
// Lazy loading de componentes pesados
const ModalDetallesUsuario = dynamic(
  () => import("./modal-detalles-usuario"),
  { loading: () => <Skeleton /> }
)

// Memoización de componentes
export const BadgeEstado = memo(function BadgeEstado({ estado }) {
  return <Badge>{estado}</Badge>
})
```

## Manejo de Errores

### Error Boundaries

```tsx
// app/movilidad/error.tsx
"use client"
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Algo salió mal</h2>
      <button onClick={reset}>Reintentar</button>
    </div>
  )
}
```

### Errores de Formularios

```tsx
// Hook useDialogForm maneja errores automáticamente
await handleSubmit(async () => {
  // Si esto lanza error, se muestra toast automáticamente
  await supabase.from("tabla").insert(data)
}, {
  errorMessage: "Error al guardar"
})
```

## Base de Datos

### Esquema Principal

```
┌──────────────────┐     ┌──────────────────┐
│     perfiles     │     │  usuarios_roles  │
│  (auth.users)    │────▶│                  │
└──────────────────┘     └──────────────────┘
                                │
                                ▼
┌──────────────────┐     ┌──────────────────┐
│ mov_cuentas_     │     │  roles_permisos  │
│   vehiculos      │     │                  │
└────────┬─────────┘     └──────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────────┐
│traslados│ │radicaciones│
└────┬───┘ └─────┬──────┘
     │           │
     └─────┬─────┘
           ▼
    ┌────────────┐
    │ novedades  │
    └────────────┘
```

### Funciones Clave

- `obtener_transiciones_validas()`: Retorna estados siguientes permitidos
- `sumar_dias_habiles()`: Suma N días hábiles a una fecha (considera festivos)
- `es_superadmin()`: Verifica si usuario es superadmin
- `tiene_permiso()`: Verifica si usuario tiene permiso específico en módulo
