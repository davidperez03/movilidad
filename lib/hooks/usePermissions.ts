'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  Modulo,
  Permiso,
  RolUsuarioModulo,
  CodigoRol,
} from '@/lib/types/permissions';

// ============================================================================
// HOOK DE PERMISOS
// ============================================================================

interface UsePermissionsReturn {
  // Estado
  roles: RolUsuarioModulo[];
  esSuperAdmin: boolean;
  loading: boolean;
  error: string | null;

  // Métodos
  tienePermiso: (modulo: Modulo, permiso: string) => boolean;
  obtenerRol: (modulo: Modulo) => CodigoRol | null;
  tieneAccesoModulo: (modulo: Modulo) => boolean;
  obtenerNivelRol: (modulo: Modulo) => number;
  recargar: () => Promise<void>;
}

export function usePermissions(): UsePermissionsReturn {
  const [roles, setRoles] = useState<RolUsuarioModulo[]>([]);
  const [esSuperAdmin, setEsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarPermisos = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      // Obtener usuario actual
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        setRoles([]);
        setEsSuperAdmin(false);
        setLoading(false);
        return;
      }

      // Verificar si es superadmin
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('rol_global')
        .eq('id', user.id)
        .single();

      if (perfilError) throw perfilError;

      const esSA = perfil?.rol_global === 'superadmin';
      setEsSuperAdmin(esSA);

      // Si es superadmin, no necesita cargar roles específicos
      // (las funciones le darán acceso automático)
      if (esSA) {
        setRoles([]);
        setLoading(false);
        return;
      }

      // Cargar roles del usuario en cada módulo
      const { data: rolesData, error: rolesError } = await supabase
        .from('usuarios_roles')
        .select(
          `
          modulo_id,
          roles_modulo (
            codigo,
            nombre,
            permisos,
            nivel
          )
        `
        )
        .eq('usuario_id', user.id);

      if (rolesError) throw rolesError;

      if (rolesData) {
        const rolesFormateados: RolUsuarioModulo[] = rolesData.map(
          (r: any) => ({
            modulo_id: r.modulo_id as Modulo,
            rol_codigo: r.roles_modulo.codigo as CodigoRol,
            rol_nombre: r.roles_modulo.nombre,
            permisos: r.roles_modulo.permisos,
            nivel: r.roles_modulo.nivel,
          })
        );
        setRoles(rolesFormateados);
      }
    } catch (err: any) {
      console.error('Error cargando permisos:', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPermisos();
  }, []);

  // ============================================================================
  // MÉTODOS
  // ============================================================================

  /**
   * Verifica si el usuario tiene un permiso específico en un módulo
   */
  const tienePermiso = (modulo: Modulo, permiso: string): boolean => {
    // Superadmin tiene todos los permisos
    if (esSuperAdmin) return true;

    // Buscar rol del usuario en el módulo
    const rolModulo = roles.find((r) => r.modulo_id === modulo);
    if (!rolModulo) return false;

    // Verificar si el permiso específico está en true
    return rolModulo.permisos[permiso] === true;
  };

  /**
   * Obtiene el código del rol del usuario en un módulo
   */
  const obtenerRol = (modulo: Modulo): CodigoRol | null => {
    if (esSuperAdmin) return 'superadmin';

    const rolModulo = roles.find((r) => r.modulo_id === modulo);
    return rolModulo?.rol_codigo || null;
  };

  /**
   * Verifica si el usuario tiene acceso a un módulo
   */
  const tieneAccesoModulo = (modulo: Modulo): boolean => {
    if (esSuperAdmin) return true;
    return roles.some((r) => r.modulo_id === modulo);
  };

  /**
   * Obtiene el nivel jerárquico del rol del usuario en un módulo
   */
  const obtenerNivelRol = (modulo: Modulo): number => {
    if (esSuperAdmin) return 3; // Nivel máximo

    const rolModulo = roles.find((r) => r.modulo_id === modulo);
    return rolModulo?.nivel ?? -1;
  };

  /**
   * Recarga los permisos del usuario
   */
  const recargar = async () => {
    await cargarPermisos();
  };

  return {
    roles,
    esSuperAdmin,
    loading,
    error,
    tienePermiso,
    obtenerRol,
    tieneAccesoModulo,
    obtenerNivelRol,
    recargar,
  };
}

// ============================================================================
// HOOK SIMPLIFICADO PARA UN MÓDULO ESPECÍFICO
// ============================================================================

interface UseModulePermissionsReturn {
  rol: CodigoRol | null;
  nivel: number;
  tieneAcceso: boolean;
  esSuperAdmin: boolean;
  loading: boolean;
  puede: (permiso: string) => boolean;
}

/**
 * Hook simplificado para obtener permisos de un módulo específico
 */
export function useModulePermissions(
  modulo: Modulo
): UseModulePermissionsReturn {
  const {
    roles,
    esSuperAdmin,
    loading,
    tienePermiso,
    obtenerRol,
    tieneAccesoModulo,
    obtenerNivelRol,
  } = usePermissions();

  const puede = (permiso: string) => tienePermiso(modulo, permiso);

  return {
    rol: obtenerRol(modulo),
    nivel: obtenerNivelRol(modulo),
    tieneAcceso: tieneAccesoModulo(modulo),
    esSuperAdmin,
    loading,
    puede,
  };
}
