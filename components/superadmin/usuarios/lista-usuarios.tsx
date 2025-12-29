'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ban, CheckCircle, Clock, Mail, User, UserCog, UserPlus, Users } from 'lucide-react';

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

interface ListaUsuariosProps {
  usuarios: Usuario[];
  hayFiltrosActivos: boolean;
  onAbrirModalCrear: () => void;
  onAbrirModalEditar: (usuario: Usuario) => void;
  onAbrirModalDetalles: (usuario: Usuario) => void;
  onCambiarEstado: (usuario: Usuario, nuevoEstado: boolean) => void;
}

export function ListaUsuarios({
  usuarios,
  hayFiltrosActivos,
  onAbrirModalCrear,
  onAbrirModalEditar,
  onAbrirModalDetalles,
  onCambiarEstado,
}: ListaUsuariosProps) {
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
      {usuarios.map((usuario) => (
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
