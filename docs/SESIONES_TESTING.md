# Pruebas del Sistema de Sesiones

## Resumen de Cambios Implementados

Se implementaron 3 mejoras principales para solucionar el problema de sesiones que quedaban activas al cerrar el navegador:

1. **Listener `beforeunload`**: Cierra la sesión automáticamente cuando se cierra la ventana/pestaña
2. **Cron job automático**: Limpia sesiones inactivas cada 15 minutos
3. **Validación real de tokens**: Usa el campo `exp` del JWT para cerrar sesiones con token expirado

---

## 1. Probar Cierre al Cerrar Ventana

### Pasos:
1. Iniciar sesión en la aplicación
2. Abrir las herramientas de desarrollador (F12) > Pestaña Network
3. Filtrar por `/api/close-session`
4. Cerrar la pestaña/ventana del navegador
5. **Resultado esperado**: Debe aparecer una petición a `/api/close-session` con estado 200

### Verificación en Base de Datos:
```sql
-- Ver las últimas sesiones cerradas
SELECT
  id,
  usuario_id,
  inicio_sesion,
  fin_sesion,
  estado,
  duracion_minutos
FROM sys_sesiones
WHERE estado = 'cerrada'
ORDER BY fin_sesion DESC
LIMIT 10;
```

---

## 2. Probar Limpieza Automática de Sesiones

### Opción A: Ejecutar manualmente el endpoint de cron

```bash
# Con autenticación (si configuraste CRON_SECRET)
curl -X GET http://localhost:3000/api/cron/cleanup-sessions \
  -H "Authorization: Bearer movilidad-cron-secret-2026"

# Sin autenticación (en desarrollo)
curl -X GET http://localhost:3000/api/cron/cleanup-sessions
```

**Respuesta esperada:**
```json
{
  "success": true,
  "sesionsCerradas": 5,
  "inactivityMinutes": 60,
  "timestamp": "2026-01-02T12:00:00.000Z"
}
```

### Opción B: Verificar que el cron se ejecute automáticamente

El cron job está configurado para ejecutarse cada 15 minutos en producción (Vercel).

Para verificar:
1. Deployar a Vercel
2. Ir a Vercel Dashboard > Proyecto > Crons
3. Verificar que aparezca el cron `/api/cron/cleanup-sessions`
4. Ver los logs de ejecución

---

## 3. Probar Validación de Tokens Expirados

### Ver tokens con su fecha de expiración:
```sql
SELECT
  id,
  usuario_id,
  inicio_sesion,
  token_expira_en,
  estado,
  CASE
    WHEN token_expira_en < now() THEN 'EXPIRADO'
    ELSE 'VÁLIDO'
  END as token_estado
FROM sys_sesiones
WHERE estado = 'activa'
ORDER BY inicio_sesion DESC;
```

### Forzar expiración de token (para pruebas):
```sql
-- Actualizar una sesión para que su token "expire" ahora
UPDATE sys_sesiones
SET token_expira_en = now() - INTERVAL '5 minutes'
WHERE id = 'tu-sesion-id-aqui';

-- Ejecutar limpieza
SELECT cerrar_sesiones_inactivas(60);

-- Verificar que se cerró
SELECT estado FROM sys_sesiones WHERE id = 'tu-sesion-id-aqui';
-- Debe mostrar 'expirada'
```

---

## 4. Monitorear Sesiones Activas

### Vista de sesiones activas:
```sql
SELECT * FROM sys_vista_sesiones_activas;
```

### Contar sesiones por estado:
```sql
SELECT
  estado,
  COUNT(*) as cantidad
FROM sys_sesiones
GROUP BY estado;
```

### Sesiones con token expirado pero aún activas (NO debería haber):
```sql
SELECT
  id,
  usuario_id,
  inicio_sesion,
  token_expira_en,
  estado
FROM sys_sesiones
WHERE estado = 'activa'
  AND token_expira_en IS NOT NULL
  AND token_expira_en < now();

-- Si hay resultados, ejecutar limpieza:
SELECT cerrar_sesiones_inactivas(60);
```

---

## 5. Verificar Logs de Auditoría

Las sesiones cerradas deben registrarse en auditoría:

```sql
SELECT
  accion,
  tipo_entidad,
  detalles,
  creado_en
FROM sys_auditoria_sistema
WHERE accion IN ('logout', 'sesion_expirada', 'sesiones_expiradas_automaticamente')
ORDER BY creado_en DESC
LIMIT 20;
```

---

## Troubleshooting

### El evento `beforeunload` no se ejecuta

**Posibles causas:**
- El navegador bloqueó la petición (revisar consola)
- El usuario cerró muy rápido y el navegador canceló la petición
- sendBeacon no está disponible en el navegador

**Solución:**
Esto es normal en algunos casos. El cron job cerrará estas sesiones automáticamente cada 15 minutos.

### Las sesiones no se cierran automáticamente

**Verificar:**
1. El cron job está configurado en Vercel
2. La variable `SESSION_INACTIVITY_TIMEOUT` está configurada
3. Ejecutar manualmente: `curl http://localhost:3000/api/cron/cleanup-sessions`

### Las sesiones se cierran demasiado rápido

**Ajustar timeout:**
En `.env.local`, cambiar:
```
SESSION_INACTIVITY_TIMEOUT="120"  # 2 horas en lugar de 60 minutos
```

---

## Configuración de Variables de Entorno

Asegúrate de tener estas variables en `.env.local`:

```bash
# Secret para proteger el endpoint de cron
CRON_SECRET="movilidad-cron-secret-2026"

# Timeout de inactividad en minutos (default: 60)
SESSION_INACTIVITY_TIMEOUT="60"
```

---

## Próximos Pasos (Opcional)

1. **Agregar alerta cuando el token está por expirar**:
   - Mostrar notificación 5 minutos antes de expiración
   - Ofrecer refrescar el token

2. **Dashboard de sesiones activas para admins**:
   - Ver usuarios conectados en tiempo real
   - Permitir cerrar sesiones manualmente

3. **Límite de sesiones concurrentes**:
   - Permitir solo N sesiones activas por usuario
   - Cerrar la más antigua al crear una nueva
