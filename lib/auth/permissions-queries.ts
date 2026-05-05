import { createClient } from '@/lib/supabase/client'
import type { RolUsuarioModulo, Modulo, CodigoRol } from '@/lib/types/permissions'

interface UsuarioRolRow {
  modulo_id: Modulo
  roles_modulo: {
    codigo: CodigoRol
    nombre: string
    permisos: Record<string, boolean>
    nivel: number
  } | null
}

interface PermissionsCache {
  userId: string
  data: { esSuperAdmin: boolean; roles: RolUsuarioModulo[] }
  expiresAt: number
}

let cache: PermissionsCache | null = null
const CACHE_TTL = 5 * 60 * 1000

export function invalidarCachePermisos(): void {
  cache = null
}

export async function cargarPermisosUsuario(): Promise<{
  esSuperAdmin: boolean
  roles: RolUsuarioModulo[]
}> {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) return { esSuperAdmin: false, roles: [] }

  if (cache && cache.userId === user.id && Date.now() < cache.expiresAt) {
    return cache.data
  }

  const { data: perfil, error: perfilError } = await supabase
    .from('perfiles')
    .select('rol_global')
    .eq('id', user.id)
    .single()

  if (perfilError) throw perfilError

  if (perfil?.rol_global === 'superadmin') {
    cache = { userId: user.id, data: { esSuperAdmin: true, roles: [] }, expiresAt: Date.now() + CACHE_TTL }
    return cache.data
  }

  const { data: rolesData, error: rolesError } = await supabase
    .from('usuarios_roles')
    .select(`
      modulo_id,
      roles_modulo (
        codigo,
        nombre,
        permisos,
        nivel
      )
    `)
    .eq('usuario_id', user.id)

  if (rolesError) throw rolesError

  const roles: RolUsuarioModulo[] = ((rolesData || []) as unknown as UsuarioRolRow[])
    .filter((r) => r.roles_modulo)
    .map((r) => ({
      modulo_id: r.modulo_id,
      rol_codigo: r.roles_modulo!.codigo,
      rol_nombre: r.roles_modulo!.nombre,
      permisos: (r.roles_modulo!.permisos || {}) as Record<string, boolean>,
      nivel: r.roles_modulo!.nivel,
    }))

  cache = { userId: user.id, data: { esSuperAdmin: false, roles }, expiresAt: Date.now() + CACHE_TTL }
  return cache.data
}
