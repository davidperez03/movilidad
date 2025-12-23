'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ShieldCheck, UserPlus, Activity, Clock, FileText, UserCheck, UserX, LogIn, LogOut, Edit2, Shield, XCircle, CheckCircle, ArrowRightLeft, Car, FileInput } from 'lucide-react';

interface DashboardStats {
  totalUsuarios: number;
  totalSuperadmins: number;
  usuariosActivos: number;
  usuariosInactivos: number;
  sesionesActivas: number;
  totalAccionesHoy: number;
}

interface ActividadReciente {
  id: string;
  accion: string;
  usuario_correo: string;
  usuario_nombre: string;
  detalles: any;
  entidad_tipo: string | null;
  creado_en: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [actividadReciente, setActividadReciente] = useState<ActividadReciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();

    // Auto-refresh cada 60 segundos para sesiones y actividad
    const intervalo = setInterval(() => {
      cargarDatosEnTiempoReal();
    }, 60000); // 60 segundos

    return () => clearInterval(intervalo);
  }, []);

  async function cargarDatosEnTiempoReal() {
    try {
      const supabase = createClient();

      // Solo actualizar datos que cambian en tiempo real
      if (stats) {
        // Obtener sesiones activas
        let sesionesActivas = 0;
        try {
          const { count, error: errorSesiones } = await supabase
            .from('sys_sesiones')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'activa');

          if (!errorSesiones && count !== null) {
            sesionesActivas = count;
          }
        } catch {
          // Ignorar error
        }

        // Obtener acciones de hoy
        let totalAccionesHoy = 0;
        try {
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);

          const { count, error: errorAuditoria } = await supabase
            .from('sys_auditoria')
            .select('*', { count: 'exact', head: true })
            .gte('creado_en', hoy.toISOString());

          if (!errorAuditoria && count !== null) {
            totalAccionesHoy = count;
          }
        } catch {
          // Ignorar error
        }

        // Actualizar stats
        setStats({
          ...stats,
          sesionesActivas,
          totalAccionesHoy,
        });
      }

      // Actualizar actividad reciente
      try {
        const { data: actividad, error: errorActividad } = await supabase
          .from('sys_auditoria')
          .select(`
            id,
            accion,
            detalles,
            entidad_tipo,
            creado_en,
            realizado_por,
            perfiles!sys_auditoria_realizado_por_fkey (
              correo,
              nombre_completo
            )
          `)
          .order('creado_en', { ascending: false })
          .limit(10);

        if (!errorActividad && actividad) {
          const actividadFormateada = actividad.map((item: any) => {
            const detalles = item.detalles || {};

            // Si no hay perfil (realizado_por es NULL), intentar obtener del campo detalles
            // Esto es común en logout/sesion_expirada ejecutados por funciones SECURITY DEFINER
            const usuarioCorreo = item.perfiles?.correo || detalles.usuario_correo || 'Sistema';
            const usuarioNombre = item.perfiles?.nombre_completo || detalles.usuario_nombre || 'Sistema';

            return {
              id: item.id,
              accion: item.accion,
              detalles,
              entidad_tipo: item.entidad_tipo,
              usuario_correo: usuarioCorreo,
              usuario_nombre: usuarioNombre,
              creado_en: item.creado_en,
            };
          });
          setActividadReciente(actividadFormateada);
        }
      } catch {
        // Ignorar error
      }
    } catch (error) {
      // Error ya manejado
    }
  }

  async function cargarDatos() {
    try {
      const supabase = createClient();

      // Obtener estadísticas de usuarios
      const { data: usuarios, error: errorUsuarios } = await supabase
        .from('perfiles')
        .select('rol_global, activo');

      if (errorUsuarios) throw errorUsuarios;

      // Calcular estadísticas
      const totalUsuarios = usuarios?.length || 0;
      const totalSuperadmins = usuarios?.filter((u) => u.rol_global === 'superadmin').length || 0;
      const usuariosActivos = usuarios?.filter((u) => u.activo === true).length || 0;
      const usuariosInactivos = usuarios?.filter((u) => u.activo === false).length || 0;

      // Obtener sesiones activas
      let sesionesActivas = 0;
      try {
        const { count, error: errorSesiones } = await supabase
          .from('sys_sesiones')
          .select('*', { count: 'exact', head: true })
          .eq('estado', 'activa');

        if (!errorSesiones && count !== null) {
          sesionesActivas = count;
        }
      } catch {
        // Si la tabla no existe aún, ignorar el error
      }

      // Obtener acciones de hoy
      let totalAccionesHoy = 0;
      try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const { count, error: errorAuditoria } = await supabase
          .from('sys_auditoria')
          .select('*', { count: 'exact', head: true })
          .gte('creado_en', hoy.toISOString());

        if (!errorAuditoria && count !== null) {
          totalAccionesHoy = count;
        }
      } catch {
        // Si la tabla no existe aún, ignorar el error
      }

      setStats({
        totalUsuarios,
        totalSuperadmins,
        usuariosActivos,
        usuariosInactivos,
        sesionesActivas,
        totalAccionesHoy,
      });

      // Obtener actividad reciente
      try {
        const { data: actividad, error: errorActividad } = await supabase
          .from('sys_auditoria')
          .select(`
            id,
            accion,
            detalles,
            entidad_tipo,
            creado_en,
            realizado_por,
            perfiles!sys_auditoria_realizado_por_fkey (
              correo,
              nombre_completo
            )
          `)
          .order('creado_en', { ascending: false })
          .limit(10);

        if (!errorActividad && actividad) {
          const actividadFormateada = actividad.map((item: any) => {
            const detalles = item.detalles || {};

            // Si no hay perfil (realizado_por es NULL), intentar obtener del campo detalles
            // Esto es común en logout/sesion_expirada ejecutados por funciones SECURITY DEFINER
            const usuarioCorreo = item.perfiles?.correo || detalles.usuario_correo || 'Sistema';
            const usuarioNombre = item.perfiles?.nombre_completo || detalles.usuario_nombre || 'Sistema';

            return {
              id: item.id,
              accion: item.accion,
              detalles,
              entidad_tipo: item.entidad_tipo,
              usuario_correo: usuarioCorreo,
              usuario_nombre: usuarioNombre,
              creado_en: item.creado_en,
            };
          });
          setActividadReciente(actividadFormateada);
        }
      } catch {
        // Si la vista no existe aún, ignorar el error
      }
    } catch (error) {
      // Error ya manejado
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Panel de control y estadísticas del sistema
          </p>
        </div>
        <Button asChild>
          <Link href="/superadmin/usuarios">
            <UserPlus className="h-4 w-4 mr-2" />
            Crear Usuario
          </Link>
        </Button>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/superadmin/usuarios" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsuarios || 0}</div>
              <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/usuarios?filtro=activos" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.usuariosActivos || 0}</div>
              <p className="text-xs text-muted-foreground">Pueden iniciar sesión</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/usuarios?filtro=inactivos" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Inactivos</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.usuariosInactivos || 0}</div>
              <p className="text-xs text-muted-foreground">Desactivados</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/usuarios?filtro=superadmin" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SuperAdmins</CardTitle>
              <ShieldCheck className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats?.totalSuperadmins || 0}</div>
              <p className="text-xs text-muted-foreground">Acceso completo</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Segunda fila de métricas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.sesionesActivas || 0}</div>
            <p className="text-xs text-muted-foreground">Conectados ahora</p>
          </CardContent>
        </Card>

        <Link href="/superadmin/auditoria" className="block transition-transform hover:scale-105">
          <Card className="cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acciones Hoy</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.totalAccionesHoy || 0}</div>
              <p className="text-xs text-muted-foreground">Actividad del día</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Actividad reciente */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones en el sistema</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/superadmin/auditoria">
                Ver todo
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {actividadReciente.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay actividad reciente registrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {actividadReciente.map((item) => (
                <div key={item.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0 hover:bg-muted/30 -mx-2 px-2 py-2 rounded-md transition-colors">
                  <div className="mt-0.5">
                    {getIconoActividad(item.accion)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-sm">
                        <span className="font-medium">{item.usuario_nombre || item.usuario_correo || 'Sistema'}</span>
                        {' '}
                        <span className="text-muted-foreground">{formatearDescripcionActividad(item)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {formatearFecha(item.creado_en)}
                      </div>
                    </div>
                    {renderDetallesActividad(item)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

function getIconoActividad(accion: string): React.ReactNode {
  const iconProps = "h-4 w-4";

  const iconos: Record<string, React.ReactNode> = {
    usuario_creado: <UserPlus className={`${iconProps} text-green-600`} />,
    usuario_editado: <Edit2 className={`${iconProps} text-blue-600`} />,
    usuario_activado: <CheckCircle className={`${iconProps} text-emerald-600`} />,
    usuario_desactivado: <XCircle className={`${iconProps} text-orange-600`} />,
    rol_global_cambiado: <Shield className={`${iconProps} text-purple-600`} />,
    rol_modulo_asignado: <Shield className={`${iconProps} text-indigo-600`} />,
    rol_modulo_removido: <Shield className={`${iconProps} text-amber-600`} />,
    login_exitoso: <LogIn className={`${iconProps} text-blue-600`} />,
    logout: <LogOut className={`${iconProps} text-gray-600`} />,
    sesion_expirada: <Clock className={`${iconProps} text-gray-500`} />,
    cuenta_creada: <FileText className={`${iconProps} text-teal-600`} />,
    traslado_iniciado: <Car className={`${iconProps} text-cyan-600`} />,
    radicacion_iniciada: <FileInput className={`${iconProps} text-sky-600`} />,
    estado_cambiado: <ArrowRightLeft className={`${iconProps} text-violet-600`} />,
  };

  return iconos[accion] || <Activity className={`${iconProps} text-muted-foreground`} />;
}

function formatearDescripcionActividad(item: ActividadReciente): string {
  const { accion } = item;

  switch (accion) {
    case 'usuario_creado':
      return 'creó un nuevo usuario';
    case 'usuario_editado':
      return 'editó la información de un usuario';
    case 'usuario_activado':
      return 'activó un usuario';
    case 'usuario_desactivado':
      return 'desactivó un usuario';
    case 'rol_global_cambiado':
      return 'cambió el rol global de un usuario';
    case 'rol_modulo_asignado':
      return 'asignó un rol de módulo';
    case 'rol_modulo_removido':
      return 'removió un rol de módulo';
    case 'login_exitoso':
      return 'inició sesión';
    case 'logout':
      return 'cerró sesión';
    case 'sesion_expirada':
      return 'tuvo una sesión expirada por inactividad';
    case 'cuenta_creada':
      return 'creó una nueva cuenta';
    case 'traslado_iniciado':
      return 'inició un traslado';
    case 'radicacion_iniciada':
      return 'inició una radicación';
    case 'estado_cambiado':
      return 'cambió el estado de una entidad';
    default:
      return accion.replace(/_/g, ' ');
  }
}

function renderDetallesActividad(item: ActividadReciente): React.ReactNode {
  const { accion, detalles } = item;

  if (!detalles || Object.keys(detalles).length === 0) {
    return null;
  }

  const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: string }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
      variant === 'secondary' ? 'bg-secondary text-secondary-foreground' : 'bg-primary/10 text-primary'
    }`}>
      {children}
    </span>
  );

  switch (accion) {
    case 'usuario_creado':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {detalles.correo && <Badge>{detalles.correo}</Badge>}
          {detalles.rol_global && <Badge variant="secondary">Rol: {detalles.rol_global}</Badge>}
        </div>
      );

    case 'usuario_editado':
      const cambios: string[] = [];
      if (detalles.correo_anterior && detalles.correo_nuevo && detalles.correo_anterior !== detalles.correo_nuevo) {
        cambios.push(`Correo: ${detalles.correo_anterior} → ${detalles.correo_nuevo}`);
      }
      if (detalles.nombre_anterior && detalles.nombre_nuevo && detalles.nombre_anterior !== detalles.nombre_nuevo) {
        cambios.push(`Nombre: ${detalles.nombre_anterior} → ${detalles.nombre_nuevo}`);
      }

      return cambios.length > 0 ? (
        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
          {cambios.map((cambio, idx) => (
            <div key={idx}>{cambio}</div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {detalles.correo && <Badge>{detalles.correo}</Badge>}
        </div>
      );

    case 'usuario_activado':
    case 'usuario_desactivado':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {detalles.correo && <Badge>{detalles.correo}</Badge>}
          {detalles.razon_suspension && (
            <span className="text-muted-foreground">Razón: {detalles.razon_suspension}</span>
          )}
        </div>
      );

    case 'rol_global_cambiado':
      const rolAnterior = detalles.rol_anterior;
      const rolNuevo = detalles.rol_nuevo || detalles.nuevo_rol;

      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {detalles.correo && <Badge>{detalles.correo}</Badge>}
          {rolAnterior && rolNuevo && (
            <span className="text-muted-foreground">
              {rolAnterior} → {rolNuevo}
            </span>
          )}
        </div>
      );

    case 'rol_modulo_asignado':
    case 'rol_modulo_removido':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {(detalles.usuario_correo || detalles.correo) && (
            <Badge>{detalles.usuario_correo || detalles.correo}</Badge>
          )}
          {detalles.rol_nombre && (
            <Badge variant="secondary">{detalles.rol_nombre}</Badge>
          )}
          {(detalles.modulo_id || detalles.modulo) && (
            <span className="text-muted-foreground">en {detalles.modulo_id || detalles.modulo}</span>
          )}
        </div>
      );

    case 'login_exitoso':
      return detalles.dispositivo ? (
        <div className="text-xs text-muted-foreground mt-1">
          Dispositivo: {detalles.dispositivo}
        </div>
      ) : null;

    case 'cuenta_creada':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {detalles.placa && <Badge>Placa: {detalles.placa}</Badge>}
          {detalles.numero_cuenta && (
            <span className="text-muted-foreground">Cuenta N°: {detalles.numero_cuenta}</span>
          )}
        </div>
      );

    case 'traslado_iniciado':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {detalles.placa && <Badge>Placa: {detalles.placa}</Badge>}
          {detalles.numero_traslado && (
            <span className="text-muted-foreground">Traslado N°: {detalles.numero_traslado}</span>
          )}
          {detalles.organismo_destino && (
            <span className="text-muted-foreground">→ {detalles.organismo_destino}</span>
          )}
        </div>
      );

    case 'radicacion_iniciada':
      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {detalles.placa && <Badge>Placa: {detalles.placa}</Badge>}
          {detalles.numero_radicacion && (
            <span className="text-muted-foreground">Radicación N°: {detalles.numero_radicacion}</span>
          )}
          {detalles.organismo && (
            <span className="text-muted-foreground">en {detalles.organismo}</span>
          )}
        </div>
      );

    case 'estado_cambiado':
      const estadoAnterior = detalles.estado_anterior;
      const estadoNuevo = detalles.nuevo_estado;

      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {detalles.entidad && <Badge>{detalles.entidad}</Badge>}
          {estadoAnterior && estadoNuevo && (
            <span className="text-muted-foreground">
              {estadoAnterior} → {estadoNuevo}
            </span>
          )}
        </div>
      );

    default:
      // Mostrar los primeros 2-3 campos importantes
      const keys = Object.keys(detalles).filter(k =>
        !['usuario_id', 'id', 'created_at', 'updated_at'].includes(k)
      ).slice(0, 2);

      if (keys.length === 0) return null;

      return (
        <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
          {keys.map(key => (
            <span key={key} className="text-muted-foreground">
              {key}: {String(detalles[key])}
            </span>
          ))}
        </div>
      );
  }
}

function formatearFecha(fecha: string): string {
  const date = new Date(fecha);
  const ahora = new Date();
  const diffMs = ahora.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Justo ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;

  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
  });
}
