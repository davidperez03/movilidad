'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasAuditoria, type RegistroAuditoria } from './auditoria-columns'

export default function AuditoriaPage() {
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    accion: '',
    busqueda: '',
  });

  useEffect(() => {
    cargarRegistros();
  }, []);

  async function cargarRegistros() {
    try {
      setLoading(true);
      const supabase = createClient();

      // Cargar desde vista unificada que incluye sistema y movilidad
      let query = supabase
        .from('sys_vista_auditoria_completa')
        .select('*')
        .order('creado_en', { ascending: false })
        .limit(100);

      // Aplicar filtros si existen
      if (filtros.accion) {
        query = query.eq('accion', filtros.accion);
      }

      const { data, error } = await query;

      if (error) {
        toast.error('Error al cargar los registros de auditoría');
        return;
      }

      // Formatear datos (la vista ya trae usuario_correo y usuario_nombre)
      const registrosFormateados = (data || []).map((item: any) => {
        const detalles = item.detalles || {};

        // La vista unificada ya trae usuario_correo y usuario_nombre directamente
        // Si no hay usuario, intentar obtener del campo detalles (para logout/sesion_expirada)
        const usuarioCorreo = item.usuario_correo || detalles.usuario_correo || 'Sistema';
        const usuarioNombre = item.usuario_nombre || detalles.usuario_nombre || 'Sistema';

        return {
          id: item.id,
          modulo: item.modulo || 'sistema',
          accion: item.accion,
          entidad_tipo: item.entidad_tipo,
          entidad_id: item.entidad_id,
          detalles,
          valor_anterior: item.valor_anterior,
          valor_nuevo: item.valor_nuevo,
          usuario_id: item.usuario_id,
          usuario_correo: usuarioCorreo,
          usuario_nombre: usuarioNombre,
          ip_address: item.ip_address,
          creado_en: item.creado_en,
        };
      });

      // Aplicar filtro de búsqueda localmente
      let resultado = registrosFormateados;
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        resultado = registrosFormateados.filter((r: any) =>
          r.usuario_correo.toLowerCase().includes(busqueda) ||
          r.usuario_nombre.toLowerCase().includes(busqueda) ||
          JSON.stringify(r.detalles).toLowerCase().includes(busqueda)
        );
      }

      setRegistros(resultado);
    } catch (error) {
      toast.error('Error al procesar los registros de auditoría');
    } finally {
      setLoading(false);
    }
  }

  function aplicarFiltros() {
    cargarRegistros();
  }

  function limpiarFiltros() {
    setFiltros({
      accion: '',
      busqueda: '',
    });
    setTimeout(() => cargarRegistros(), 100);
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
          <h1 className="text-3xl font-bold">Auditoría del Sistema</h1>
          <p className="text-muted-foreground">
            Historial completo de acciones en el sistema
          </p>
        </div>
        <Button onClick={cargarRegistros}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <select
              value={filtros.accion}
              onChange={(e) => setFiltros({ ...filtros, accion: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Todas las acciones</option>
              <option value="usuario_creado">Usuario creado</option>
              <option value="usuario_editado">Usuario editado</option>
              <option value="usuario_activado">Usuario activado</option>
              <option value="usuario_desactivado">Usuario desactivado</option>
              <option value="rol_global_cambiado">Rol cambiado</option>
              <option value="rol_modulo_asignado">Rol asignado</option>
              <option value="rol_modulo_removido">Rol removido</option>
              <option value="login_exitoso">Login exitoso</option>
              <option value="login_fallido">Login fallido</option>
              <option value="logout">Cierre de sesión</option>
              <option value="cuenta_creada">Cuenta creada</option>
              <option value="traslado_iniciado">Traslado iniciado</option>
              <option value="radicacion_iniciada">Radicación iniciada</option>
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario, correo o detalles..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={aplicarFiltros} className="flex-1">
                Aplicar
              </Button>
              <Button variant="outline" onClick={limpiarFiltros}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listado de registros */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columnasAuditoria}
            data={registros}
            enablePagination={true}
            pageSize={50}
            pageSizeOptions={[10, 20, 50, 100]}
            enableSorting={true}
            defaultSorting={[{ id: 'creado_en', desc: true }]}
            emptyMessage={
              filtros.accion || filtros.busqueda
                ? 'No hay registros que coincidan con los filtros aplicados'
                : 'No hay actividad registrada aún'
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
