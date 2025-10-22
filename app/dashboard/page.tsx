import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Ticket } from "lucide-react"

export default async function UserDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's tickets
  const { data: tickets } = await supabase
    .from("tickets")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })

  const statusColors = {
    new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    in_progress: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    resolved: "bg-green-500/10 text-green-500 border-green-500/20",
    closed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  }

  const priorityColors = {
    low: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    urgent: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  const typeLabels = {
    technical_support: "Soporte Técnico",
    internal_request: "Solicitud Interna",
    general_task: "Tarea General",
  }

  const statusLabels = {
    new: "Nuevo",
    in_progress: "En Progreso",
    resolved: "Resuelto",
    closed: "Cerrado",
  }

  const priorityLabels = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
    urgent: "Urgente",
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Sistema de Tickets</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{profile?.full_name || profile?.email}</span>
            <form action="/auth/logout" method="post">
              <Button variant="outline" size="sm">
                Cerrar Sesión
              </Button>
            </form>
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
                        <CardTitle className="text-lg">{ticket.title}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">{ticket.description}</CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                          {statusLabels[ticket.status as keyof typeof statusLabels]}
                        </Badge>
                        <Badge className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                          {priorityLabels[ticket.priority as keyof typeof priorityLabels]}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{typeLabels[ticket.type as keyof typeof typeLabels]}</span>
                      <span>Creado: {new Date(ticket.created_at).toLocaleDateString("es-ES")}</span>
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
