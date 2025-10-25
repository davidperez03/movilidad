import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BotonCerrarSesion } from "@/components/logout-button"
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

  // Obtener perfil de usuario
  const { data: profile } = await supabase.from("perfiles").select("*").eq("id", user.id).single()

  // Verificar si el usuario es administrador
  if (profile?.rol !== "administrador") {
    redirect("/dashboard")
  }

  // Obtener todos los tickets
  const { data: allTickets } = await supabase
    .from("tickets")
    .select(
      `
      *,
      perfil_creador:perfiles!tickets_creado_por_fkey(nombre_completo, correo),
      perfil_asignado:perfiles!tickets_asignado_a_fkey(nombre_completo, correo)
    `,
    )
    .order("creado_en", { ascending: false })

  // Obtener todos los usuarios
  const { data: allUsers } = await supabase.from("perfiles").select("*").order("creado_en", { ascending: false })

  // Calcular estadísticas
  const stats = {
    totalTickets: allTickets?.length || 0,
    totalUsers: allUsers?.length || 0,
    newTickets: allTickets?.filter((t) => t.estado === "nuevo").length || 0,
    inProgress: allTickets?.filter((t) => t.estado === "en_progreso").length || 0,
    resolved: allTickets?.filter((t) => t.estado === "resuelto").length || 0,
    closed: allTickets?.filter((t) => t.estado === "cerrado").length || 0,
    unassigned: allTickets?.filter((t) => !t.asignado_a).length || 0,
    urgent: allTickets?.filter((t) => t.prioridad === "urgente").length || 0,
  }

  // Obtener carga de trabajo de agentes
  const agents = allUsers?.filter((u) => u.rol === "agente" || u.rol === "administrador") || []
  const agentWorkload = agents.map((agent) => ({
    ...agent,
    assignedTickets: allTickets?.filter((t) => t.asignado_a === agent.id).length || 0,
    resolvedTickets:
      allTickets?.filter((t) => t.asignado_a === agent.id && (t.estado === "resuelto" || t.estado === "cerrado"))
        .length || 0,
  }))

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

  const roleColors = {
    usuario: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    agente: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    administrador: "bg-purple-500/10 text-purple-500 border-purple-500/20",
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

  const roleLabels = {
    usuario: "Usuario",
    agente: "Agente",
    administrador: "Administrador",
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
            <span className="text-sm text-muted-foreground">{profile?.nombre_completo || profile?.correo}</span>
            <BotonCerrarSesion />
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
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>{typeLabels[ticket.tipo as keyof typeof typeLabels]}</span>
                          <span>Creado: {new Date(ticket.creado_en).toLocaleDateString("es-ES")}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>
                            Creado por:{" "}
                            {ticket.perfil_creador?.nombre_completo || ticket.perfil_creador?.correo || "Desconocido"}
                          </span>
                          {ticket.perfil_asignado ? (
                            <span>
                              Asignado a: {ticket.perfil_asignado?.nombre_completo || ticket.perfil_asignado?.correo}
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
                          <CardTitle className="text-lg">{user.nombre_completo || "Sin nombre"}</CardTitle>
                          <CardDescription>{user.correo}</CardDescription>
                        </div>
                        <Badge className={roleColors[user.rol as keyof typeof roleColors]}>
                          {roleLabels[user.rol as keyof typeof roleLabels]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        Registrado: {new Date(user.creado_en).toLocaleDateString("es-ES")}
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
                        <CardTitle className="text-lg">{agent.nombre_completo || "Sin nombre"}</CardTitle>
                        <CardDescription>{agent.correo}</CardDescription>
                      </div>
                      <Badge className={roleColors[agent.rol as keyof typeof roleColors]}>
                        {roleLabels[agent.rol as keyof typeof roleLabels]}
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
