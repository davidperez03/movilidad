# Sistema de Gestión de Sesiones

## Resumen

El sistema de sesiones garantiza que las sesiones de usuarios se cierren correctamente y no queden "huérfanas" cuando el navegador se cierra.

## Componentes del Sistema

### 1. Cierre Automático al Cerrar Navegador
**Archivo**: `components/session-provider.tsx`

- Listener `beforeunload` detecta cuando el usuario cierra la ventana/pestaña
- Usa `navigator.sendBeacon()` para enviar petición incluso al cerrar rápido
- Llama a `/api/close-session` para invalidar el token de Supabase

### 2. Validación en Middleware
**Archivo**: `lib/supabase/middleware.ts`

- Verifica que el usuario tenga una sesión **activa** en la base de datos
- Valida que el token no haya expirado usando `token_expira_en`
- Redirige a login si la sesión fue cerrada

### 3. Panel de Gestión para Superadmin
**Archivo**: `app/superadmin/sesiones/page.tsx`

El superadmin puede:
- Ver todas las sesiones activas en tiempo real
- Cerrar sesiones huérfanas manualmente
- Limpiar sesiones con token expirado (botón "Limpiar Tokens Expirados")
- Monitorear estadísticas de sesiones

### 4. Extracción Real del `exp` del JWT
**Archivo**: `scripts/01_sistema-usuarios/007b_sesiones_usuarios_token.sql`

- Función `extraer_exp_de_jwt()` decodifica el JWT y extrae la fecha de expiración real
- Almacena en columna `token_expira_en`
- NO usa suposiciones, usa el valor real del token

## Funciones de Base de Datos

### `cerrar_sesiones_token_expirado()`
Cierra sesiones cuyo token JWT ha expirado según el campo `exp`.

```sql
SELECT cerrar_sesiones_token_expirado();
```

### `superadmin_cerrar_sesion(p_sesion_id, p_admin_id)`
Permite a superadmins cerrar sesiones manualmente.

```sql
SELECT superadmin_cerrar_sesion(
  'sesion-uuid-aqui',
  'admin-uuid-aqui'
);
```

## Flujo de Sesión

### Inicio de Sesión
1. Usuario hace login → Supabase genera token JWT
2. `registrar_inicio_sesion()` crea registro en `sys_sesiones`
3. `extraer_exp_de_jwt()` guarda fecha de expiración del token

### Actividad del Usuario
1. Cada minuto de actividad → `actualizar_actividad_sesion()`
2. Middleware verifica sesión activa en cada request

### Cierre de Sesión

**Manual (usuario hace logout)**:
1. Click en "Cerrar Sesión"
2. `supabase.auth.signOut()` invalida token
3. `registrar_fin_sesion()` marca sesión como 'cerrada'

**Automático (usuario cierra navegador)**:
1. `beforeunload` detecta cierre
2. `sendBeacon` envía request a `/api/close-session`
3. Servidor invalida token y cierra sesión en DB

**Por inactividad**:
1. SessionProvider detecta inactividad
2. Cierra sesión automáticamente después de X minutos

**Manual por Superadmin**:
1. Superadmin ve sesión huérfana en panel
2. Click en "Cerrar" → llama a `superadmin_cerrar_sesion()`
3. Sesión marcada como 'forzada_cierre'

## Monitoreo de Sesiones

### Ver sesiones activas
```sql
SELECT * FROM sys_vista_sesiones_activas;
```

### Ver sesiones con token expirado
```sql
SELECT
  id,
  usuario_id,
  correo,
  inicio_sesion,
  token_expira_en
FROM sys_vista_sesiones_activas
WHERE token_expira_en < now();
```

### Contar sesiones por estado
```sql
SELECT estado, COUNT(*)
FROM sys_sesiones
GROUP BY estado;
```

## Panel de Superadmin

**Acceso**: `/superadmin/sesiones`

**Funcionalidades**:
- **Estadísticas**:
  - Total de sesiones activas
  - Usuarios únicos conectados
  - Inactividad promedio
  - Tokens expirados (sesiones huérfanas)

- **Acciones**:
  - Actualizar lista
  - Limpiar tokens expirados (cierra todas las sesiones huérfanas de una vez)
  - Cerrar sesión individual

## Auditoría

Todas las acciones de sesiones se registran en `sys_auditoria_sistema`:

- `login_exitoso`: Usuario inicia sesión
- `logout`: Usuario cierra sesión manualmente
- `sesion_expirada`: Sesión cerrada por inactividad
- `sesiones_token_expirado`: Limpieza masiva de tokens expirados
- `sesion_cerrada_por_admin`: Superadmin cerró sesión manualmente

## Notas Importantes

### ¿Por qué no hay cron job automático?

Las sesiones se cierran automáticamente con `beforeunload`, lo cual es suficiente para el 99% de los casos.

Las sesiones huérfanas (casos raros donde el navegador crasheó o se perdió conexión) se gestionan **manualmente** desde el panel de Superadmin.

### Ventajas de este Approach

✅ Menos complejidad (no hay cron jobs ni schedulers)
✅ Control manual del superadmin sobre sesiones problemáticas
✅ Validación real del token (no suposiciones)
✅ Auditoría completa de todas las acciones

### Desventajas

⚠️ Sesiones huérfanas requieren intervención manual del superadmin
⚠️ No hay limpieza automática programada

**Solución**: El superadmin puede ejecutar "Limpiar Tokens Expirados" cuando lo considere necesario (por ejemplo, una vez al día o al inicio de la semana).

## Testing

### 1. Probar cierre automático
1. Inicia sesión
2. Abre DevTools → Network
3. Cierra la pestaña
4. Verifica que se envió request a `/api/close-session`
5. Vuelve a abrir la app → deberías ser redirigido a login

### 2. Probar panel de superadmin
1. Inicia sesión como superadmin
2. Ve a `/superadmin/sesiones`
3. Verifica que aparezcan las sesiones activas
4. Haz click en "Limpiar Tokens Expirados"
5. Verifica que se cierren sesiones con token expirado

### 3. Probar cierre manual
1. Abre 2 navegadores diferentes con el mismo usuario
2. Como superadmin, ve a `/superadmin/sesiones`
3. Cierra manualmente una de las sesiones
4. El usuario en ese navegador debería ser redirigido a login

## Solución de Problemas

### Las sesiones no se cierran al cerrar navegador

**Causa**: El navegador bloqueó `beforeunload` o se cerró demasiado rápido

**Solución**: El superadmin puede cerrarlas manualmente desde `/superadmin/sesiones`

### Aparecen muchas sesiones con "Token expirado"

**Causa**: Usuarios cerraron navegadores sin que se enviara la petición

**Solución**: Click en "Limpiar Tokens Expirados" para cerrarlas todas

### Usuario no puede iniciar sesión después de cerrar sesión

**Causa**: Posible problema con cookies o caché

**Solución**: Limpiar cookies del navegador o usar modo incógnito
