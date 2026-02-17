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
import { obtenerLayoutData } from "@/lib/movilidad/server/layout-data"

export const dynamic = "force-dynamic"

const rolColors: Record<string, string> = {
  superadmin: "bg-red-100 text-red-700 border-red-300",
  mov_administrador: "bg-purple-100 text-purple-700 border-purple-300",
  mov_operador: "bg-blue-100 text-blue-700 border-blue-300",
  mov_usuario: "bg-gray-100 text-gray-700 border-gray-300",
  sin_rol: "bg-gray-100 text-gray-500 border-gray-300",
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

  const esSuperAdmin = perfil?.rol_global === 'superadmin'

  // Verificar acceso al módulo de movilidad
  if (!esSuperAdmin) {
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

  // Una sola función obtiene: contadores + rol + módulos (antes 4 queries, ahora 2)
  const { contadores, rolModulo, tieneParqueadero } = await obtenerLayoutData(
    user.id,
    esSuperAdmin
  )

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
            trasladosActivos={contadores.trasladosActivos}
            radicacionesActivas={contadores.radicacionesActivas}
            novedadesPendientes={contadores.novedadesPendientes}
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
