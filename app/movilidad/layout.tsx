import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Car, User } from "lucide-react"
import { BotonCerrarSesion } from "@/components/logout-button"
import { NavTabs } from "@/components/movilidad/nav-tabs"

export default async function MovilidadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Obtener perfil del usuario
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Verificar acceso al módulo de movilidad
  // Debe ser superadmin O tener rol asignado en el módulo movilidad
  const esSuperAdmin = perfil?.rol_global === 'superadmin'

  if (!esSuperAdmin) {
    // Verificar si tiene rol en movilidad
    const { data: rolMovilidad } = await supabase
      .from('usuarios_roles')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('modulo_id', 'movilidad')
      .single()

    if (!rolMovilidad) {
      redirect("/sin-acceso")
    }
  }

  // Obtener estadísticas para badges en el navbar
  const { count: trasladosActivos } = await supabase
    .from("mov_traslados")
    .select("*", { count: "exact", head: true })
    .not("estado", "in", "(trasladado,devuelto)")

  const { count: radicacionesActivas } = await supabase
    .from("mov_radicaciones")
    .select("*", { count: "exact", head: true })
    .not("estado", "in", "(radicado,devuelto)")

  const { count: novedadesPendientes } = await supabase
    .from("mov_novedades")
    .select("*", { count: "exact", head: true })
    .neq("estado", "resuelta")

  // Obtener rol en módulo movilidad
  const { data: rolModuloData } = await supabase
    .from('usuarios_roles')
    .select(`
      roles_modulo (
        codigo,
        nombre
      )
    `)
    .eq('usuario_id', user.id)
    .eq('modulo_id', 'movilidad')
    .single()

  const rolModuloRaw = rolModuloData?.roles_modulo as any
  const rolModulo = esSuperAdmin
    ? { codigo: 'superadmin', nombre: 'SuperAdmin' }
    : (rolModuloRaw ? { codigo: rolModuloRaw.codigo, nombre: rolModuloRaw.nombre } : { codigo: 'sin_rol', nombre: 'Sin rol' })

  const rolColors: Record<string, string> = {
    superadmin: "bg-red-100 text-red-700 border-red-300",
    mov_administrador: "bg-purple-100 text-purple-700 border-purple-300",
    mov_operador: "bg-blue-100 text-blue-700 border-blue-300",
    mov_usuario: "bg-gray-100 text-gray-700 border-gray-300",
    sin_rol: "bg-gray-100 text-gray-500 border-gray-300",
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header mejorado */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          {/* Top bar */}
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-none">Movilidad</h1>
                  <p className="text-xs text-muted-foreground">Traslados y Radicaciones</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="text-right">
                  <p className="text-sm font-medium leading-none">{perfil.nombre_completo || perfil.correo}</p>
                  <Badge
                    variant="outline"
                    className={`mt-1 text-xs ${rolColors[rolModulo.codigo as keyof typeof rolColors]}`}
                  >
                    {rolModulo.nombre}
                  </Badge>
                </div>
              </div>
              <div className="h-8 w-px bg-border" />
              <BotonCerrarSesion />
            </div>
          </div>

          {/* Navigation tabs */}
          <NavTabs
            trasladosActivos={trasladosActivos}
            radicacionesActivas={radicacionesActivas}
            novedadesPendientes={novedadesPendientes}
          />
        </div>
      </header>

      {/* Contenido */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
