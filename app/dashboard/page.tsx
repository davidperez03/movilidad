import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BotonCerrarSesion } from "@/components/logout-button"
import Link from "next/link"
import { Plus, Ticket, Car } from "lucide-react"

export default async function UserDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase.from("perfiles").select("*").eq("id", user.id).single()

  // Obtener tickets del usuario
  const { data: tickets } = await supabase
    .from("tks_tickets")
    .select("*")
    .eq("creado_por", user.id)
    .order("creado_en", { ascending: false })

  const statusColors = {
    nuevo: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    en_progreso: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    resuelto: "bg-green-500/10 text-green-500 border-green-500/20",
    cerrado: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  }

  const priorityColors = {
    baja: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    media: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    alta: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    urgente: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  const typeLabels = {
    soporte_tecnico: "Soporte Técnico",
    solicitud_interna: "Solicitud Interna",
    tarea_general: "Tarea General",
  }

  const statusLabels = {
    nuevo: "Nuevo",
    en_progreso: "En Progreso",
    resuelto: "Resuelto",
    cerrado: "Cerrado",
  }

  const priorityLabels = {
    baja: "Baja",
    media: "Media",
    alta: "Alta",
    urgente: "Urgente",
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Car className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Movilidad</h1>
            </div>
            <nav className="flex items-center gap-2">
              {profile && ["agente", "administrador"].includes(profile.rol) && (
                <Button asChild variant="default" size="sm">
                  <Link href="/movilidad">
                    <Car className="mr-2 h-4 w-4" />
                    Movilidad
                  </Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <Ticket className="mr-2 h-4 w-4" />
                  Tickets
                </Link>
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{profile?.nombre_completo || profile?.correo}</span>
            <BotonCerrarSesion />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Mis Tickets</h2>
            <p className="text-muted-foreground">Gestiona tus solicitudes y tareas</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/new-ticket">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Ticket
            </Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {tickets && tickets.length > 0 ? (
            tickets.map((ticket) => (
              <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{ticket.titulo}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">{ticket.descripcion}</CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={statusColors[ticket.estado as keyof typeof statusColors]}>
                          {statusLabels[ticket.estado as keyof typeof statusLabels]}
                        </Badge>
                        <Badge className={priorityColors[ticket.prioridad as keyof typeof priorityColors]}>
                          {priorityLabels[ticket.prioridad as keyof typeof priorityLabels]}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{typeLabels[ticket.tipo as keyof typeof typeLabels]}</span>
                      <span>Creado: {new Date(ticket.creado_en).toLocaleDateString("es-ES")}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Ticket className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No tienes tickets</h3>
                <p className="mb-4 text-sm text-muted-foreground">Crea tu primer ticket para comenzar</p>
                <Button asChild>
                  <Link href="/dashboard/new-ticket">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Ticket
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
