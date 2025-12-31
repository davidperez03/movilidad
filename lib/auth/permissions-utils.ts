import type { Modulo, RolUsuarioModulo, CodigoRol } from '@/lib/types/permissions'

export function verificarPermiso(
  modulo: Modulo,
  permiso: string,
  esSuperAdmin: boolean,
  roles: RolUsuarioModulo[]
): boolean {
  if (esSuperAdmin) return true
  const rolModulo = roles.find((r) => r.modulo_id === modulo)
  return rolModulo?.permisos[permiso] === true
}

export function obtenerCodigoRol(
  modulo: Modulo,
  esSuperAdmin: boolean,
  roles: RolUsuarioModulo[]
): CodigoRol | null {
  if (esSuperAdmin) return 'superadmin'

  const rolModulo = roles.find((r) => r.modulo_id === modulo)
  return rolModulo?.rol_codigo || null
}

export function verificarAccesoModulo(
  modulo: Modulo,
  esSuperAdmin: boolean,
  roles: RolUsuarioModulo[]
): boolean {
  if (esSuperAdmin) return true
  return roles.some((r) => r.modulo_id === modulo)
}

export function obtenerNivelJerarquico(
  modulo: Modulo,
  esSuperAdmin: boolean,
  roles: RolUsuarioModulo[]
): number {
  if (esSuperAdmin) return 3
  const rolModulo = roles.find((r) => r.modulo_id === modulo)
  return rolModulo?.nivel ?? -1
}
