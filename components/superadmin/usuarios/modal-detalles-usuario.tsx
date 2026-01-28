'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Mail, Settings, ShieldCheck, User, X } from 'lucide-react';
import { toast } from 'sonner';
import type { CodigoRol, Modulo } from '@/lib/types/permissions';
import { logger } from '@/lib/logger';

interface RolUsuarioRow {
  modulo_id: Modulo;
  roles_modulo: {
    codigo: CodigoRol;
    nombre: string;
  } | null;
}

interface Usuario {
  id: string;
  correo: string;
  nombre_completo: string | null;
  rol_global: 'usuario' | 'superadmin';
  activo: boolean;
  url_avatar: string | null;
  suspendido_hasta: string | null;
  razon_suspension: string | null;
  ultima_conexion: string | null;
  creado_en: string;
}

interface RolAsignado {
  modulo_id: Modulo;
  rol_codigo: CodigoRol;
  rol_nombre: string;
}

interface RolDisponible {
  id: string;
  modulo_id: Modulo;
  codigo: CodigoRol;
  nombre: string;
  descripcion: string | null;
}

interface ModalDetallesUsuarioProps {
  usuario: Usuario;
  onCerrar: () => void;
}

export function ModalDetallesUsuario({ usuario, onCerrar }: ModalDetallesUsuarioProps) {
  const [rolesAsignados, setRolesAsignados] = useState<RolAsignado[]>([]);
  const [rolesDisponibles, setRolesDisponibles] = useState<RolDisponible[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolGlobal, setRolGlobal] = useState(usuario.rol_global);
  const supabase = createClient();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCerrar();
    }
  }, [onCerrar]);

  // Focus management
  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus first focusable element
    setTimeout(() => {
      const firstButton = modalRef.current?.querySelector<HTMLElement>('button');
      firstButton?.focus();
    }, 0);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    };
  }, [handleKeyDown]);

  useEffect(() => {
    cargarRoles();
  }, []);

  async function cargarRoles() {
    try {
      setLoading(true);

      // Cargar roles asignados al usuario
      const { data: rolesData, error: rolesError } = await supabase
        .from('usuarios_roles')
        .select(`
          modulo_id,
          roles_modulo (
            codigo,
            nombre
          )
        `)
        .eq('usuario_id', usuario.id);

      if (rolesError) throw rolesError;

      const roles: RolAsignado[] = ((rolesData || []) as unknown as RolUsuarioRow[])
        .filter((r) => r.roles_modulo)
        .map((r) => ({
          modulo_id: r.modulo_id,
          rol_codigo: r.roles_modulo!.codigo,
          rol_nombre: r.roles_modulo!.nombre,
        }));

      setRolesAsignados(roles);

      // Cargar roles disponibles
      const { data: rolesDisp, error: rolesDispError } = await supabase
        .from('roles_modulo')
        .select('id, modulo_id, codigo, nombre, descripcion')
        .order('modulo_id')
        .order('nivel');

      if (rolesDispError) throw rolesDispError;
      setRolesDisponibles(rolesDisp || []);
    } catch (error) {
      toast.error('Error al cargar roles del usuario');
      logger.error('Error cargando roles', error);
    } finally {
      setLoading(false);
    }
  }

  async function asignarRol(moduloId: Modulo, rolId: string) {
    try {
      const { error } = await supabase
        .from('usuarios_roles')
        .upsert({
          usuario_id: usuario.id,
          modulo_id: moduloId,
          rol_id: rolId,
          asignado_por: (await supabase.auth.getUser()).data.user?.id,
        }, {
          onConflict: 'usuario_id,modulo_id',
        });

      if (error) throw error;
      toast.success('Rol asignado exitosamente');
      await cargarRoles();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error asignando rol: ' + message);
    }
  }

  async function eliminarRol(moduloId: Modulo) {
    if (!confirm('¿Seguro que deseas eliminar este rol?')) return;

    try {
      const { error } = await supabase
        .from('usuarios_roles')
        .delete()
        .eq('usuario_id', usuario.id)
        .eq('modulo_id', moduloId);

      if (error) throw error;
      toast.success('Rol eliminado exitosamente');
      await cargarRoles();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error eliminando rol: ' + message);
    }
  }

  async function cambiarRolGlobal(nuevoRol: 'usuario' | 'superadmin') {
    if (!confirm(`¿Cambiar rol global a ${nuevoRol}?`)) return;

    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ rol_global: nuevoRol })
        .eq('id', usuario.id);

      if (error) throw error;
      setRolGlobal(nuevoRol);
      toast.success('Rol global actualizado exitosamente');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error: ' + message);
    }
  }

  const rolMovilidad = rolesAsignados.find((r) => r.modulo_id === 'movilidad');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onCerrar}
        aria-hidden="true"
      />

      <Card
        ref={modalRef}
        className="relative z-50 w-full max-w-3xl my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title-detalles-usuario"
        aria-describedby="modal-desc-detalles-usuario"
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle id="modal-title-detalles-usuario" className="flex items-center gap-2">
              <Settings className="h-5 w-5" aria-hidden="true" />
              Gestión Completa de Usuario
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCerrar}
              aria-label="Cerrar modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription id="modal-desc-detalles-usuario">
            Información, roles y permisos del usuario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información Básica */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Información Básica
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Correo
                </p>
                <p className="font-medium">{usuario.correo}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{usuario.nombre_completo || 'Sin nombre'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Estado</p>
                <Badge variant={usuario.activo ? 'default' : 'destructive'}>
                  {usuario.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Creado</p>
                <p className="font-medium">
                  {new Date(usuario.creado_en).toLocaleString('es-CO')}
                </p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Última Conexión
                </p>
                <p className="font-medium">
                  {usuario.ultima_conexion
                    ? new Date(usuario.ultima_conexion).toLocaleString('es-CO')
                    : 'Nunca'}
                </p>
              </div>
            </div>
            {usuario.razon_suspension && (
              <Card className="bg-yellow-50 border-yellow-200 mt-4">
                <CardContent className="pt-4">
                  <p className="text-sm font-medium text-yellow-800 mb-1">Razón de suspensión:</p>
                  <p className="text-yellow-700 text-sm">{usuario.razon_suspension}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Gestión de Roles */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Roles y Permisos
            </h3>

            {/* Rol Global */}
            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Rol Global del Sistema
              </label>
              <select
                value={rolGlobal}
                onChange={(e) => cambiarRolGlobal(e.target.value as 'usuario' | 'superadmin')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="usuario">Usuario</option>
                <option value="superadmin">SuperAdmin (Acceso Total)</option>
              </select>
              {rolGlobal === 'superadmin' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Los SuperAdmins tienen acceso completo a todos los módulos
                </p>
              )}
            </div>

            {/* Roles por Módulo */}
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Cargando roles...</div>
            ) : (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Roles de Módulos
                </label>
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {/* Módulo Movilidad */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">Movilidad</p>
                          {rolGlobal === 'superadmin' ? (
                            <p className="text-sm text-green-600">Acceso Total (SuperAdmin)</p>
                          ) : rolMovilidad ? (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{rolMovilidad.rol_nombre}</Badge>
                              <button
                                onClick={() => eliminarRol('movilidad')}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Eliminar
                              </button>
                            </div>
                          ) : (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  asignarRol('movilidad', e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="mt-1 flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 py-1 text-sm"
                            >
                              <option value="">Asignar rol...</option>
                              {rolesDisponibles
                                .filter((r) => r.modulo_id === 'movilidad')
                                .map((rol) => (
                                  <option key={rol.id} value={rol.id}>
                                    {rol.nombre}
                                  </option>
                                ))}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Información de roles disponibles */}
                <div className="mt-4">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Ver descripción de roles disponibles
                    </summary>
                    <div className="mt-2 space-y-2 pl-4">
                      {rolesDisponibles
                        .filter((r) => r.modulo_id === 'movilidad')
                        .map((rol) => (
                          <div key={rol.id} className="border-l-2 border-primary pl-3">
                            <p className="font-medium">{rol.nombre}</p>
                            <p className="text-xs text-muted-foreground">{rol.descripcion}</p>
                          </div>
                        ))}
                    </div>
                  </details>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <div className="p-6 pt-0">
          <Button variant="outline" onClick={onCerrar} className="w-full">
            Cerrar
          </Button>
        </div>
      </Card>
    </div>
  );
}
