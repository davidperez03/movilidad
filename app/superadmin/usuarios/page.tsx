'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useUsuarios } from '@/lib/hooks/useUsuarios';
import { EstadisticasUsuarios } from '@/components/superadmin/usuarios/estadisticas-usuarios';
import { FiltrosUsuarios as FiltrosUsuariosComponent } from '@/components/superadmin/usuarios/filtros-usuarios';
import { ListaUsuarios } from '@/components/superadmin/usuarios/lista-usuarios';
import { ModalCrearUsuario } from '@/components/superadmin/usuarios/modal-crear-usuario';
import { ModalEditarUsuario } from '@/components/superadmin/usuarios/modal-editar-usuario';
import { ModalDetallesUsuario } from '@/components/superadmin/usuarios/modal-detalles-usuario';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import type { Usuario, ConfirmState } from '@/lib/types/usuario';
import { CONFIRM_INITIAL } from '@/lib/types/usuario';
import { capitalizeName } from '@/lib/utils/capitalize';

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
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [confirmState, setConfirmState] = useState<ConfirmState>(CONFIRM_INITIAL);

  const [formCrear, setFormCrear] = useState({
    correo: '',
    nombre_completo: '',
  });

  const [formEditar, setFormEditar] = useState({
    nombre_completo: '',
    correo: '',
  });

  useEffect(() => {
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
    if (!formCrear.correo || !formCrear.nombre_completo) {
      toast.error('Correo y nombre completo son obligatorios');
      return;
    }

    if (formCrear.nombre_completo.length < 3) {
      toast.error('El nombre debe tener al menos 3 caracteres');
      return;
    }

    try {
      const response = await fetch('/api/admin/crear-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formCrear.correo,
          nombreCompleto: formCrear.nombre_completo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear usuario');
      }

      toast.success('Usuario creado. Pendiente de aprobación.');
      setModalCrear(false);
      setFormCrear({ correo: '', nombre_completo: '' });
      cargarUsuarios();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear usuario');
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
          nombre_completo: capitalizeName(formEditar.nombre_completo) || null,
          correo: formEditar.correo,
        })
        .eq('id', usuarioSeleccionado.id);

      if (error) throw error;

      toast.success('Usuario actualizado exitosamente');
      setModalEditar(false);
      cargarUsuarios();
    } catch {
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

  function solicitarAprobar(usuario: Usuario) {
    setConfirmState({
      open: true,
      title: 'Aprobar usuario',
      description: `Se aprobará la cuenta de ${usuario.correo}. Se generará una contraseña temporal y se enviará por correo electrónico.`,
      confirmLabel: 'Aprobar',
      variant: 'default',
      action: async () => {
        const res = await fetch('/api/admin/aprobar-usuario', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: usuario.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        if (data.emailSent) {
          toast.success('Usuario aprobado y email enviado');
        } else {
          toast.warning('Usuario aprobado. No se pudo enviar el email (verificar config SMTP)');
        }
        cargarUsuarios();
      },
    });
  }

  function solicitarResetearPassword(usuario: Usuario) {
    setConfirmState({
      open: true,
      title: 'Resetear contraseña',
      description: `Se generará una nueva contraseña temporal para ${usuario.correo} y se enviará por correo electrónico.`,
      confirmLabel: 'Resetear',
      variant: 'default',
      action: async () => {
        const res = await fetch('/api/admin/resetear-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: usuario.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        if (data.emailSent) {
          toast.success('Contraseña restablecida y email enviado');
        } else {
          toast.warning('Contraseña restablecida. No se pudo enviar el email (verificar config SMTP)');
        }
      },
    });
  }

  function solicitarEliminar(usuario: Usuario) {
    setConfirmState({
      open: true,
      title: 'Eliminar usuario',
      description: `Se eliminará permanentemente a ${usuario.correo} del sistema. Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      variant: 'destructive',
      action: async () => {
        const res = await fetch('/api/admin/eliminar-usuario', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: usuario.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        toast.success('Usuario eliminado');
        cargarUsuarios();
      },
    });
  }

  function solicitarCambiarEstado(usuario: Usuario, nuevoEstado: boolean) {
    setConfirmState({
      open: true,
      title: nuevoEstado ? 'Activar usuario' : 'Desactivar usuario',
      description: nuevoEstado
        ? `Se activará la cuenta de ${usuario.correo}. Podrá iniciar sesión nuevamente.`
        : `Se desactivará la cuenta de ${usuario.correo}. No podrá iniciar sesión.`,
      confirmLabel: nuevoEstado ? 'Activar' : 'Desactivar',
      variant: nuevoEstado ? 'default' : 'destructive',
      action: async () => {
        await cambiarEstadoUsuario(usuario, nuevoEstado);
      },
    });
  }

  async function ejecutarConfirm() {
    if (!confirmState.action) return;
    setConfirmLoading(true);
    try {
      await confirmState.action();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al ejecutar la acción');
    } finally {
      setConfirmLoading(false);
      setConfirmState(prev => ({ ...prev, open: false }));
    }
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

      <EstadisticasUsuarios usuarios={usuarios} />
      <FiltrosUsuariosComponent filtros={filtros} onFiltrosChange={setFiltros} />

      <ListaUsuarios
        usuarios={usuariosFiltrados}
        hayFiltrosActivos={hayFiltrosActivos}
        onAbrirModalCrear={() => setModalCrear(true)}
        onAbrirModalEditar={abrirModalEditar}
        onAbrirModalDetalles={abrirModalDetalles}
        onCambiarEstado={solicitarCambiarEstado}
        onAprobarUsuario={solicitarAprobar}
        onResetearPassword={solicitarResetearPassword}
        onEliminarUsuario={solicitarEliminar}
      />

      {modalCrear && (
        <ModalCrearUsuario
          form={formCrear}
          setForm={setFormCrear}
          onCrear={crearUsuario}
          onCerrar={() => {
            setModalCrear(false);
            setFormCrear({ correo: '', nombre_completo: '' });
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

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(open) => setConfirmState(prev => ({ ...prev, open }))}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel={confirmState.confirmLabel}
        variant={confirmState.variant}
        onConfirm={ejecutarConfirm}
        isLoading={confirmLoading}
      />
    </div>
  );
}
