'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, UserPlus, UserCog, ShieldCheck, Clock, Mail, User, Ban, CheckCircle } from 'lucide-react';

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

interface RolModulo {
  modulo_id: string;
  rol_codigo: string;
  rol_nombre: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalDetalles, setModalDetalles] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    rol_global: '',
    activo: '',
    modulo: '',
  });

  // Formulario crear
  const [formCrear, setFormCrear] = useState({
    correo: '',
    password: '',
    nombre_completo: '',
  });

  // Formulario editar
  const [formEditar, setFormEditar] = useState({
    nombre_completo: '',
    correo: '',
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, usuarios]);

  async function cargarUsuarios() {
    try {
      setLoading(true);
      const supabase = createClient();

      // Intentar cargar con todos los campos
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .order('creado_en', { ascending: false });

      if (error) throw error;

      setUsuarios(data || []);
      setUsuariosFiltrados(data || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }

  function aplicarFiltros() {
    let resultado = [...usuarios];

    // Filtro de búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(
        (u) =>
          u.correo.toLowerCase().includes(busqueda) ||
          u.nombre_completo?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro de rol global
    if (filtros.rol_global) {
      resultado = resultado.filter((u) => u.rol_global === filtros.rol_global);
    }

    // Filtro de estado activo
    if (filtros.activo !== '') {
      const esActivo = filtros.activo === 'true';
      resultado = resultado.filter((u) => u.activo === esActivo);
    }

    setUsuariosFiltrados(resultado);
  }

  async function crearUsuario() {
    if (!formCrear.correo || !formCrear.password) {
      alert('Correo y contraseña son obligatorios');
      return;
    }

    if (formCrear.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const response = await fetch('/api/admin/crear-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formCrear.correo,
          password: formCrear.password,
          nombreCompleto: formCrear.nombre_completo || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear usuario');
      }

      alert('Usuario creado exitosamente');
      setModalCrear(false);
      setFormCrear({ correo: '', password: '', nombre_completo: '' });
      cargarUsuarios();
    } catch (error: any) {
      console.error('Error creando usuario:', error);
      alert(error.message || 'Error al crear usuario');
    }
  }

  async function editarUsuario() {
    if (!usuarioSeleccionado) return;

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('perfiles')
        .update({
          nombre_completo: formEditar.nombre_completo || null,
          correo: formEditar.correo,
        })
        .eq('id', usuarioSeleccionado.id);

      if (error) throw error;

      alert('Usuario actualizado exitosamente');
      setModalEditar(false);
      cargarUsuarios();
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      alert('Error al actualizar usuario');
    }
  }

  async function cambiarEstadoUsuario(usuario: Usuario, nuevoEstado: boolean) {
    const confirmar = window.confirm(
      nuevoEstado
        ? `¿Activar usuario ${usuario.correo}?\n\nPodrá iniciar sesión normalmente.`
        : `¿Desactivar usuario ${usuario.correo}?\n\nNo podrá iniciar sesión hasta que se reactive.`
    );

    if (!confirmar) return;

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('perfiles')
        .update({
          activo: nuevoEstado,
          razon_suspension: nuevoEstado ? null : 'Desactivado por administrador',
        })
        .eq('id', usuario.id);

      if (error) {
        // Si el campo no existe, mostrar mensaje claro
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          throw new Error('Por favor ejecuta el script: 009_agregar_campo_activo.sql');
        }
        throw error;
      }

      alert(`✅ Usuario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
      cargarUsuarios();
    } catch (error: any) {
      console.error('Error cambiando estado:', error);
      alert(`❌ Error: ${error.message || 'No se pudo cambiar el estado'}`);
    }
  }

  function abrirModalEditar(usuario: Usuario) {
    setUsuarioSeleccionado(usuario);
    setFormEditar({
      nombre_completo: usuario.nombre_completo || '',
      correo: usuario.correo,
    });
    setModalEditar(true);
  }

  function abrirModalDetalles(usuario: Usuario) {
    setUsuarioSeleccionado(usuario);
    setModalDetalles(true);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        <Button onClick={() => setModalCrear(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Crear Usuario
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuarios.length}</div>
            <p className="text-xs text-muted-foreground">Usuarios registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {usuarios.filter((u) => u.activo).length}
            </div>
            <p className="text-xs text-muted-foreground">Usuarios activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <Ban className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {usuarios.filter((u) => !u.activo).length}
            </div>
            <p className="text-xs text-muted-foreground">Usuarios inactivos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SuperAdmins</CardTitle>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {usuarios.filter((u) => u.rol_global === 'superadmin').length}
            </div>
            <p className="text-xs text-muted-foreground">Administradores</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o correo..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                className="pl-10"
              />
            </div>
            <select
              value={filtros.rol_global}
              onChange={(e) => setFiltros({ ...filtros, rol_global: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Todos los roles</option>
              <option value="usuario">Usuario</option>
              <option value="superadmin">SuperAdmin</option>
            </select>
            <select
              value={filtros.activo}
              onChange={(e) => setFiltros({ ...filtros, activo: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
            <Button
              variant="outline"
              onClick={() => setFiltros({ busqueda: '', rol_global: '', activo: '', modulo: '' })}
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Listado de usuarios */}
      <div className="grid gap-4">
        {usuariosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No se encontraron usuarios</p>
              <p className="text-muted-foreground mb-4">
                {filtros.busqueda || filtros.rol_global || filtros.activo
                  ? 'No hay usuarios que coincidan con los filtros aplicados'
                  : 'Aún no hay usuarios registrados en el sistema'}
              </p>
              {!filtros.busqueda && !filtros.rol_global && !filtros.activo && (
                <Button onClick={() => setModalCrear(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Crear Primer Usuario
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          usuariosFiltrados.map((usuario) => (
            <Card key={usuario.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {usuario.nombre_completo || 'Sin nombre'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {usuario.correo}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={usuario.rol_global === 'superadmin' ? 'default' : 'outline'}>
                      {usuario.rol_global === 'superadmin' ? 'SuperAdmin' : 'Usuario'}
                    </Badge>
                    <Badge variant={usuario.activo ? 'default' : 'destructive'}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Última conexión
                    </p>
                    <p className="font-medium">
                      {usuario.ultima_conexion
                        ? new Date(usuario.ultima_conexion).toLocaleString('es-CO')
                        : 'Nunca'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de creación</p>
                    <p className="font-medium">
                      {new Date(usuario.creado_en).toLocaleString('es-CO')}
                    </p>
                  </div>
                  {usuario.razon_suspension && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Razón de suspensión</p>
                      <p className="font-medium text-yellow-600">{usuario.razon_suspension}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => abrirModalDetalles(usuario)}
                  >
                    <UserCog className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => abrirModalEditar(usuario)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant={usuario.activo ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => cambiarEstadoUsuario(usuario, !usuario.activo)}
                  >
                    {usuario.activo ? (
                      <>
                        <Ban className="h-4 w-4 mr-2" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Activar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal Crear Usuario */}
      {modalCrear && (
        <ModalCrearUsuario
          form={formCrear}
          setForm={setFormCrear}
          onCrear={crearUsuario}
          onCerrar={() => {
            setModalCrear(false);
            setFormCrear({ correo: '', password: '', nombre_completo: '' });
          }}
        />
      )}

      {/* Modal Editar Usuario */}
      {modalEditar && usuarioSeleccionado && (
        <ModalEditarUsuario
          form={formEditar}
          setForm={setFormEditar}
          onEditar={editarUsuario}
          onCerrar={() => {
            setModalEditar(false);
            setUsuarioSeleccionado(null);
          }}
        />
      )}

      {/* Modal Detalles Usuario */}
      {modalDetalles && usuarioSeleccionado && (
        <ModalDetallesUsuario
          usuario={usuarioSeleccionado}
          onCerrar={() => {
            setModalDetalles(false);
            setUsuarioSeleccionado(null);
          }}
        />
      )}
    </div>
  );
}

// Componentes de modales
function ModalCrearUsuario({ form, setForm, onCrear, onCerrar }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crear Nuevo Usuario</CardTitle>
          <CardDescription>Ingresa los datos del nuevo usuario del sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Correo Electrónico *
            </label>
            <Input
              type="email"
              placeholder="usuario@ejemplo.com"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Contraseña * (mínimo 6 caracteres)
            </label>
            <Input
              type="password"
              placeholder="••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nombre Completo
            </label>
            <Input
              type="text"
              placeholder="Nombre del usuario"
              value={form.nombre_completo}
              onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
            />
          </div>
        </CardContent>
        <div className="flex gap-2 p-6 pt-0">
          <Button variant="outline" onClick={onCerrar} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={onCrear} className="flex-1">
            Crear Usuario
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ModalEditarUsuario({ form, setForm, onEditar, onCerrar }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Editar Usuario</CardTitle>
          <CardDescription>Modifica los datos del usuario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Correo Electrónico
            </label>
            <Input
              type="email"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nombre Completo
            </label>
            <Input
              type="text"
              value={form.nombre_completo}
              onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
            />
          </div>
        </CardContent>
        <div className="flex gap-2 p-6 pt-0">
          <Button variant="outline" onClick={onCerrar} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={onEditar} className="flex-1">
            Guardar Cambios
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ModalDetallesUsuario({ usuario, onCerrar }: { usuario: Usuario; onCerrar: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Detalles del Usuario</CardTitle>
          <CardDescription>Información completa del usuario</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Correo
              </p>
              <p className="font-medium">{usuario.correo}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                Nombre
              </p>
              <p className="font-medium">{usuario.nombre_completo || 'Sin nombre'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Rol Global
              </p>
              <Badge variant={usuario.rol_global === 'superadmin' ? 'default' : 'outline'}>
                {usuario.rol_global === 'superadmin' ? 'SuperAdmin' : 'Usuario'}
              </Badge>
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
            <div className="space-y-1">
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
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-4">
                <p className="text-sm font-medium text-yellow-800 mb-1">Razón de suspensión:</p>
                <p className="text-yellow-700 text-sm">{usuario.razon_suspension}</p>
              </CardContent>
            </Card>
          )}
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
