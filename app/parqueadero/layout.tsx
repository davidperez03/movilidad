import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Truck, User } from "lucide-react"
import { BotonCerrarSesion } from "@/components/logout-button"
import { NavTabsParqueadero } from "@/components/parqueadero/nav-tabs"
import { SkipLink } from "@/components/ui/skip-link"
import { getNowDateColombia } from "@/lib/utils/date"

export const revalidate = 60

interface RolModulo {
  codigo: string
  nombre: string
}

export default async function ParqueaderoLayout({
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

  // Verificar acceso al módulo de parqueadero
  const esSuperAdmin = perfil?.rol_global === 'superadmin'

  if (!esSuperAdmin) {
    // Verificar si tiene rol en parqueadero
    const { data: rolParqueadero } = await supabase
      .from('usuarios_roles')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('modulo_id', 'parqueadero')
      .single()

    if (!rolParqueadero) {
      redirect("/sin-acceso")
    }
  }

  // Obtener estadísticas para badges en el navbar
  const { count: inspeccionesHoy } = await supabase
    .from("parq_inspecciones")
    .select("*", { count: "exact", head: true })
    .eq("fecha", getNowDateColombia())

  const { count: vehiculosActivos } = await supabase
    .from("parq_vehiculos")
    .select("*", { count: "exact", head: true })
    .eq("activo", true)

  // Contar licencias con problemas (vencidas o por vencer, excluyendo auxiliares)
  const { data: personalConAlertas } = await supabase
    .from("parq_vista_personal")
    .select("estado_licencia, rol_codigo")
    .in("estado_licencia", ["vencido", "por_vencer"])
    .neq("rol_codigo", "parq_auxiliar")

  const alertasLicencias = personalConAlertas?.length || 0

  // Obtener rol en módulo parqueadero
  const { data: rolModuloData } = await supabase
    .from('usuarios_roles')
    .select(`
      roles_modulo (
        codigo,
        nombre
      )
    `)
    .eq('usuario_id', user.id)
    .eq('modulo_id', 'parqueadero')
    .single()

  const rolModuloRaw = rolModuloData?.roles_modulo as unknown as RolModulo | null
  const rolModulo: RolModulo = esSuperAdmin
    ? { codigo: 'superadmin', nombre: 'SuperAdmin' }
    : (rolModuloRaw ?? { codigo: 'sin_rol', nombre: 'Sin rol' })

  const rolColors: Record<string, string> = {
    superadmin: "bg-red-100 text-red-700 border-red-300",
    parq_administrador: "bg-purple-100 text-purple-700 border-purple-300",
    parq_auxiliar: "bg-blue-100 text-blue-700 border-blue-300",
    parq_operario: "bg-gray-100 text-gray-700 border-gray-300",
    sin_rol: "bg-gray-100 text-gray-500 border-gray-300",
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <SkipLink href="#main-content">Saltar al contenido principal</SkipLink>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
        <div className="container mx-auto px-4">
          {/* Top bar */}
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-cyan-600/10 p-2">
                  <Truck className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-none">Parqueadero</h1>
                  <p className="text-xs text-muted-foreground">Inspecciones de Grúas</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="text-right">
                  <p className="text-sm font-medium leading-none">{perfil?.nombre_completo || perfil?.correo}</p>
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
          <NavTabsParqueadero
            inspeccionesHoy={inspeccionesHoy}
            vehiculosActivos={vehiculosActivos}
            alertasLicencias={alertasLicencias}
          />
        </div>
      </header>

      {/* Contenido */}
      <main id="main-content" className="container mx-auto px-4 py-8" role="main">
        {children}
      </main>
    </div>
  )
}
