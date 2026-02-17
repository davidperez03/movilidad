import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Car, Truck, User, ShieldCheck } from "lucide-react"
import { BotonCerrarSesion } from "@/components/logout-button"
import Link from "next/link"
import { NavTabs, movilidadNavItems } from "@/components/movilidad/nav-tabs"
import { MobileNav } from "@/components/shared/mobile-nav"
import type { MobileUserInfo } from "@/components/shared/mobile-nav"
import { SkipLink } from "@/components/ui/skip-link"
import { capitalizeName } from "@/lib/utils/capitalize"

export const dynamic = "force-dynamic"

interface RolModulo {
  codigo: string
  nombre: string
}

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

  const rolModuloRaw = rolModuloData?.roles_modulo as unknown as RolModulo | null
  const rolModulo: RolModulo = esSuperAdmin
    ? { codigo: 'superadmin', nombre: 'SuperAdmin' }
    : (rolModuloRaw ?? { codigo: 'sin_rol', nombre: 'Sin rol' })

  const rolColors: Record<string, string> = {
    superadmin: "bg-red-100 text-red-700 border-red-300",
    mov_administrador: "bg-purple-100 text-purple-700 border-purple-300",
    mov_operador: "bg-blue-100 text-blue-700 border-blue-300",
    mov_usuario: "bg-gray-100 text-gray-700 border-gray-300",
    sin_rol: "bg-gray-100 text-gray-500 border-gray-300",
  }

  // Obtener todos los módulos del usuario para alternancia
  const { data: todosLosRoles } = await supabase
    .from('usuarios_roles')
    .select('modulo_id')
    .eq('usuario_id', user.id)

  const modulosUsuario = new Set(todosLosRoles?.map(r => r.modulo_id) || [])
  const tieneParqueadero = esSuperAdmin || modulosUsuario.has('parqueadero')

  const nombreCapitalizado = capitalizeName(perfil?.nombre_completo) || perfil?.correo || ''

  const mobileUserInfo: MobileUserInfo = {
    nombre: nombreCapitalizado,
    rol: rolModulo.nombre,
    rolColor: rolColors[rolModulo.codigo] || rolColors.sin_rol,
    esSuperAdmin,
    otrosModulos: tieneParqueadero
      ? [{ href: '/parqueadero', label: 'Parqueadero', iconName: 'Truck' }]
      : [],
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <SkipLink href="#main-content">Saltar al contenido principal</SkipLink>

      {/* Header mejorado */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
        <div className="container mx-auto px-4">
          {/* Top bar */}
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <MobileNav title="Movilidad" items={movilidadNavItems} userInfo={mobileUserInfo} />
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-none">Movilidad</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">Traslados y Radicaciones</p>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="text-right">
                  <p className="text-sm font-medium leading-none">{nombreCapitalizado}</p>
                  <Badge
                    variant="outline"
                    className={`mt-1 text-xs ${rolColors[rolModulo.codigo as keyof typeof rolColors]}`}
                  >
                    {rolModulo.nombre}
                  </Badge>
                </div>
              </div>
              {tieneParqueadero && (
                <Link
                  href="/parqueadero"
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md border px-2.5 py-1.5"
                >
                  <Truck className="h-3.5 w-3.5" />
                  Parqueadero
                </Link>
              )}
              {esSuperAdmin && (
                <Link
                  href="/superadmin/dashboard"
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md border px-2.5 py-1.5"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Panel Admin
                </Link>
              )}
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
      <main id="main-content" className="container mx-auto px-4 py-8" role="main">
        {children}
      </main>
    </div>
  )
}
