'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RequireSuperAdmin } from '@/components/auth/RequirePermission';
import type { Modulo, CodigoRol } from '@/lib/types/permissions';

// ============================================================================
// TIPOS
// ============================================================================

interface Usuario {
  id: string;
  correo: string;
  nombre_completo: string | null;
  rol_global: string;
}

interface RolAsignado {
  modulo_id: Modulo;
  rol_codigo: CodigoRol;
  rol_nombre: string;
}

interface UsuarioConRoles extends Usuario {
  roles: RolAsignado[];
}

interface RolDisponible {
  id: string;
  modulo_id: Modulo;
  codigo: CodigoRol;
  nombre: string;
  descripcion: string | null;
}

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================

export default function GestionRolesPage() {
  return (
    <RequireSuperAdmin redirectTo="/sin-acceso">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Gestión de Roles y Permisos</h1>
        <GestionRolesContent />
      </div>
    </RequireSuperAdmin>
  );
}

// ============================================================================
// CONTENIDO PRINCIPAL
// ============================================================================

function GestionRolesContent() {
  const [usuarios, setUsuarios] = useState<UsuarioConRoles[]>([]);
  const [rolesDisponibles, setRolesDisponibles] = useState<RolDisponible[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioConRoles | null>(null);
  const [mostrarCrearUsuario, setMostrarCrearUsuario] = useState(false);

  const supabase = createClient();

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar usuarios
      const { data: perfilesData, error: perfilesError } = await supabase
        .from('perfiles')
        .select('id, correo, nombre_completo, rol_global')
        .order('correo');

      if (perfilesError) throw perfilesError;

      // Cargar roles asignados a cada usuario
      const usuariosConRoles: UsuarioConRoles[] = [];

      for (const perfil of perfilesData || []) {
        const { data: rolesData, error: rolesError } = await supabase
          .from('usuarios_roles')
          .select(
            `
            modulo_id,
            roles_modulo (
              codigo,
              nombre
            )
          `
          )
          .eq('usuario_id', perfil.id);

        if (rolesError) throw rolesError;

        const roles: RolAsignado[] = (rolesData || []).map((r: any) => ({
          modulo_id: r.modulo_id,
          rol_codigo: r.roles_modulo.codigo,
          rol_nombre: r.roles_modulo.nombre,
        }));

        usuariosConRoles.push({
          ...perfil,
          roles,
        });
      }

      setUsuarios(usuariosConRoles);

      // Cargar roles disponibles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles_modulo')
        .select('id, modulo_id, codigo, nombre, descripcion')
        .order('modulo_id')
        .order('nivel');

      if (rolesError) throw rolesError;

      setRolesDisponibles(rolesData || []);
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const asignarRol = async (
    usuarioId: string,
    moduloId: Modulo,
    rolId: string
  ) => {
    try {
      const { error } = await supabase
        .from('usuarios_roles')
        .upsert(
          {
            usuario_id: usuarioId,
            modulo_id: moduloId,
            rol_id: rolId,
            asignado_por: (await supabase.auth.getUser()).data.user?.id,
          },
          {
            onConflict: 'usuario_id,modulo_id',
          }
        );

      if (error) throw error;

      // Recargar datos
      await cargarDatos();
    } catch (err: any) {
      console.error('Error asignando rol:', err);
      alert('Error asignando rol: ' + err.message);
    }
  };

  const eliminarRol = async (usuarioId: string, moduloId: Modulo) => {
    if (!confirm('¿Seguro que deseas eliminar este rol?')) return;

    try {
      const { error } = await supabase
        .from('usuarios_roles')
        .delete()
        .eq('usuario_id', usuarioId)
        .eq('modulo_id', moduloId);

      if (error) throw error;

      await cargarDatos();
    } catch (err: any) {
      console.error('Error eliminando rol:', err);
      alert('Error eliminando rol: ' + err.message);
    }
  };

  const cambiarRolGlobal = async (usuarioId: string, nuevoRol: 'usuario' | 'superadmin') => {
    if (!confirm(`¿Cambiar a ${nuevoRol}?`)) return;

    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ rol_global: nuevoRol })
        .eq('id', usuarioId);

      if (error) throw error;

      await cargarDatos();
    } catch (err: any) {
      console.error('Error cambiando rol global:', err);
      alert('Error: ' + err.message);
    }
  };

  const crearUsuario = async (email: string, password: string, nombreCompleto: string) => {
    try {
      const response = await fetch('/api/admin/crear-usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, nombreCompleto }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error creando usuario');
      }

      alert('Usuario creado exitosamente');
      setMostrarCrearUsuario(false);
      await cargarDatos();
    } catch (err: any) {
      console.error('Error creando usuario:', err);
      alert('Error creando usuario: ' + err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando usuarios...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error: {error}
        <button onClick={cargarDatos} className="ml-4 underline">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botón crear usuario */}
      <div className="flex justify-end">
        <button
          onClick={() => setMostrarCrearUsuario(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Crear Usuario
        </button>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol Global
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Movilidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario) => {
              const rolMovilidad = usuario.roles.find((r) => r.modulo_id === 'movilidad');

              return (
                <tr key={usuario.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {usuario.nombre_completo || 'Sin nombre'}
                    </div>
                    <div className="text-sm text-gray-500">{usuario.correo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={usuario.rol_global}
                      onChange={(e) =>
                        cambiarRolGlobal(
                          usuario.id,
                          e.target.value as 'usuario' | 'superadmin'
                        )
                      }
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="usuario">Usuario</option>
                      <option value="superadmin">SuperAdmin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {usuario.rol_global === 'superadmin' ? (
                      <span className="text-sm font-semibold text-green-600">Acceso Total</span>
                    ) : rolMovilidad ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{rolMovilidad.rol_nombre}</span>
                        <button
                          onClick={() => eliminarRol(usuario.id, 'movilidad')}
                          className="text-red-600 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            asignarRol(usuario.id, 'movilidad', e.target.value);
                          }
                        }}
                        className="text-sm border rounded px-2 py-1"
                        defaultValue=""
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setUsuarioSeleccionado(usuario)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Información de roles */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Roles de Movilidad</h2>
          <div className="space-y-3">
            {rolesDisponibles
              .filter((r) => r.modulo_id === 'movilidad')
              .map((rol) => (
                <div key={rol.id} className="border-l-4 border-green-500 pl-3">
                  <div className="font-medium">{rol.nombre}</div>
                  <div className="text-sm text-gray-600">{rol.descripcion}</div>
                  <div className="text-xs text-gray-400 mt-1">Código: {rol.codigo}</div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Modal Crear Usuario */}
      {mostrarCrearUsuario && (
        <ModalCrearUsuario
          onClose={() => setMostrarCrearUsuario(false)}
          onCrear={crearUsuario}
        />
      )}

      {/* Modal Ver Detalles */}
      {usuarioSeleccionado && (
        <ModalDetallesUsuario
          usuario={usuarioSeleccionado}
          rolesDisponibles={rolesDisponibles}
          onClose={() => setUsuarioSeleccionado(null)}
        />
      )}
    </div>
  );
}

// ============================================================================
// MODAL CREAR USUARIO
// ============================================================================

function ModalCrearUsuario({
  onClose,
  onCrear,
}: {
  onClose: () => void;
  onCrear: (email: string, password: string, nombreCompleto: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Email y contraseña son requeridos');
      return;
    }
    setLoading(true);
    await onCrear(email, password, nombreCompleto);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full border">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Usuario</h2>
          <p className="text-sm text-gray-500 mt-1">
            Ingresa los datos del nuevo usuario del sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="usuario@ejemplo.com"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Nombre Completo
            </label>
            <input
              type="text"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Juan Pérez"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL DETALLES USUARIO
// ============================================================================

function ModalDetallesUsuario({
  usuario,
  rolesDisponibles,
  onClose,
}: {
  usuario: UsuarioConRoles;
  rolesDisponibles: RolDisponible[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto border">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Detalles del Usuario</h2>
          <p className="text-sm text-gray-500 mt-1">Información completa y permisos asignados</p>
        </div>

        <div className="space-y-6">
          {/* Información básica */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Correo Electrónico
              </label>
              <p className="text-base font-medium text-gray-900">{usuario.correo}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Nombre Completo
              </label>
              <p className="text-base font-medium text-gray-900">
                {usuario.nombre_completo || <span className="text-gray-400 italic">No especificado</span>}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Rol Global
              </label>
              <div className="inline-flex items-center gap-2">
                {usuario.rol_global === 'superadmin' ? (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold border border-red-200">
                    🔐 SuperAdmin
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold border border-gray-200">
                    👤 Usuario
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Roles por módulo */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-lg">📋</span> Roles Asignados por Módulo
            </h3>
            {usuario.roles.length > 0 ? (
              <div className="grid gap-3">
                {usuario.roles.map((rol) => {
                  const rolInfo = rolesDisponibles.find(r => r.codigo === rol.rol_codigo);
                  return (
                    <div
                      key={rol.modulo_id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">
                              🚗
                            </span>
                            <span className="font-semibold text-gray-900">
                              Movilidad
                            </span>
                          </div>
                          <div className="ml-7">
                            <p className="text-sm font-medium text-blue-600">{rol.rol_nombre}</p>
                            {rolInfo?.descripcion && (
                              <p className="text-xs text-gray-500 mt-1">{rolInfo.descripcion}</p>
                            )}
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Activo
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">
                  {usuario.rol_global === 'superadmin' ? (
                    <>
                      <span className="block text-2xl mb-2">✨</span>
                      <span className="font-medium">Acceso total a todos los módulos</span>
                    </>
                  ) : (
                    <>
                      <span className="block text-2xl mb-2">📭</span>
                      <span>Sin roles asignados</span>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
