'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, RefreshCw, Clock, User, Activity } from 'lucide-react';

interface RegistroAuditoria {
  id: string;
  modulo: string;
  accion: string;
  entidad_tipo: string;
  entidad_id: string;
  detalles: any;
  valor_anterior: string | null;
  valor_nuevo: string | null;
  usuario_id: string;
  usuario_correo: string;
  usuario_nombre: string;
  ip_address: string | null;
  creado_en: string;
}

export default function AuditoriaPage() {
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    modulo: '',
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

      // Intentar cargar desde la vista unificada
      let query = supabase
        .from('sys_vista_auditoria_completa')
        .select('*')
        .order('creado_en', { ascending: false })
        .limit(100);

      // Aplicar filtros si existen
      if (filtros.modulo) {
        query = query.eq('modulo', filtros.modulo);
      }
      if (filtros.accion) {
        query = query.eq('accion', filtros.accion);
      }
      if (filtros.busqueda) {
        query = query.or(
          `usuario_correo.ilike.%${filtros.busqueda}%,usuario_nombre.ilike.%${filtros.busqueda}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error cargando auditoría:', error);
        // Si la vista no existe aún, mostrar mensaje
        if (error.code === '42P01') {
          console.warn('La vista de auditoría aún no está creada en la base de datos');
        }
        return;
      }

      setRegistros(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function aplicarFiltros() {
    cargarRegistros();
  }

  function limpiarFiltros() {
    setFiltros({
      modulo: '',
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
          <div className="grid gap-4 md:grid-cols-4">
            <select
              value={filtros.modulo}
              onChange={(e) => setFiltros({ ...filtros, modulo: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Todos los módulos</option>
              <option value="sistema">Sistema</option>
              <option value="movilidad">Movilidad</option>
            </select>

            <select
              value={filtros.accion}
              onChange={(e) => setFiltros({ ...filtros, accion: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Todas las acciones</option>
              <option value="usuario_creado">Usuario creado</option>
              <option value="usuario_editado">Usuario editado</option>
              <option value="rol_global_cambiado">Rol cambiado</option>
              <option value="rol_modulo_asignado">Rol asignado</option>
              <option value="login_exitoso">Login</option>
              <option value="cuenta_creada">Cuenta creada</option>
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario..."
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
      <div className="grid gap-4">
        {registros.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No se encontraron registros</p>
              <p className="text-muted-foreground text-sm">
                {filtros.modulo || filtros.accion || filtros.busqueda
                  ? 'No hay registros que coincidan con los filtros aplicados'
                  : 'Asegúrate de haber ejecutado los scripts SQL en la base de datos'}
              </p>
            </CardContent>
          </Card>
        ) : (
          registros.map((registro) => (
            <Card key={registro.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={registro.modulo === 'sistema' ? 'default' : 'secondary'}>
                        {registro.modulo}
                      </Badge>
                      <CardTitle className="text-base">
                        {formatearAccion(registro.accion)}
                      </CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {registro.usuario_nombre || 'Sistema'} ({registro.usuario_correo})
                    </CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatearFechaCompleta(registro.creado_en)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {renderDetalles(registro)}
                </div>
                {registro.ip_address && (
                  <p className="text-xs text-muted-foreground mt-2">
                    IP: {registro.ip_address}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {registros.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Mostrando {registros.length} registros más recientes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatearAccion(accion: string): string {
  const acciones: Record<string, string> = {
    usuario_creado: 'Usuario creado',
    usuario_editado: 'Usuario editado',
    usuario_eliminado: 'Usuario eliminado',
    rol_global_cambiado: 'Rol global cambiado',
    rol_modulo_asignado: 'Rol asignado',
    rol_modulo_removido: 'Rol removido',
    login_exitoso: 'Inicio de sesión',
    login_fallido: 'Intento fallido de login',
    logout: 'Cierre de sesión',
    cuenta_creada: 'Cuenta creada',
    traslado_iniciado: 'Traslado iniciado',
    radicacion_iniciada: 'Radicación iniciada',
    estado_cambiado: 'Estado cambiado',
    novedad_agregada: 'Novedad agregada',
  };

  return acciones[accion] || accion;
}

function formatearFechaCompleta(fecha: string): string {
  const date = new Date(fecha);
  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderDetalles(registro: RegistroAuditoria): React.ReactNode {
  const detalles = registro.detalles || {};

  // Construir descripción según el tipo de acción
  switch (registro.accion) {
    case 'usuario_creado':
      return (
        <div>
          <div className="font-medium">{detalles.correo}</div>
          {detalles.nombre_completo && (
            <div className="text-xs text-gray-500">{detalles.nombre_completo}</div>
          )}
        </div>
      );

    case 'usuario_activado':
    case 'usuario_desactivado':
      return (
        <div>
          <div className="font-medium">{detalles.correo}</div>
          {detalles.razon_suspension && (
            <div className="text-xs text-gray-500">Razón: {detalles.razon_suspension}</div>
          )}
        </div>
      );

    case 'rol_global_cambiado':
      return (
        <div>
          <div className="font-medium">{detalles.correo}</div>
          <div className="text-xs">
            <span className="text-red-600">{registro.valor_anterior}</span>
            {' → '}
            <span className="text-green-600">{registro.valor_nuevo}</span>
          </div>
        </div>
      );

    case 'rol_modulo_asignado':
    case 'rol_modulo_removido':
      return (
        <div>
          <div className="font-medium">
            {detalles.usuario_correo || detalles.correo || 'Usuario desconocido'}
          </div>
          <div className="text-xs text-gray-500">
            {detalles.rol_nombre} en {detalles.modulo_id}
          </div>
        </div>
      );

    case 'login_exitoso':
      return (
        <div>
          <div className="font-medium">{registro.usuario_correo}</div>
          {registro.ip_address && (
            <div className="text-xs text-gray-500">IP: {registro.ip_address}</div>
          )}
        </div>
      );

    case 'cuenta_creada':
      return (
        <div>
          <div className="font-medium">Placa: {detalles.placa}</div>
          <div className="text-xs text-gray-500">Cuenta: {detalles.numero_cuenta}</div>
        </div>
      );

    case 'traslado_iniciado':
    case 'radicacion_iniciada':
      return (
        <div>
          <div className="font-medium">Proceso iniciado</div>
          {detalles.organismo_destino_id && (
            <div className="text-xs text-gray-500">Organismo ID: {detalles.organismo_destino_id}</div>
          )}
        </div>
      );

    default:
      // Mostrar cambio de valor si existe
      if (registro.valor_anterior && registro.valor_nuevo) {
        return (
          <div>
            <span className="text-red-600">{registro.valor_anterior}</span>
            {' → '}
            <span className="text-green-600">{registro.valor_nuevo}</span>
          </div>
        );
      }
      return '-';
  }
}
