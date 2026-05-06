export interface RolModulo {
  codigo: string
  nombre: string
}

/** Colores base compartidos por todos los módulos */
export const BASE_ROL_COLORS: Record<string, string> = {
  superadmin: "bg-red-100 text-red-700 border-red-300",
  sin_rol: "bg-gray-100 text-gray-500 border-gray-300",
}

/** Colores de roles del módulo Movilidad */
export const MOVILIDAD_ROL_COLORS: Record<string, string> = {
  ...BASE_ROL_COLORS,
  mov_administrador: "bg-purple-100 text-purple-700 border-purple-300",
  mov_operador: "bg-blue-100 text-blue-700 border-blue-300",
  mov_usuario: "bg-gray-100 text-gray-700 border-gray-300",
}

/** Colores de roles del módulo Parqueadero */
export const PARQUEADERO_ROL_COLORS: Record<string, string> = {
  ...BASE_ROL_COLORS,
  parq_administrador: "bg-purple-100 text-purple-700 border-purple-300",
  parq_auxiliar: "bg-blue-100 text-blue-700 border-blue-300",
  parq_operario: "bg-gray-100 text-gray-700 border-gray-300",
}

/** Colores de roles del módulo Peritaje */
export const NUNC_ROL_COLORS: Record<string, string> = {
  ...BASE_ROL_COLORS,
  nunc_admin: "bg-amber-100 text-amber-700 border-amber-300",
  nunc_operador: "bg-yellow-100 text-yellow-700 border-yellow-300",
}
