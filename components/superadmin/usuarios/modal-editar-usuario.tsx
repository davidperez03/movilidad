'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ModalEditarUsuarioProps {
  form: {
    correo: string;
    nombre_completo: string;
  };
  setForm: (form: { correo: string; nombre_completo: string }) => void;
  onEditar: () => void;
  onCerrar: () => void;
}

export function ModalEditarUsuario({ form, setForm, onEditar, onCerrar }: ModalEditarUsuarioProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Editar Usuario</CardTitle>
          <CardDescription>Modifica los datos del usuario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Correo Electrónico
            </label>
            <Input
              type="email"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nombre Completo
            </label>
            <Input
              type="text"
              value={form.nombre_completo}
              onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
            />
          </div>
        </CardContent>
        <div className="flex gap-2 p-6 pt-0">
          <Button variant="outline" onClick={onCerrar} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={onEditar} className="flex-1">
            Guardar Cambios
          </Button>
        </div>
      </Card>
    </div>
  );
}
