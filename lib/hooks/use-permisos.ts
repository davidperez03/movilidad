'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface PermisosModulo {
  ver: boolean
  crear_cuentas: boolean
  editar_cuentas: boolean
  eliminar_cuentas: boolean
  crear_traslados: boolean
  editar_traslados: boolean
  eliminar_traslados: boolean
  crear_radicaciones: boolean
  editar_radicaciones: boolean
  eliminar_radicaciones: boolean
  gestionar_novedades: boolean
  configurar: boolean
}

export interface PermisosUsuario {
  esSuperadmin: boolean
  rolGlobal: string | null
  movilidad: PermisosModulo | null
  tickets: any | null
  cargando: boolean
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

export function usePermisos(): PermisosUsuario {
  const [permisos, setPermisos] = useState<PermisosUsuario>({
    esSuperadmin: false,
    rolGlobal: null,
    movilidad: null,
    tickets: null,
    cargando: true,
  })

  useEffect(() => {
    const supabase = createClient()

    async function cargarPermisos(userId?: string) {
      try {
        // Si no se pasa userId, obtenerlo
        let user = null
        if (userId) {
          user = { id: userId }
        } else {
          const { data: { user: currentUser } } = await supabase.auth.getUser()
          user = currentUser
        }

        if (!user) {
          setPermisos({
            esSuperadmin: false,
            rolGlobal: null,
            movilidad: null,
            tickets: null,
            cargando: false,
          })
          return
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
          setPermisos({
            esSuperadmin: true,
            rolGlobal: 'superadmin',
            movilidad: {
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
            },
            tickets: null, // TODO: agregar permisos de tickets
            cargando: false,
          })
          return
        }

        // Obtener roles modulares del usuario
        const { data: rolesUsuario } = await supabase
          .from('usuarios_roles')
          .select(`
            modulo_id,
            rol_id,
            roles_modulo (
              codigo,
              permisos
            )
          `)
          .eq('usuario_id', user.id)

        // Extraer permisos de movilidad
        const rolMovilidad = rolesUsuario?.find(r => r.modulo_id === 'movilidad')
        const permisosMovilidad = (rolMovilidad?.roles_modulo as any)?.permisos as PermisosModulo | null

        setPermisos({
          esSuperadmin: false,
          rolGlobal: perfil?.rol_global || null,
          movilidad: permisosMovilidad || PERMISOS_VACIOS,
          tickets: null,
          cargando: false,
        })

      } catch (error) {
        console.error('Error al cargar permisos:', error)
        setPermisos({
          esSuperadmin: false,
          rolGlobal: null,
          movilidad: PERMISOS_VACIOS,
          tickets: null,
          cargando: false,
        })
      }
    }

    // Cargar permisos inicial
    cargarPermisos()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Usuario logueado o sesión refrescada
        cargarPermisos(session.user.id)
      } else {
        // Usuario deslogueado
        setPermisos({
          esSuperadmin: false,
          rolGlobal: null,
          movilidad: null,
          tickets: null,
          cargando: false,
        })
      }
    })

    // Cleanup: desuscribirse al desmontar
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return permisos
}

// Helper para verificar permisos específicos
export function tienePermiso(
  permisos: PermisosUsuario,
  modulo: 'movilidad' | 'tickets',
  permiso: keyof PermisosModulo
): boolean {
  if (permisos.esSuperadmin) return true
  if (modulo === 'movilidad') {
    return permisos.movilidad?.[permiso] || false
  }
  return false
}
