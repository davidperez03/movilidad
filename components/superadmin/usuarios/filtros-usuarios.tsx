'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { FiltrosUsuarios } from '@/lib/types/usuario';

interface FiltrosUsuariosProps {
  filtros: FiltrosUsuarios;
  onFiltrosChange: (filtros: FiltrosUsuarios) => void;
}

export function FiltrosUsuarios({ filtros, onFiltrosChange }: FiltrosUsuariosProps) {
  const limpiarFiltros = () => {
    onFiltrosChange({ busqueda: '', rol_global: '', activo: '', modulo: '' });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o correo..."
              value={filtros.busqueda}
              onChange={(e) => onFiltrosChange({ ...filtros, busqueda: e.target.value })}
              className="pl-10"
            />
          </div>
          <select
            value={filtros.rol_global}
            onChange={(e) => onFiltrosChange({ ...filtros, rol_global: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Todos los roles</option>
            <option value="usuario">Usuario</option>
            <option value="superadmin">SuperAdmin</option>
          </select>
          <select
            value={filtros.activo}
            onChange={(e) => onFiltrosChange({ ...filtros, activo: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
          <Button variant="outline" onClick={limpiarFiltros}>
            Limpiar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
