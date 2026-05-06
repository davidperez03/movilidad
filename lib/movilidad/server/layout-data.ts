import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

interface RolModulo {
  codigo: string
  nombre: string
}

interface LayoutData {
  contadores: {
    trasladosActivos: number
    radicacionesActivas: number
    novedadesPendientes: number
  }
  rolModulo: RolModulo
  tieneParqueadero: boolean
  tieneNunc: boolean
}

/**
 * Obtiene todos los datos necesarios para el layout de movilidad
 * en la menor cantidad de queries posible.
 */
export async function obtenerLayoutData(
  userId: string,
  esSuperAdmin: boolean
): Promise<LayoutData> {
  const supabase = await createClient()

  // Una sola query para obtener todos los roles del usuario
  // (antes eran 3 queries separadas: acceso, rol, módulos)
  const [{ data: rolesUsuario }, { data: contadoresData }] = await Promise.all([
    supabase
      .from('usuarios_roles')
      .select(`
        modulo_id,
        roles_modulo (
          codigo,
          nombre
        )
      `)
      .eq('usuario_id', userId),
    supabase.rpc('obtener_contadores_movilidad'),
  ])

  // Extraer rol de movilidad
  const rolMovilidad = rolesUsuario?.find(r => r.modulo_id === 'movilidad')
  const rolModuloRaw = rolMovilidad?.roles_modulo as unknown as { codigo: string; nombre: string } | null
  const rolModulo: RolModulo = esSuperAdmin
    ? { codigo: 'superadmin', nombre: 'SuperAdmin' }
    : (rolModuloRaw ?? { codigo: 'sin_rol', nombre: 'Sin rol' })

  // Verificar acceso a parqueadero
  const modulosUsuario = new Set(rolesUsuario?.map(r => r.modulo_id) || [])
  const tieneParqueadero = esSuperAdmin || modulosUsuario.has('parqueadero')
  const tieneNunc        = esSuperAdmin || modulosUsuario.has('nunc')

  // Contadores
  const c = (contadoresData ?? {}) as Record<string, number>
  if (!contadoresData) {
    logger.error("Error obteniendo contadores para layout", { userId })
  }

  return {
    contadores: {
      trasladosActivos: c.traslados_activos ?? 0,
      radicacionesActivas: c.radicaciones_activas ?? 0,
      novedadesPendientes: c.novedades_pendientes ?? 0,
    },
    rolModulo,
    tieneParqueadero,
    tieneNunc,
  }
}
