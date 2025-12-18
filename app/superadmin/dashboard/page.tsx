'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ShieldCheck, UserPlus, Activity, Clock, FileText, Car, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalUsuarios: number;
  totalSuperadmins: number;
  totalUsuariosRegulares: number;
  usuariosConRolMovilidad: number;
  nuevosUsuariosEstaSemana: number;
  sesionesActivas: number;
}

interface ActividadReciente {
  id: string;
  modulo: string;
  accion: string;
  usuario_correo: string;
  usuario_nombre: string;
  creado_en: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [actividadReciente, setActividadReciente] = useState<ActividadReciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const supabase = createClient();

      // Obtener estadísticas de usuarios
      const { data: usuarios, error: errorUsuarios } = await supabase
        .from('perfiles')
        .select('rol_global, creado_en');

      if (errorUsuarios) throw errorUsuarios;

      // Calcular estadísticas
      const totalUsuarios = usuarios?.length || 0;
      const totalSuperadmins = usuarios?.filter((u) => u.rol_global === 'superadmin').length || 0;
      const totalUsuariosRegulares = usuarios?.filter((u) => u.rol_global === 'usuario').length || 0;

      // Usuarios nuevos esta semana (últimos 7 días)
      const haceUnaSemana = new Date();
      haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);
      const nuevosUsuariosEstaSemana = usuarios?.filter(
        (u) => new Date(u.creado_en) >= haceUnaSemana
      ).length || 0;

      // Obtener usuarios con rol en movilidad
      const { data: usuariosRoles, error: errorRoles } = await supabase
        .from('usuarios_roles')
        .select('usuario_id')
        .eq('modulo_id', 'movilidad');

      if (errorRoles) throw errorRoles;

      const usuariosConRolMovilidad = usuariosRoles?.length || 0;

      // Obtener sesiones activas (si la tabla existe)
      let sesionesActivas = 0;
      try {
        const { data: sesiones, error: errorSesiones } = await supabase
          .from('sys_sesiones')
          .select('id', { count: 'exact', head: true })
          .eq('estado', 'activa');

        if (!errorSesiones && sesiones !== null) {
          sesionesActivas = 0; // El count está en el header
        }
      } catch {
        // Si la tabla no existe aún, ignorar el error
      }

      setStats({
        totalUsuarios,
        totalSuperadmins,
        totalUsuariosRegulares,
        usuariosConRolMovilidad,
        nuevosUsuariosEstaSemana,
        sesionesActivas,
      });

      // Obtener actividad reciente (si la vista existe)
      try {
        const { data: actividad, error: errorActividad } = await supabase
          .from('sys_vista_auditoria_reciente')
          .select('id, modulo, accion, usuario_correo, usuario_nombre, creado_en')
          .limit(10);

        if (!errorActividad && actividad) {
          setActividadReciente(actividad);
        }
      } catch {
        // Si la vista no existe aún, ignorar el error
      }
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
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
      <div>
        <h1 className="text-3xl font-bold">Dashboard SuperAdmin</h1>
        <p className="text-muted-foreground">
          Panel de control y estadísticas del sistema
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsuarios || 0}</div>
            <p className="text-xs text-muted-foreground">En el sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SuperAdmins</CardTitle>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats?.totalSuperadmins || 0}</div>
            <p className="text-xs text-muted-foreground">Administradores</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Regulares</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.totalUsuariosRegulares || 0}</div>
            <p className="text-xs text-muted-foreground">Con roles específicos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Esta Semana</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.nuevosUsuariosEstaSemana || 0}</div>
            <p className="text-xs text-muted-foreground">Últimos 7 días</p>
          </CardContent>
        </Card>
      </div>

      {/* Segunda fila de métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios en Movilidad</CardTitle>
            <Car className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats?.usuariosConRolMovilidad || 0}</div>
            <p className="text-xs text-muted-foreground">Con rol asignado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
            <Activity className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">{stats?.sesionesActivas || 0}</div>
            <p className="text-xs text-muted-foreground">Conectados ahora</p>
          </CardContent>
        </Card>
        <Card className="flex flex-col justify-center">
          <CardContent className="pt-6">
            <Button asChild className="w-full">
              <Link href="/superadmin/usuarios">
                <UserPlus className="h-4 w-4 mr-2" />
                Gestionar Usuarios
              </Link>
            </Button>
          </CardContent>
        </Card>
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
            <div className="space-y-4">
              {actividadReciente.map((item) => (
                <div key={item.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase bg-secondary px-2 py-0.5 rounded">
                        {item.modulo}
                      </span>
                      <span className="text-sm font-medium">
                        {formatearAccion(item.accion)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {item.usuario_nombre || item.usuario_correo || 'Sistema'}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatearFecha(item.creado_en)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accesos rápidos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <ShieldCheck className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Gestión de Roles</CardTitle>
            <CardDescription>Administrar roles y permisos de usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/superadmin/roles">
                Ir a Roles
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <FileText className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Auditoría</CardTitle>
            <CardDescription>Ver historial completo de acciones</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/superadmin/auditoria">
                Ver Auditoría
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Car className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Módulo de Movilidad</CardTitle>
            <CardDescription>Ir al módulo de gestión de movilidad</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/movilidad">
                Ir a Movilidad
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatearAccion(accion: string): string {
  const acciones: Record<string, string> = {
    usuario_creado: 'Usuario creado',
    usuario_editado: 'Usuario editado',
    rol_global_cambiado: 'Rol global cambiado',
    rol_modulo_asignado: 'Rol asignado',
    rol_modulo_removido: 'Rol removido',
    login_exitoso: 'Inicio de sesión',
    logout: 'Cierre de sesión',
    cuenta_creada: 'Cuenta creada',
    traslado_iniciado: 'Traslado iniciado',
    radicacion_iniciada: 'Radicación iniciada',
    estado_cambiado: 'Estado cambiado',
  };

  return acciones[accion] || accion;
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
