'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ban, CheckCircle, Clock, KeyRound, Mail, Trash2, User, UserCog, UserPlus, Users } from 'lucide-react';
import { capitalizeName } from '@/lib/utils/capitalize';
import type { Usuario } from '@/lib/types/usuario';

interface ListaUsuariosProps {
  usuarios: Usuario[];
  hayFiltrosActivos: boolean;
  onAbrirModalCrear: () => void;
  onAbrirModalEditar: (usuario: Usuario) => void;
  onAbrirModalDetalles: (usuario: Usuario) => void;
  onCambiarEstado: (usuario: Usuario, nuevoEstado: boolean) => void;
  onAprobarUsuario?: (usuario: Usuario) => void;
  onResetearPassword?: (usuario: Usuario) => void;
  onEliminarUsuario?: (usuario: Usuario) => void;
}

export function ListaUsuarios({
  usuarios,
  hayFiltrosActivos,
  onAbrirModalCrear,
  onAbrirModalEditar,
  onAbrirModalDetalles,
  onCambiarEstado,
  onAprobarUsuario,
  onResetearPassword,
  onEliminarUsuario,
}: ListaUsuariosProps) {
  const esPendiente = (usuario: Usuario) => !usuario.activo && !usuario.ultima_conexion && !usuario.razon_suspension;

  if (usuarios.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No se encontraron usuarios</p>
          <p className="text-muted-foreground mb-4">
            {hayFiltrosActivos
              ? 'No hay usuarios que coincidan con los filtros aplicados'
              : 'Aún no hay usuarios registrados en el sistema'}
          </p>
          {!hayFiltrosActivos && (
            <Button onClick={onAbrirModalCrear}>
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Primer Usuario
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {usuarios.map((usuario) => {
        const pendiente = esPendiente(usuario);
        return (
          <Card key={usuario.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {capitalizeName(usuario.nombre_completo) || 'Sin nombre'}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {usuario.correo}
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  <Badge variant={usuario.rol_global === 'superadmin' ? 'default' : 'outline'}>
                    {usuario.rol_global === 'superadmin' ? 'SuperAdmin' : 'Usuario'}
                  </Badge>
                  {pendiente ? (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      Pendiente
                    </Badge>
                  ) : (
                    <Badge variant={usuario.activo ? 'default' : 'destructive'}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  )}
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
              <div className="flex gap-2 flex-wrap">
                {pendiente ? (
                  <>
                    {onAprobarUsuario && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => onAprobarUsuario(usuario)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprobar
                      </Button>
                    )}
                    {onEliminarUsuario && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onEliminarUsuario(usuario)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAbrirModalDetalles(usuario)}
                    >
                      <UserCog className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAbrirModalEditar(usuario)}
                    >
                      Editar
                    </Button>
                    {onResetearPassword && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResetearPassword(usuario)}
                      >
                        <KeyRound className="h-4 w-4 mr-2" />
                        Resetear Contraseña
                      </Button>
                    )}
                    <Button
                      variant={usuario.activo ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => onCambiarEstado(usuario, !usuario.activo)}
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
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
