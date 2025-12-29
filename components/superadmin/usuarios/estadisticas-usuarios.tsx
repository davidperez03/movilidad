'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ban, CheckCircle, ShieldCheck, Users } from 'lucide-react';

interface Usuario {
  id: string;
  rol_global: 'usuario' | 'superadmin';
  activo: boolean;
}

interface EstadisticasUsuariosProps {
  usuarios: Usuario[];
}

export function EstadisticasUsuarios({ usuarios }: EstadisticasUsuariosProps) {
  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter((u) => u.activo).length;
  const usuariosInactivos = usuarios.filter((u) => !u.activo).length;
  const superAdmins = usuarios.filter((u) => u.rol_global === 'superadmin').length;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsuarios}</div>
          <p className="text-xs text-muted-foreground">Usuarios registrados</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activos</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {usuariosActivos}
          </div>
          <p className="text-xs text-muted-foreground">Usuarios activos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
          <Ban className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {usuariosInactivos}
          </div>
          <p className="text-xs text-muted-foreground">Usuarios inactivos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">SuperAdmins</CardTitle>
          <ShieldCheck className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {superAdmins}
          </div>
          <p className="text-xs text-muted-foreground">Administradores</p>
        </CardContent>
      </Card>
    </div>
  );
}
