'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useUsuarios } from '@/lib/hooks/useUsuarios';
import { EstadisticasUsuarios } from '@/components/superadmin/usuarios/estadisticas-usuarios';
import { FiltrosUsuarios } from '@/components/superadmin/usuarios/filtros-usuarios';
import { ListaUsuarios } from '@/components/superadmin/usuarios/lista-usuarios';
import { ModalCrearUsuario } from '@/components/superadmin/usuarios/modal-crear-usuario';
import { ModalEditarUsuario } from '@/components/superadmin/usuarios/modal-editar-usuario';
import { ModalDetallesUsuario } from '@/components/superadmin/usuarios/modal-detalles-usuario';

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

export default function UsuariosPage() {
  const searchParams = useSearchParams();
  const {
    usuarios,
    usuariosFiltrados,
    loading,
    filtros,
    setFiltros,
    cargarUsuarios,
    cambiarEstadoUsuario,
  } = useUsuarios();

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalDetalles, setModalDetalles] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);

  // Formularios
  const [formCrear, setFormCrear] = useState({
    correo: '',
    password: '',
    nombre_completo: '',
  });

  const [formEditar, setFormEditar] = useState({
    nombre_completo: '',
    correo: '',
  });

  useEffect(() => {
    // Aplicar filtros basados en query params
    const filtroParam = searchParams.get('filtro');
    if (filtroParam) {
      switch (filtroParam) {
        case 'activos':
          setFiltros({ ...filtros, activo: 'true' });
          break;
        case 'inactivos':
          setFiltros({ ...filtros, activo: 'false' });
          break;
        case 'superadmin':
          setFiltros({ ...filtros, rol_global: 'superadmin' });
          break;
        case 'movilidad':
          setFiltros({ ...filtros, modulo: 'movilidad' });
          break;
      }
    }
  }, []);

  async function crearUsuario() {
    if (!formCrear.correo || !formCrear.password) {
      toast.error('Correo y contraseña son obligatorios');
      return;
    }

    if (formCrear.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
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

      toast.success('Usuario creado exitosamente');
      setModalCrear(false);
      setFormCrear({ correo: '', password: '', nombre_completo: '' });
      cargarUsuarios();
    } catch (error: any) {
      toast.error(error.message || 'Error al crear usuario');
    }
  }

  async function editarUsuario() {
    if (!usuarioSeleccionado) return;

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { error } = await supabase
        .from('perfiles')
        .update({
          nombre_completo: formEditar.nombre_completo || null,
          correo: formEditar.correo,
        })
        .eq('id', usuarioSeleccionado.id);

      if (error) throw error;

      toast.success('Usuario actualizado exitosamente');
      setModalEditar(false);
      cargarUsuarios();
    } catch (error) {
      toast.error('Error al actualizar usuario');
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

  const hayFiltrosActivos = !!(filtros.busqueda || filtros.rol_global || filtros.activo);

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
      <EstadisticasUsuarios usuarios={usuarios} />

      {/* Filtros */}
      <FiltrosUsuarios filtros={filtros} onFiltrosChange={setFiltros} />

      {/* Listado de usuarios */}
      <ListaUsuarios
        usuarios={usuariosFiltrados}
        hayFiltrosActivos={hayFiltrosActivos}
        onAbrirModalCrear={() => setModalCrear(true)}
        onAbrirModalEditar={abrirModalEditar}
        onAbrirModalDetalles={abrirModalDetalles}
        onCambiarEstado={cambiarEstadoUsuario}
      />

      {/* Modales */}
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
