'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/lib/hooks/usePermissions';
import type { Modulo } from '@/lib/types/permissions';

// ============================================================================
// COMPONENTE: RequirePermission
// Protege componentes/rutas según permisos del usuario
// ============================================================================

interface RequirePermissionProps {
  modulo: Modulo;
  permiso: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Componente que protege su contenido basándose en permisos
 *
 * @example
 * ```tsx
 * <RequirePermission modulo="movilidad" permiso="eliminar_cuentas">
 *   <button onClick={eliminarCuenta}>Eliminar</button>
 * </RequirePermission>
 * ```
 */
export function RequirePermission({
  modulo,
  permiso,
  children,
  fallback = null,
  redirectTo,
}: RequirePermissionProps) {
  const { tienePermiso, loading, esSuperAdmin } = usePermissions();
  const router = useRouter();

  const tieneAcceso = tienePermiso(modulo, permiso);

  useEffect(() => {
    if (!loading && !tieneAcceso && redirectTo) {
      router.push(redirectTo);
    }
  }, [loading, tieneAcceso, redirectTo, router]);

  // Mostrar loading mientras carga
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-muted-foreground">
          Verificando permisos...
        </div>
      </div>
    );
  }

  // Si no tiene acceso
  if (!tieneAcceso) {
    // Si hay fallback, mostrarlo
    if (fallback) {
      return <>{fallback}</>;
    }

    // Si hay redirectTo, no mostrar nada (se redirigirá)
    if (redirectTo) {
      return null;
    }

    // Mensaje por defecto
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            No tienes permisos para ver este contenido
          </p>
        </div>
      </div>
    );
  }

  // Usuario tiene acceso, mostrar contenido
  return <>{children}</>;
}

// ============================================================================
// COMPONENTE: RequireSuperAdmin
// Solo para superadministradores
// ============================================================================

interface RequireSuperAdminProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Componente que solo permite acceso a superadministradores
 *
 * @example
 * ```tsx
 * <RequireSuperAdmin redirectTo="/sin-acceso">
 *   <PanelSuperAdmin />
 * </RequireSuperAdmin>
 * ```
 */
export function RequireSuperAdmin({
  children,
  fallback = null,
  redirectTo = '/sin-acceso',
}: RequireSuperAdminProps) {
  const { esSuperAdmin, loading } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !esSuperAdmin && redirectTo) {
      router.push(redirectTo);
    }
  }, [loading, esSuperAdmin, redirectTo, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-muted-foreground">
          Verificando permisos...
        </div>
      </div>
    );
  }

  if (!esSuperAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (redirectTo) {
      return null;
    }

    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Solo superadministradores pueden acceder
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
