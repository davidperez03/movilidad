import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Car, FileText, ArrowRightLeft, ArrowDownToLine, LayoutDashboard, Activity, User } from "lucide-react"
import { BotonCerrarSesion } from "@/components/logout-button"

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

  // Solo agentes y administradores pueden acceder al módulo de movilidad
  if (!perfil || !["agente", "administrador"].includes(perfil.rol)) {
    redirect("/dashboard")
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

  const rolColors: Record<string, string> = {
    administrador: "bg-purple-100 text-purple-700 border-purple-300",
    agente: "bg-blue-100 text-blue-700 border-blue-300",
    usuario: "bg-gray-100 text-gray-700 border-gray-300",
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
                  <h1 className="text-lg font-bold leading-none">Gestión de Movilidad</h1>
                  <p className="text-xs text-muted-foreground">Sistema de traslados y radicaciones</p>
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
                    className={`mt-1 text-xs ${rolColors[perfil.rol as keyof typeof rolColors]}`}
                  >
                    {perfil.rol}
                  </Badge>
                </div>
              </div>
              <div className="h-8 w-px bg-border" />
              <BotonCerrarSesion />
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="flex gap-1 -mb-px">
            <Link
              href="/movilidad"
              className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground data-[active=true]:border-primary data-[active=true]:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            <Link
              href="/movilidad/estado"
              className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground data-[active=true]:border-primary data-[active=true]:text-foreground"
            >
              <Activity className="h-4 w-4" />
              Estado General
            </Link>

            <Link
              href="/movilidad/cuentas"
              className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground data-[active=true]:border-primary data-[active=true]:text-foreground"
            >
              <FileText className="h-4 w-4" />
              Cuentas
            </Link>

            <Link
              href="/movilidad/traslados"
              className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground data-[active=true]:border-primary data-[active=true]:text-foreground"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Traslados
              {trasladosActivos && trasladosActivos > 0 ? (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
                  {trasladosActivos}
                </Badge>
              ) : null}
            </Link>

            <Link
              href="/movilidad/radicaciones"
              className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground data-[active=true]:border-primary data-[active=true]:text-foreground"
            >
              <ArrowDownToLine className="h-4 w-4" />
              Radicaciones
              {radicacionesActivas && radicacionesActivas > 0 ? (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
                  {radicacionesActivas}
                </Badge>
              ) : null}
            </Link>

            {novedadesPendientes && novedadesPendientes > 0 ? (
              <div className="ml-auto flex items-center gap-2 px-4 py-3">
                <Badge variant="destructive" className="h-6">
                  {novedadesPendientes} novedades pendientes
                </Badge>
              </div>
            ) : null}
          </nav>
        </div>
      </header>

      {/* Contenido */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
