// ============================================================================
// TIPOS DEL SISTEMA DE PERMISOS MODULARES
// ============================================================================

// Módulos disponibles en la aplicación
export type Modulo = 'movilidad';

// Rol global del usuario
export type RolGlobal = 'usuario' | 'superadmin';

// Códigos de roles por módulo
export type RolMovilidad = 'mov_usuario' | 'mov_operador' | 'mov_administrador';
export type CodigoRol = RolMovilidad | 'superadmin';

// Permisos del módulo Movilidad
export type PermisoMovilidad =
  | 'ver'
  | 'crear_cuentas'
  | 'editar_cuentas'
  | 'eliminar_cuentas'
  | 'crear_traslados'
  | 'editar_traslados'
  | 'eliminar_traslados'
  | 'crear_radicaciones'
  | 'editar_radicaciones'
  | 'eliminar_radicaciones'
  | 'gestionar_novedades'
  | 'configurar';

// Tipo unión de todos los permisos
export type Permiso = PermisoMovilidad;

// Tipo Record de permisos de movilidad (para compatibilidad)
export type PermisosModulo = Record<PermisoMovilidad, boolean>;

// ============================================================================
// CONSTANTES DE PERMISOS
// ============================================================================

/**
 * Permisos completos (todos en true)
 * Usado para superadmins y roles con acceso total
 */
export const PERMISOS_COMPLETOS: PermisosModulo = {
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

/**
 * Permisos vacíos (todos en false)
 * Usado como fallback cuando no hay permisos asignados
 */
export const PERMISOS_VACIOS: PermisosModulo = {
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

// ============================================================================
// INTERFACES DE BASE DE DATOS
// ============================================================================

export interface Perfil {
  id: string;
  correo: string;
  nombre_completo: string | null;
  rol_global: RolGlobal;
  url_avatar: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface ModuloDB {
  id: Modulo;
  nombre: string;
  descripcion: string | null;
  icono: string | null;
  ruta: string | null;
  activo: boolean;
  orden: number;
  creado_en: string;
  actualizado_en: string;
}

export interface RolModulo {
  id: string;
  modulo_id: Modulo;
  codigo: CodigoRol;
  nombre: string;
  descripcion: string | null;
  permisos: Record<string, boolean>;
  nivel: number;
  creado_en: string;
  actualizado_en: string;
}

export interface UsuarioRol {
  id: string;
  usuario_id: string;
  modulo_id: Modulo;
  rol_id: string;
  asignado_por: string | null;
  asignado_en: string;
}

// ============================================================================
// INTERFACES PARA EL HOOK
// ============================================================================

export interface RolUsuarioModulo {
  modulo_id: Modulo;
  rol_codigo: CodigoRol;
  rol_nombre: string;
  permisos: Record<string, boolean>;
  nivel: number;
}

export interface PermisosUsuario {
  roles: RolUsuarioModulo[];
  esSuperAdmin: boolean;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// TIPOS HELPER
// ============================================================================

// Mapeo de módulo a sus permisos
export type PermisoPorModulo<M extends Modulo> = M extends 'movilidad'
  ? PermisoMovilidad
  : never;

// Mapeo de módulo a sus roles
export type RolPorModulo<M extends Modulo> = M extends 'movilidad'
  ? RolMovilidad
  : never;
