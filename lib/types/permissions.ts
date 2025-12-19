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
