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
│   ├── api/                      # API Routes (mínimos)
│   │   ├── admin/                # Endpoints de administración
│   │   ├── client-info/          # Info del cliente
│   │   └── close-session/        # Cierre de sesión
│   ├── auth/                     # Autenticación
│   │   ├── login/                # Página de login
│   │   ├── sign-up/              # Registro
│   │   └── error/                # Errores de auth
│   ├── movilidad/                # Módulo principal
│   │   ├── cuentas/              # Gestión de cuentas
│   │   ├── traslados/            # Gestión de traslados
│   │   ├── radicaciones/         # Gestión de radicaciones
│   │   ├── vehiculos/[placa]/    # Detalle de vehículo
│   │   ├── reportes/             # Reportes y métricas
│   │   └── estado/               # Estado del sistema
│   ├── superadmin/               # Panel de administración
│   │   ├── dashboard/            # Dashboard principal
│   │   ├── usuarios/             # Gestión de usuarios
│   │   ├── sesiones/             # Gestión de sesiones
│   │   └── auditoria/            # Sistema de auditoría
│   ├── consulta/                 # Consulta pública
│   └── sin-acceso/               # Página sin permisos
│
├── components/                    # Componentes React
│   ├── ui/                       # Componentes base (Shadcn)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── alert-box.tsx         # AlertBox reutilizable
│   │   ├── submit-button.tsx     # SubmitButton con loading
│   │   └── ...
│   ├── movilidad/                # Componentes del módulo
│   │   ├── procesos/             # Formularios de procesos
│   │   ├── vehiculos/            # Componentes de vehículos
│   │   ├── modals/               # Modales específicos
│   │   ├── shared/               # Componentes compartidos
│   │   └── pdf/                  # Generación de PDFs
│   ├── dashboard/                # Componentes de dashboard
│   └── superadmin/               # Componentes de admin
│
├── lib/                          # Utilidades y configuración
│   ├── supabase/                 # Clientes de Supabase
│   │   ├── client.ts             # Cliente del navegador
│   │   ├── server.ts             # Cliente del servidor
│   │   └── middleware.ts         # Cliente de middleware
│   ├── hooks/                    # React hooks personalizados
│   │   ├── use-dialog-form.ts    # Hook para formularios en dialog
│   │   ├── use-organismos.ts     # Hook para organismos
│   │   └── use-buscar-vehiculo.ts
│   ├── movilidad/                # Lógica del módulo
│   │   ├── config.ts             # Configuración de estados
│   │   └── formatters.ts         # Formateadores
│   ├── config/                   # Configuración global
│   │   └── session.ts            # Config de sesiones
│   ├── types/                    # Tipos TypeScript
│   └── utils/                    # Utilidades generales
│       ├── index.ts              # cn(), formatDate(), etc.
│       └── lazy-components.tsx   # Lazy loading
│
├── scripts/                      # Scripts de BD
│   ├── 00_configuracion/         # Setup inicial
│   ├── 01_sistema-usuarios/      # Usuarios y roles
│   ├── 03_modulo-movilidad/      # Esquema movilidad
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
  { value: "sin_asignar", label: "Sin Asignar" },
  { value: "enviado_organismo", label: "Enviado a Organismo" },
  // ...
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
- `calcular_fecha_vencimiento()`: Calcula vencimiento (60 días hábiles)
- `verificar_permiso()`: Verifica si usuario tiene permiso específico
