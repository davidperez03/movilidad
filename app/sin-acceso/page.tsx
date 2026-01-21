import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BotonCerrarSesion } from "@/components/logout-button"
import { ShieldAlert } from "lucide-react"
import { AlertBox } from "@/components/ui/alert-box"

export default async function SinAccesoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Obtener perfil
  const { data: profile } = await supabase
    .from("perfiles")
    .select("correo, nombre_completo, rol_global")
    .eq("id", user.id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Icono */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-yellow-100 p-4">
              <ShieldAlert className="h-12 w-12 text-yellow-600" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Sin Acceso a Módulos
          </h1>

          {/* Mensaje */}
          <AlertBox variant="warning" className="mb-6">
            <p className="mb-2">
              Tu cuenta <strong>{profile?.correo}</strong> no tiene roles asignados en ningún módulo del sistema.
            </p>
            <p className="text-yellow-800">
              Contacta al administrador del sistema para que te asigne los permisos correspondientes.
            </p>
          </AlertBox>

          {/* Información del usuario */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Información de tu cuenta
            </h2>
            <dl className="space-y-1">
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600">Nombre:</dt>
                <dd className="font-medium text-gray-900">
                  {profile?.nombre_completo || "No especificado"}
                </dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600">Correo:</dt>
                <dd className="font-medium text-gray-900">{profile?.correo}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600">Tipo:</dt>
                <dd className="font-medium text-gray-900">
                  {profile?.rol_global === "superadmin" ? "SuperAdmin" : "Usuario"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Módulos disponibles */}
          <AlertBox variant="info" title="Módulos del Sistema" className="mb-6">
            <ul className="space-y-1 mb-2">
              <li>• Gestión de Movilidad</li>
            </ul>
            <p className="text-xs text-blue-700">
              Necesitas que te asignen un rol en al menos uno de estos módulos.
            </p>
          </AlertBox>

          {/* Acciones */}
          <div className="space-y-3">
            <BotonCerrarSesion className="w-full" />

            <p className="text-xs text-center text-gray-500">
              Si crees que esto es un error, contacta al administrador del sistema
            </p>
          </div>
        </div>

        {/* Nota inferior */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Para asistencia técnica, contacta al área de soporte
          </p>
        </div>
      </div>
    </div>
  )
}
