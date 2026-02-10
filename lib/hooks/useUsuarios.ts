'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { Usuario, FiltrosUsuarios } from '@/lib/types/usuario';

export function useUsuarios(filtrosIniciales?: FiltrosUsuarios) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [usuariosConModulos, setUsuariosConModulos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [filtros, setFiltros] = useState<FiltrosUsuarios>(
    filtrosIniciales || {
      busqueda: '',
      rol_global: '',
      activo: '',
      modulo: '',
    }
  );

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, usuarios, usuariosConModulos]);

  async function cargarUsuarios() {
    try {
      setLoading(true);
      const supabase = createClient();

      // Cargar todos los usuarios
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .order('creado_en', { ascending: false });

      if (error) throw error;

      setUsuarios(data || []);
      setUsuariosFiltrados(data || []);

      // Cargar usuarios que tienen rol en movilidad
      const { data: rolesMovilidad } = await supabase
        .from('usuarios_roles')
        .select('usuario_id')
        .eq('modulo_id', 'movilidad');

      if (rolesMovilidad) {
        setUsuariosConModulos(new Set(rolesMovilidad.map(r => r.usuario_id)));
      }
    } catch (error) {
      toast.error('Error al cargar usuarios');
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

    // Filtro de módulo
    if (filtros.modulo === 'movilidad') {
      resultado = resultado.filter((u) => usuariosConModulos.has(u.id));
    }

    setUsuariosFiltrados(resultado);
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
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          throw new Error('Por favor ejecuta el script: 009_agregar_campo_activo.sql');
        }
        throw error;
      }

      toast.success(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
      cargarUsuarios();
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'No se pudo cambiar el estado'}`);
    }
  }

  return {
    usuarios,
    usuariosFiltrados,
    loading,
    filtros,
    setFiltros,
    cargarUsuarios,
    cambiarEstadoUsuario,
  };
}
