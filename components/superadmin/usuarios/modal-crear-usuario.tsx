'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ModalCrearUsuarioProps {
  form: {
    correo: string;
    nombre_completo: string;
  };
  setForm: (form: { correo: string; nombre_completo: string }) => void;
  onCrear: () => void;
  onCerrar: () => void;
}

export function ModalCrearUsuario({ form, setForm, onCrear, onCerrar }: ModalCrearUsuarioProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crear Nuevo Usuario</CardTitle>
          <CardDescription>
            El usuario quedará pendiente de aprobación. Al aprobarlo se le generará una contraseña temporal y se le enviará por correo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Correo Electrónico *
            </label>
            <Input
              type="email"
              placeholder="usuario@ejemplo.com"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nombre Completo *
            </label>
            <Input
              type="text"
              placeholder="Nombre del usuario"
              value={form.nombre_completo}
              onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
            />
          </div>
        </CardContent>
        <div className="flex gap-2 p-6 pt-0">
          <Button variant="outline" onClick={onCerrar} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={onCrear} className="flex-1">
            Crear Usuario
          </Button>
        </div>
      </Card>
    </div>
  );
}
