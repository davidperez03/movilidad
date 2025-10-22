import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Ticket, Users, ClipboardList, TrendingUp, Shield } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check if user is admin
  if (profile?.role !== "admin") {
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

  // Get all users
  const { data: allUsers } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  // Calculate statistics
  const stats = {
    totalTickets: allTickets?.length || 0,
    totalUsers: allUsers?.length || 0,
    newTickets: allTickets?.filter((t) => t.status === "new").length || 0,
    inProgress: allTickets?.filter((t) => t.status === "in_progress").length || 0,
    resolved: allTickets?.filter((t) => t.status === "resolved").length || 0,
    closed: allTickets?.filter((t) => t.status === "closed").length || 0,
    unassigned: allTickets?.filter((t) => !t.assigned_to).length || 0,
    urgent: allTickets?.filter((t) => t.priority === "urgent").length || 0,
  }

  // Get agent workload
  const agents = allUsers?.filter((u) => u.role === "agent" || u.role === "admin") || []
  const agentWorkload = agents.map((agent) => ({
    ...agent,
    assignedTickets: allTickets?.filter((t) => t.assigned_to === agent.id).length || 0,
    resolvedTickets:
      allTickets?.filter((t) => t.assigned_to === agent.id && (t.status === "resolved" || t.status === "closed"))
        .length || 0,
  }))

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

  const roleColors = {
    user: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    agent: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    admin: "bg-purple-500/10 text-purple-500 border-purple-500/20",
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

  const roleLabels = {
    user: "Usuario",
    agent: "Agente",
    admin: "Administrador",
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Panel de Administración</h1>
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
          <h2 className="text-3xl font-bold">Dashboard Administrativo</h2>
          <p className="text-muted-foreground">Gestión completa del sistema de tickets</p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTickets}</div>
              <p className="text-xs text-muted-foreground">{stats.unassigned} sin asignar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">{agents.length} agentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">{stats.newTickets} nuevos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.urgent}</div>
              <p className="text-xs text-muted-foreground">Requieren atención inmediata</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tickets" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="agents">Agentes</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-4">
            {allTickets && allTickets.length > 0 ? (
              allTickets.map((ticket) => (
                <Link key={ticket.id} href={`/admin/tickets/${ticket.id}`}>
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
                            Creado por:{" "}
                            {ticket.created_by_profile?.full_name || ticket.created_by_profile?.email || "Desconocido"}
                          </span>
                          {ticket.assigned_to_profile ? (
                            <span>
                              Asignado a: {ticket.assigned_to_profile?.full_name || ticket.assigned_to_profile?.email}
                            </span>
                          ) : (
                            <span className="text-orange-500">Sin asignar</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
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

          <TabsContent value="users" className="space-y-4">
            {allUsers && allUsers.length > 0 ? (
              allUsers.map((user) => (
                <Link key={user.id} href={`/admin/users/${user.id}`}>
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{user.full_name || "Sin nombre"}</CardTitle>
                          <CardDescription>{user.email}</CardDescription>
                        </div>
                        <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                          {roleLabels[user.role as keyof typeof roleLabels]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        Registrado: {new Date(user.created_at).toLocaleDateString("es-ES")}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No hay usuarios</h3>
                  <p className="text-sm text-muted-foreground">No se encontraron usuarios en el sistema</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            {agentWorkload.length > 0 ? (
              agentWorkload.map((agent) => (
                <Card key={agent.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{agent.full_name || "Sin nombre"}</CardTitle>
                        <CardDescription>{agent.email}</CardDescription>
                      </div>
                      <Badge className={roleColors[agent.role as keyof typeof roleColors]}>
                        {roleLabels[agent.role as keyof typeof roleLabels]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Tickets Asignados</p>
                        <p className="text-2xl font-bold">{agent.assignedTickets}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tickets Resueltos</p>
                        <p className="text-2xl font-bold">{agent.resolvedTickets}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No hay agentes</h3>
                  <p className="text-sm text-muted-foreground">No se encontraron agentes en el sistema</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
