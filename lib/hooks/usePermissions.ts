'use client'

import { useEffect, useState } from 'react'
import type { Modulo, RolUsuarioModulo, CodigoRol } from '@/lib/types/permissions'
import { cargarPermisosUsuario } from '@/lib/auth/permissions-queries'
import {
  verificarPermiso,
  obtenerCodigoRol,
  verificarAccesoModulo,
  obtenerNivelJerarquico,
} from '@/lib/auth/permissions-utils'

interface UsePermissionsReturn {
  roles: RolUsuarioModulo[]
  esSuperAdmin: boolean
  loading: boolean
  error: string | null
  tienePermiso: (modulo: Modulo, permiso: string) => boolean
  obtenerRol: (modulo: Modulo) => CodigoRol | null
  tieneAccesoModulo: (modulo: Modulo) => boolean
  obtenerNivelRol: (modulo: Modulo) => number
  recargar: () => Promise<void>
}

export function usePermissions(): UsePermissionsReturn {
  const [roles, setRoles] = useState<RolUsuarioModulo[]>([])
  const [esSuperAdmin, setEsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarPermisos = async () => {
    try {
      setLoading(true)
      setError(null)

      const { esSuperAdmin: isSuperAdmin, roles: rolesUsuario } = await cargarPermisosUsuario()

      setEsSuperAdmin(isSuperAdmin)
      setRoles(rolesUsuario)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarPermisos()
  }, [])

  return {
    roles,
    esSuperAdmin,
    loading,
    error,
    tienePermiso: (modulo: Modulo, permiso: string) => verificarPermiso(modulo, permiso, esSuperAdmin, roles),
    obtenerRol: (modulo: Modulo) => obtenerCodigoRol(modulo, esSuperAdmin, roles),
    tieneAccesoModulo: (modulo: Modulo) => verificarAccesoModulo(modulo, esSuperAdmin, roles),
    obtenerNivelRol: (modulo: Modulo) => obtenerNivelJerarquico(modulo, esSuperAdmin, roles),
    recargar: cargarPermisos,
  }
}

interface UseModulePermissionsReturn {
  rol: CodigoRol | null
  nivel: number
  tieneAcceso: boolean
  esSuperAdmin: boolean
  loading: boolean
  puede: (permiso: string) => boolean
}

export function useModulePermissions(modulo: Modulo): UseModulePermissionsReturn {
  const { esSuperAdmin, loading, tienePermiso, obtenerRol, tieneAccesoModulo, obtenerNivelRol } = usePermissions()

  return {
    rol: obtenerRol(modulo),
    nivel: obtenerNivelRol(modulo),
    tieneAcceso: tieneAccesoModulo(modulo),
    esSuperAdmin,
    loading,
    puede: (permiso: string) => tienePermiso(modulo, permiso),
  }
}
