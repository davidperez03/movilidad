/**
 * Detecta y formatea errores de Row Level Security (RLS) de Supabase
 * para mostrar mensajes amigables al usuario
 */

interface SupabaseError {
  message?: string
  code?: string
}

export function esErrorRLS(error: SupabaseError): boolean {
  if (!error) return false

  const mensaje = error.message?.toLowerCase() || ''
  const codigo = error.code

  return (
    mensaje.includes('row-level security') ||
    mensaje.includes('rls') ||
    mensaje.includes('policy') ||
    codigo === '42501' || // Insufficient privilege
    codigo === 'PGRST301' // PostgREST RLS violation
  )
}

export function obtenerMensajeRLS(error: SupabaseError, operacion: 'crear' | 'editar' | 'eliminar' | 'ver' = 'crear'): string {
  if (!esErrorRLS(error)) {
    return error.message || 'Error desconocido'
  }

  const mensajes = {
    crear: 'No tienes permisos para crear este recurso. Contacta a tu administrador si necesitas acceso.',
    editar: 'No tienes permisos para editar este recurso. Contacta a tu administrador si necesitas acceso.',
    eliminar: 'No tienes permisos para eliminar este recurso. Contacta a tu administrador si necesitas acceso.',
    ver: 'No tienes permisos para ver este recurso. Contacta a tu administrador si necesitas acceso.',
  }

  return mensajes[operacion]
}

/**
 * Maneja errores de Supabase y devuelve un mensaje amigable
 */
export function manejarErrorSupabase(
  error: SupabaseError,
  operacion: 'crear' | 'editar' | 'eliminar' | 'ver' = 'crear',
  recurso: string = 'este recurso'
): string {
  if (esErrorRLS(error)) {
    return obtenerMensajeRLS(error, operacion)
  }

  // Otros errores comunes
  if (error.code === '23505') {
    return `Ya existe ${recurso} con estos datos`
  }

  if (error.code === '23503') {
    return `No se puede ${operacion} ${recurso} porque está relacionado con otros datos`
  }

  if (error.code === '22P02') {
    return `Formato de datos inválido`
  }

  // Error genérico
  return error.message || `Error al ${operacion} ${recurso}`
}
