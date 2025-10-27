import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, FileText, ArrowRightLeft, ArrowDownToLine, Home } from "lucide-react"
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header con navegación */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Gestión de Movilidad</h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {perfil.nombre_completo} ({perfil.rol})
              </span>
              <BotonCerrarSesion />
            </div>
          </div>

          {/* Menú de navegación */}
          <nav className="flex gap-2 mt-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/movilidad">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/movilidad/cuentas">
                <FileText className="h-4 w-4 mr-2" />
                Cuentas
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/movilidad/traslados">
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Traslados
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/movilidad/radicaciones">
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Radicaciones
              </Link>
            </Button>
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
