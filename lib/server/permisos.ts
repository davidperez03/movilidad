import { createClient } from '@/lib/supabase/server'
import type { PermisosModulo } from '@/lib/hooks/use-permisos'

const PERMISOS_COMPLETOS: PermisosModulo = {
  ver: true,
  crear_cuentas: true,
  editar_cuentas: true,
  eliminar_cuentas: true,
  crear_traslados: true,
  editar_traslados: true,
  eliminar_traslados: true,
  crear_radicaciones: true,
  editar_radicaciones: true,
  eliminar_radicaciones: true,
  gestionar_novedades: true,
  configurar: true,
}

const PERMISOS_VACIOS: PermisosModulo = {
  ver: false,
  crear_cuentas: false,
  editar_cuentas: false,
  eliminar_cuentas: false,
  crear_traslados: false,
  editar_traslados: false,
  eliminar_traslados: false,
  crear_radicaciones: false,
  editar_radicaciones: false,
  eliminar_radicaciones: false,
  gestionar_novedades: false,
  configurar: false,
}

export async function obtenerPermisosUsuario() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        esSuperadmin: false,
        movilidad: PERMISOS_VACIOS,
      }
    }

    // Obtener perfil del usuario
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol_global')
      .eq('id', user.id)
      .single()

    const esSuperadmin = perfil?.rol_global === 'superadmin'

    // Si es superadmin, tiene todos los permisos
    if (esSuperadmin) {
      return {
        esSuperadmin: true,
        movilidad: PERMISOS_COMPLETOS,
      }
    }

    // Obtener roles modulares del usuario
    const { data: rolesUsuario } = await supabase
      .from('usuarios_roles')
      .select(`
        modulo_id,
        roles_modulo (
          permisos
        )
      `)
      .eq('usuario_id', user.id)

    // Extraer permisos de movilidad
    const rolMovilidad = rolesUsuario?.find(r => r.modulo_id === 'movilidad')
    const permisosMovilidad = (rolMovilidad?.roles_modulo as any)?.permisos as PermisosModulo | null

    return {
      esSuperadmin: false,
      movilidad: permisosMovilidad || PERMISOS_VACIOS,
    }

  } catch (error) {
    console.error('Error al cargar permisos:', error)
    return {
      esSuperadmin: false,
      movilidad: PERMISOS_VACIOS,
    }
  }
}
