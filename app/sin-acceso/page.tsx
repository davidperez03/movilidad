import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BotonCerrarSesion } from "@/components/logout-button"
import { ShieldAlert, Car, Truck, ArrowRight } from "lucide-react"
import { AlertBox } from "@/components/ui/alert-box"
import { capitalizeName } from "@/lib/utils/capitalize"
import Link from "next/link"

const MODULOS_SISTEMA = [
  { id: "movilidad", nombre: "Movilidad", descripcion: "Traslados y radicaciones", href: "/movilidad", icon: Car },
  { id: "parqueadero", nombre: "Parqueadero", descripcion: "Inspecciones de grúas", href: "/parqueadero", icon: Truck },
]

export default async function SinAccesoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("perfiles")
    .select("correo, nombre_completo, rol_global")
    .eq("id", user.id)
    .single()

  const esSuperAdmin = profile?.rol_global === "superadmin"

  // Obtener módulos asignados al usuario
  const { data: rolesUsuario } = await supabase
    .from("usuarios_roles")
    .select("modulo_id")
    .eq("usuario_id", user.id)

  const modulosAsignados = new Set(rolesUsuario?.map((r) => r.modulo_id) || [])

  // Si es superadmin tiene acceso a todo, si no solo a los asignados
  const modulosConAcceso = MODULOS_SISTEMA.filter(
    (m) => esSuperAdmin || modulosAsignados.has(m.id)
  )
  const modulosSinAcceso = MODULOS_SISTEMA.filter(
    (m) => !esSuperAdmin && !modulosAsignados.has(m.id)
  )

  // Si tiene acceso a algún módulo, redirigir al primero
  if (esSuperAdmin) {
    redirect("/superadmin/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-yellow-100 p-4">
              <ShieldAlert className="h-12 w-12 text-yellow-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
            {modulosConAcceso.length > 0 ? "Acceso Limitado" : "Sin Acceso a Módulos"}
          </h1>

          {modulosConAcceso.length === 0 ? (
            <AlertBox variant="warning" className="mb-6">
              <p className="mb-2">
                Tu cuenta <strong>{profile?.correo}</strong> no tiene roles asignados en ningún módulo.
              </p>
              <p className="text-yellow-800">
                Contacta al administrador para que te asigne los permisos correspondientes.
              </p>
            </AlertBox>
          ) : (
            <p className="text-sm text-muted-foreground text-center mb-6">
              No tienes acceso al módulo solicitado. Estos son tus módulos disponibles:
            </p>
          )}

          {/* Información del usuario */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Tu cuenta</h2>
            <dl className="space-y-1">
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600">Nombre:</dt>
                <dd className="font-medium text-gray-900">
                  {capitalizeName(profile?.nombre_completo) || "No especificado"}
                </dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-600">Correo:</dt>
                <dd className="font-medium text-gray-900">{profile?.correo}</dd>
              </div>
            </dl>
          </div>

          {/* Módulos con acceso */}
          {modulosConAcceso.length > 0 && (
            <div className="space-y-2 mb-6">
              <h2 className="text-sm font-semibold text-gray-700">Módulos disponibles</h2>
              {modulosConAcceso.map((modulo) => {
                const Icon = modulo.icon
                return (
                  <Link
                    key={modulo.id}
                    href={modulo.href}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors group"
                  >
                    <div className="rounded-md bg-primary/10 p-2">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{modulo.nombre}</p>
                      <p className="text-xs text-muted-foreground">{modulo.descripcion}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Link>
                )
              })}
            </div>
          )}

          {/* Módulos sin acceso */}
          {modulosSinAcceso.length > 0 && (
            <div className="space-y-2 mb-6">
              <h2 className="text-sm font-semibold text-gray-700">Módulos sin acceso</h2>
              {modulosSinAcceso.map((modulo) => {
                const Icon = modulo.icon
                return (
                  <div
                    key={modulo.id}
                    className="flex items-center gap-3 rounded-lg border border-dashed p-3 opacity-50"
                  >
                    <div className="rounded-md bg-gray-100 p-2">
                      <Icon className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">{modulo.nombre}</p>
                      <p className="text-xs text-gray-400">{modulo.descripcion}</p>
                    </div>
                  </div>
                )
              })}
              <p className="text-xs text-muted-foreground">
                Contacta al administrador para solicitar acceso.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <BotonCerrarSesion className="w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
