import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import type { PermisosModulo, PermisoParqueadero, PermisoNunc } from '@/lib/types/permissions'
import { PERMISOS_COMPLETOS, PERMISOS_VACIOS } from '@/lib/types/permissions'

const PERMISOS_PARQUEADERO_COMPLETOS: Record<PermisoParqueadero, boolean> = {
  ver: true,
  crear_inspecciones: true,
  editar_inspecciones: true,
  eliminar_inspecciones: true,
  gestionar_vehiculos: true,
  gestionar_inventario: true,
  configurar: true,
}

const PERMISOS_PARQUEADERO_VACIOS: Record<PermisoParqueadero, boolean> = {
  ver: false,
  crear_inspecciones: false,
  editar_inspecciones: false,
  eliminar_inspecciones: false,
  gestionar_vehiculos: false,
  gestionar_inventario: false,
  configurar: false,
}

const PERMISOS_NUNC_COMPLETOS: Record<PermisoNunc, boolean> = {
  ver: true,
  crear_sesiones: true,
  configurar: true,
}

const PERMISOS_NUNC_VACIOS: Record<PermisoNunc, boolean> = {
  ver: false,
  crear_sesiones: false,
  configurar: false,
}

export async function obtenerPermisosUsuario() {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user ?? null

    if (!user) {
      return {
        esSuperadmin: false,
        movilidad: PERMISOS_VACIOS,
        parqueadero: PERMISOS_PARQUEADERO_VACIOS,
        nunc: PERMISOS_NUNC_VACIOS,
      }
    }

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol_global')
      .eq('id', user.id)
      .single()

    const esSuperadmin = perfil?.rol_global === 'superadmin'

    if (esSuperadmin) {
      return {
        esSuperadmin: true,
        movilidad: PERMISOS_COMPLETOS,
        parqueadero: PERMISOS_PARQUEADERO_COMPLETOS,
        nunc: PERMISOS_NUNC_COMPLETOS,
      }
    }

    const { data: rolesUsuario } = await supabase
      .from('usuarios_roles')
      .select(`modulo_id, roles_modulo (permisos)`)
      .eq('usuario_id', user.id)

    const rolMovilidad = rolesUsuario?.find(r => r.modulo_id === 'movilidad')
    const rolMovData = rolMovilidad?.roles_modulo as unknown as { permisos: PermisosModulo } | null

    const rolParqueadero = rolesUsuario?.find(r => r.modulo_id === 'parqueadero')
    const rolParqData = rolParqueadero?.roles_modulo as unknown as { permisos: Record<PermisoParqueadero, boolean> } | null

    const rolPeritaje = rolesUsuario?.find(r => r.modulo_id === 'nunc')
    const rolPeritajeData = rolPeritaje?.roles_modulo as unknown as { permisos: Record<PermisoNunc, boolean> } | null

    return {
      esSuperadmin: false,
      movilidad: rolMovData?.permisos ?? PERMISOS_VACIOS,
      parqueadero: rolParqData?.permisos ?? PERMISOS_PARQUEADERO_VACIOS,
      nunc: rolPeritajeData?.permisos ?? PERMISOS_NUNC_VACIOS,
    }

  } catch (error) {
    logger.error("Error obteniendo permisos de usuario", { error })
    return {
      esSuperadmin: false,
      movilidad: PERMISOS_VACIOS,
      parqueadero: PERMISOS_PARQUEADERO_VACIOS,
      nunc: PERMISOS_NUNC_VACIOS,
    }
  }
}
