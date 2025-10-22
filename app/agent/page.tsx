import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Ticket, ClipboardList, CheckCircle2, Clock } from "lucide-react"

export default async function AgentDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check if user is agent or admin
  if (profile?.role !== "agent" && profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get all tickets
  const { data: allTickets } = await supabase
    .from("tickets")
    .select(
      `
      *,
      created_by_profile:profiles!tickets_created_by_fkey(full_name, email),
      assigned_to_profile:profiles!tickets_assigned_to_fkey(full_name, email)
    `,
    )
    .order("created_at", { ascending: false })

  // Get tickets assigned to this agent
  const { data: myTickets } = await supabase
    .from("tickets")
    .select(
      `
      *,
      created_by_profile:profiles!tickets_created_by_fkey(full_name, email)
    `,
    )
    .eq("assigned_to", user.id)
    .order("created_at", { ascending: false })

  // Get unassigned tickets
  const { data: unassignedTickets } = await supabase
    .from("tickets")
    .select(
      `
      *,
      created_by_profile:profiles!tickets_created_by_fkey(full_name, email)
    `,
    )
    .is("assigned_to", null)
    .order("created_at", { ascending: false })

  // Calculate statistics
  const stats = {
    total: allTickets?.length || 0,
    assigned: myTickets?.length || 0,
    unassigned: unassignedTickets?.length || 0,
    resolved: allTickets?.filter((t) => t.status === "resolved" || t.status === "closed").length || 0,
  }

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

  const TicketCard = ({ ticket }: { ticket: any }) => (
    <Link href={`/agent/tickets/${ticket.id}`}>
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
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>{typeLabels[ticket.type as keyof typeof typeLabels]}</span>
              <span>Creado: {new Date(ticket.created_at).toLocaleDateString("es-ES")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>
                Creado por: {ticket.created_by_profile?.full_name || ticket.created_by_profile?.email || "Desconocido"}
              </span>
              {ticket.assigned_to_profile && (
                <span>Asignado a: {ticket.assigned_to_profile?.full_name || ticket.assigned_to_profile?.email}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Panel de Agente</h1>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Dashboard de Tickets</h2>
          <p className="text-muted-foreground">Gestiona y resuelve tickets de soporte</p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assigned}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sin Asignar</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unassigned}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolved}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todos los Tickets</TabsTrigger>
            <TabsTrigger value="mine">Mis Tickets</TabsTrigger>
            <TabsTrigger value="unassigned">Sin Asignar</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {allTickets && allTickets.length > 0 ? (
              allTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Ticket className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No hay tickets</h3>
                  <p className="text-sm text-muted-foreground">No se encontraron tickets en el sistema</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="mine" className="space-y-4">
            {myTickets && myTickets.length > 0 ? (
              myTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Ticket className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No tienes tickets asignados</h3>
                  <p className="text-sm text-muted-foreground">Los tickets que te asignen aparecerán aquí</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="unassigned" className="space-y-4">
            {unassignedTickets && unassignedTickets.length > 0 ? (
              unassignedTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No hay tickets sin asignar</h3>
                  <p className="text-sm text-muted-foreground">Todos los tickets han sido asignados</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
