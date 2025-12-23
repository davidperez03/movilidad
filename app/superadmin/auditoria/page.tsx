'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, RefreshCw, Clock, User, Activity, LogIn, LogOut, UserPlus, Edit, Shield, Key, CheckCircle, XCircle, ArrowRightLeft } from 'lucide-react';

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

      // Cargar directamente desde sys_auditoria con JOIN a perfiles
      let query = supabase
        .from('sys_auditoria')
        .select(`
          id,
          accion,
          detalles,
          entidad_tipo,
          entidad_id,
          valor_anterior,
          valor_nuevo,
          ip_address,
          creado_en,
          realizado_por,
          perfiles!sys_auditoria_realizado_por_fkey (
            correo,
            nombre_completo
          )
        `)
        .order('creado_en', { ascending: false })
        .limit(100);

      // Aplicar filtros si existen
      if (filtros.accion) {
        query = query.eq('accion', filtros.accion);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error cargando auditoría:', error);
        return;
      }

      // Formatear datos
      const registrosFormateados = (data || []).map((item: any) => {
        const detalles = item.detalles || {};

        // Si no hay perfil (realizado_por es NULL), intentar obtener del campo detalles
        // Esto es común en logout/sesion_expirada ejecutados por funciones SECURITY DEFINER
        const usuarioCorreo = item.perfiles?.correo || detalles.usuario_correo || 'Sistema';
        const usuarioNombre = item.perfiles?.nombre_completo || detalles.usuario_nombre || 'Sistema';

        return {
          id: item.id,
          modulo: 'sistema', // Por ahora todo es sistema
          accion: item.accion,
          entidad_tipo: item.entidad_tipo,
          entidad_id: item.entidad_id,
          detalles,
          valor_anterior: item.valor_anterior,
          valor_nuevo: item.valor_nuevo,
          usuario_id: item.realizado_por,
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
        {registros.length === 0 ? (
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No se encontraron registros</p>
            <p className="text-muted-foreground text-sm">
              {filtros.accion || filtros.busqueda
                ? 'No hay registros que coincidan con los filtros aplicados'
                : 'No hay actividad registrada aún'}
            </p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[140px]">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[180px]">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[160px]">
                    Acción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Detalles
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[120px]">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {registros.map((registro) => (
                  <tr key={registro.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm align-top whitespace-nowrap">
                      {formatearFechaCompleta(registro.creado_en)}
                    </td>
                    <td className="px-4 py-3 text-sm align-top">
                      <div className="font-medium">{registro.usuario_nombre}</div>
                      <div className="text-xs text-muted-foreground">{registro.usuario_correo}</div>
                    </td>
                    <td className="px-4 py-3 text-sm align-top">
                      {renderBadgeAccion(registro.accion)}
                    </td>
                    <td className="px-4 py-3 text-sm align-top">
                      {renderDetallesTabla(registro)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground align-top whitespace-nowrap">
                      {registro.ip_address || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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

function renderBadgeAccion(accion: string): React.ReactNode {
  const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
    usuario_creado: { label: 'Usuario creado', variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' },
    usuario_editado: { label: 'Usuario editado', variant: 'outline', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    usuario_eliminado: { label: 'Usuario eliminado', variant: 'destructive' },
    usuario_activado: { label: 'Usuario activado', variant: 'default', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    usuario_desactivado: { label: 'Usuario desactivado', variant: 'outline', className: 'bg-orange-50 text-orange-700 border-orange-200' },
    rol_global_cambiado: { label: 'Rol global cambiado', variant: 'outline', className: 'bg-purple-50 text-purple-700 border-purple-200' },
    rol_modulo_asignado: { label: 'Rol asignado', variant: 'outline', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    rol_modulo_removido: { label: 'Rol removido', variant: 'outline', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    login_exitoso: { label: 'Inicio de sesión', variant: 'secondary' },
    login_fallido: { label: 'Login fallido', variant: 'destructive' },
    logout: { label: 'Cierre de sesión', variant: 'secondary' },
    sesion_expirada: { label: 'Sesión expirada', variant: 'outline', className: 'bg-gray-50 text-gray-700 border-gray-200' },
    cuenta_creada: { label: 'Cuenta creada', variant: 'default', className: 'bg-teal-100 text-teal-800 border-teal-200' },
    traslado_iniciado: { label: 'Traslado iniciado', variant: 'outline', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    radicacion_iniciada: { label: 'Radicación iniciada', variant: 'outline', className: 'bg-sky-50 text-sky-700 border-sky-200' },
    estado_cambiado: { label: 'Estado cambiado', variant: 'outline', className: 'bg-violet-50 text-violet-700 border-violet-200' },
    novedad_agregada: { label: 'Novedad agregada', variant: 'outline', className: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
  };

  const config = configs[accion] || { label: accion.replace(/_/g, ' '), variant: 'outline' as const };

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
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

function renderDetallesTabla(registro: RegistroAuditoria): React.ReactNode {
  const detalles = registro.detalles || {};

  // Componente helper para mostrar cambios
  const RenderCambio = ({ anterior, nuevo }: { anterior: string; nuevo: string }) => (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">{anterior}</span>
      <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
      <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">{nuevo}</span>
    </div>
  );

  switch (registro.accion) {
    case 'usuario_creado':
      return (
        <div className="space-y-1">
          <div className="font-medium text-sm">{detalles.correo || detalles.usuario_correo}</div>
          {detalles.nombre_completo && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {detalles.nombre_completo}
            </div>
          )}
          {detalles.rol_global && (
            <div className="text-xs">
              <Badge variant="outline" className="text-xs">Rol: {detalles.rol_global}</Badge>
            </div>
          )}
        </div>
      );

    case 'usuario_editado':
      const correoAnterior = detalles.correo_anterior;
      const correoNuevo = detalles.correo_nuevo;
      const nombreAnterior = detalles.nombre_anterior;
      const nombreNuevo = detalles.nombre_nuevo;

      return (
        <div className="space-y-1.5">
          {correoAnterior && correoNuevo && correoAnterior !== correoNuevo ? (
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Correo:</div>
              <RenderCambio anterior={correoAnterior} nuevo={correoNuevo} />
            </div>
          ) : (
            <div className="font-medium text-sm">{correoNuevo || correoAnterior}</div>
          )}
          {nombreAnterior && nombreNuevo && nombreAnterior !== nombreNuevo && (
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Nombre:</div>
              <RenderCambio anterior={nombreAnterior} nuevo={nombreNuevo} />
            </div>
          )}
        </div>
      );

    case 'usuario_activado':
      return (
        <div className="space-y-1">
          <div className="font-medium text-sm flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
            {detalles.correo}
          </div>
          <div className="text-xs text-muted-foreground">Usuario activado y habilitado</div>
        </div>
      );

    case 'usuario_desactivado':
      return (
        <div className="space-y-1">
          <div className="font-medium text-sm flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5 text-orange-600" />
            {detalles.correo}
          </div>
          {detalles.razon_suspension && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Razón:</span> {detalles.razon_suspension}
            </div>
          )}
        </div>
      );

    case 'rol_global_cambiado':
      const rolAnterior = registro.valor_anterior || detalles.rol_anterior;
      const rolNuevo = registro.valor_nuevo || detalles.rol_nuevo || detalles.nuevo_rol;

      return (
        <div className="space-y-1.5">
          <div className="font-medium text-sm">{detalles.correo}</div>
          {rolAnterior && rolNuevo && (
            <RenderCambio anterior={rolAnterior} nuevo={rolNuevo} />
          )}
        </div>
      );

    case 'rol_modulo_asignado':
      return (
        <div className="space-y-1">
          <div className="font-medium text-sm">{detalles.usuario_correo || detalles.correo}</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              {detalles.rol_nombre || detalles.rol_codigo}
            </Badge>
            <span className="text-xs text-muted-foreground">en</span>
            <Badge variant="outline" className="text-xs">
              {detalles.modulo_id || detalles.modulo}
            </Badge>
          </div>
        </div>
      );

    case 'rol_modulo_removido':
      return (
        <div className="space-y-1">
          <div className="font-medium text-sm">{detalles.usuario_correo || detalles.correo}</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground">Removido:</span>
            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
              {detalles.rol_nombre || detalles.rol_codigo}
            </Badge>
            <span className="text-xs text-muted-foreground">de</span>
            <Badge variant="outline" className="text-xs">
              {detalles.modulo_id || detalles.modulo}
            </Badge>
          </div>
        </div>
      );

    case 'login_exitoso':
      return (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <LogIn className="h-3.5 w-3.5" />
          Inicio de sesión exitoso
          {detalles.dispositivo && (
            <Badge variant="outline" className="text-xs ml-1">
              {detalles.dispositivo}
            </Badge>
          )}
        </div>
      );

    case 'login_fallido':
      return (
        <div className="space-y-1">
          <div className="text-sm text-red-600 flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5" />
            Intento fallido de inicio de sesión
          </div>
          {detalles.razon && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Razón:</span> {detalles.razon}
            </div>
          )}
        </div>
      );

    case 'logout':
      return (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <LogOut className="h-3.5 w-3.5" />
          Cierre de sesión normal
        </div>
      );

    case 'sesion_expirada':
      return (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Sesión expirada por inactividad
        </div>
      );

    case 'cuenta_creada':
      return (
        <div className="space-y-1">
          <div className="font-medium text-sm">Placa: {detalles.placa}</div>
          {detalles.numero_cuenta && (
            <div className="text-xs text-muted-foreground">
              Cuenta N°: {detalles.numero_cuenta}
            </div>
          )}
        </div>
      );

    case 'traslado_iniciado':
      return (
        <div className="space-y-1">
          {detalles.placa && <div className="font-medium text-sm">Placa: {detalles.placa}</div>}
          {detalles.numero_traslado && (
            <div className="text-xs">
              <Badge variant="outline">Traslado N°: {detalles.numero_traslado}</Badge>
            </div>
          )}
          {detalles.organismo_destino && (
            <div className="text-xs text-muted-foreground">
              Destino: {detalles.organismo_destino}
            </div>
          )}
        </div>
      );

    case 'radicacion_iniciada':
      return (
        <div className="space-y-1">
          {detalles.placa && <div className="font-medium text-sm">Placa: {detalles.placa}</div>}
          {detalles.numero_radicacion && (
            <div className="text-xs">
              <Badge variant="outline">Radicación N°: {detalles.numero_radicacion}</Badge>
            </div>
          )}
          {detalles.organismo && (
            <div className="text-xs text-muted-foreground">
              Organismo: {detalles.organismo}
            </div>
          )}
        </div>
      );

    case 'estado_cambiado':
      const estadoAnterior = detalles.estado_anterior || registro.valor_anterior;
      const estadoNuevo = detalles.nuevo_estado || registro.valor_nuevo;

      return (
        <div className="space-y-1.5">
          {detalles.entidad && <div className="font-medium text-sm">{detalles.entidad}</div>}
          {estadoAnterior && estadoNuevo && (
            <RenderCambio anterior={estadoAnterior} nuevo={estadoNuevo} />
          )}
        </div>
      );

    case 'novedad_agregada':
      return (
        <div className="space-y-1">
          {detalles.tipo_novedad && (
            <Badge variant="outline" className="text-xs">{detalles.tipo_novedad}</Badge>
          )}
          {detalles.descripcion && (
            <div className="text-xs text-muted-foreground max-w-md">
              {detalles.descripcion.length > 100
                ? `${detalles.descripcion.substring(0, 100)}...`
                : detalles.descripcion
              }
            </div>
          )}
        </div>
      );

    default:
      // Mostrar cambio de valor si existe
      if (registro.valor_anterior && registro.valor_nuevo) {
        return <RenderCambio anterior={registro.valor_anterior} nuevo={registro.valor_nuevo} />;
      }

      // Mostrar detalles como JSON si no hay caso específico
      if (Object.keys(detalles).length > 0) {
        return (
          <div className="space-y-0.5">
            {Object.entries(detalles).slice(0, 3).map(([key, val]) => (
              <div key={key} className="text-xs text-muted-foreground">
                <span className="font-medium">{key}:</span> {String(val)}
              </div>
            ))}
          </div>
        );
      }

      return <span className="text-muted-foreground">-</span>;
  }
}
