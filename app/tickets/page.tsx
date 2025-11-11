import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BotonCerrarSesion } from "@/components/logout-button"
import Link from "next/link"
import { Plus, Ticket, Car, Users, ClipboardList, TrendingUp, Shield, CheckCircle2, Clock } from "lucide-react"
import { StatusBadge } from "@/components/tickets/status-badge"
import { PriorityBadge } from "@/components/tickets/priority-badge"
import { formatDateTime } from "@/lib/utils"

export default async function TicketsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase.from("perfiles").select("rol_global").eq("id", user.id).single()

  // Verificar si es superadmin
  const isSuperAdmin = profile?.rol_global === "superadmin"

  // Obtener rol en módulo tickets
  const { data: rolTicketsData } = await supabase
    .from("usuarios_roles")
    .select(`
      roles_modulo (
        codigo,
        permisos
      )
    `)
    .eq("usuario_id", user.id)
    .eq("modulo_id", "tickets")
    .single()

  const rolTickets = rolTicketsData?.roles_modulo as any
  const codigoRol = isSuperAdmin ? "tks_administrador" : rolTickets?.codigo || "tks_usuario"
  const permisos = isSuperAdmin
    ? { ver_todos: true, asignar: true, eliminar: true }
    : (rolTickets?.permisos || {})

  // Obtener datos según el rol
  const isAdmin = isSuperAdmin || codigoRol === "tks_administrador"
  const isAgent = isSuperAdmin || codigoRol === "tks_agente" || isAdmin
  const canViewAll = isSuperAdmin || permisos.ver_todos === true

  // Para usuarios normales: solo sus tickets
  const { data: myTickets } = await supabase
    .from("tks_tickets")
    .select("*")
    .eq("creado_por", user.id)
    .order("creado_en", { ascending: false })

  // Para agentes y admins: todos los tickets
  const { data: allTickets } = isAgent
    ? await supabase
        .from("tks_tickets")
        .select(
          `
          *,
          perfil_creador:perfiles!tks_tickets_creado_por_fkey(nombre_completo, correo),
          perfil_asignado:perfiles!tks_tickets_asignado_a_fkey(nombre_completo, correo)
        `,
        )
        .order("creado_en", { ascending: false })
    : { data: null }

  // Para agentes: tickets asignados
  const { data: assignedTickets } = isAgent
    ? await supabase
        .from("tks_tickets")
        .select(
          `
          *,
          perfil_creador:perfiles!tks_tickets_creado_por_fkey(nombre_completo, correo)
        `,
        )
        .eq("asignado_a", user.id)
        .order("creado_en", { ascending: false })
    : { data: null }

  // Para agentes: tickets sin asignar
  const { data: unassignedTickets } = isAgent
    ? await supabase
        .from("tks_tickets")
        .select(
          `
          *,
          perfil_creador:perfiles!tks_tickets_creado_por_fkey(nombre_completo, correo)
        `,
        )
        .is("asignado_a", null)
        .order("creado_en", { ascending: false })
    : { data: null }

  // Para admins: todos los usuarios con sus roles en tickets
  const { data: allUsers } = isAdmin
    ? await supabase.from("perfiles").select("id, correo, nombre_completo, creado_en, rol_global").order("creado_en", { ascending: false })
    : { data: null }

  // Obtener agentes (usuarios con rol tks_agente o tks_administrador)
  const { data: agentsData } = isAdmin
    ? await supabase
        .from("usuarios_roles")
        .select(`
          usuario_id,
          perfiles (
            id,
            correo,
            nombre_completo
          ),
          roles_modulo (
            codigo
          )
        `)
        .eq("modulo_id", "tickets")
        .in("roles_modulo.codigo", ["tks_agente", "tks_administrador"])
    : { data: null }

  const agents = isAdmin
    ? (agentsData?.map((a: any) => ({
        id: a.perfiles.id,
        correo: a.perfiles.correo,
        nombre_completo: a.perfiles.nombre_completo,
      })) || [])
    : []

  // Calcular estadísticas
  const stats = isAdmin
    ? {
        totalTickets: allTickets?.length || 0,
        totalUsers: allUsers?.length || 0,
        newTickets: allTickets?.filter((t) => t.estado === "nuevo").length || 0,
        inProgress: allTickets?.filter((t) => t.estado === "en_progreso").length || 0,
        resolved: allTickets?.filter((t) => t.estado === "resuelto").length || 0,
        closed: allTickets?.filter((t) => t.estado === "cerrado").length || 0,
        unassigned: allTickets?.filter((t) => !t.asignado_a).length || 0,
        urgent: allTickets?.filter((t) => t.prioridad === "urgente").length || 0,
      }
    : isAgent
      ? {
          total: allTickets?.length || 0,
          assigned: assignedTickets?.length || 0,
          unassigned: unassignedTickets?.length || 0,
          resolved: allTickets?.filter((t) => t.estado === "resuelto" || t.estado === "cerrado").length || 0,
        }
      : {}
  const agentWorkload = isAdmin
    ? agents.map((agent) => ({
        ...agent,
        assignedTickets: allTickets?.filter((t) => t.asignado_a === agent.id).length || 0,
        resolvedTickets:
          allTickets?.filter((t) => t.asignado_a === agent.id && (t.estado === "resuelto" || t.estado === "cerrado"))
            .length || 0,
      }))
    : []

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

  const TicketCard = ({ ticket }: { ticket: any }) => (
    <Link href={`/tickets/${ticket.id}`}>
      <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-0.5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">{ticket.titulo}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2">{ticket.descripcion}</CardDescription>
            </div>
            <div className="flex flex-col gap-2">
              <StatusBadge status={ticket.estado as "nuevo" | "en_progreso" | "resuelto" | "cerrado"} />
              <PriorityBadge priority={ticket.prioridad as "baja" | "media" | "alta" | "urgente"} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>{typeLabels[ticket.tipo as keyof typeof typeLabels]}</span>
              <span>Creado: {formatDateTime(ticket.creado_en)}</span>
            </div>
            {isAgent && (
              <div className="flex items-center justify-between">
                <span>
                  Creado por: {ticket.perfil_creador?.nombre_completo || ticket.perfil_creador?.correo || "Desconocido"}
                </span>
                {ticket.perfil_asignado ? (
                  <span>Asignado a: {ticket.perfil_asignado?.nombre_completo || ticket.perfil_asignado?.correo}</span>
                ) : (
                  <span className="text-orange-500 font-medium">Sin asignar</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  // VISTA DE ADMINISTRADOR
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="border-b bg-background">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Panel de Administración</h1>
              </div>
              <nav className="flex items-center gap-2">
                <Button asChild variant="default" size="sm">
                  <Link href="/movilidad">
                    <Car className="mr-2 h-4 w-4" />
                    Movilidad
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/tickets">
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
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Dashboard Administrativo</h2>
            <p className="text-muted-foreground">Gestión completa del sistema de tickets</p>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <Card className="transition-all duration-300 hover:shadow-md hover:border-blue-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                <ClipboardList className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTickets}</div>
                <p className="text-xs text-muted-foreground">{stats.unassigned} sin asignar</p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-md hover:border-purple-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
                <Users className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">{agents.length} agentes</p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-md hover:border-yellow-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
                <TrendingUp className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground">{stats.newTickets} nuevos</p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-md hover:border-red-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
                <Ticket className="h-4 w-4 text-red-500" />
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

            <TabsContent value="users" className="space-y-4">
              {allUsers && allUsers.length > 0 ? (
                allUsers.map((userItem) => (
                  <Link key={userItem.id} href={`/tickets/usuarios/${userItem.id}`}>
                    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-0.5">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">{userItem.nombre_completo || "Sin nombre"}</CardTitle>
                            <CardDescription>{userItem.correo}</CardDescription>
                          </div>
                          <Badge className={roleColors[userItem.rol_global as keyof typeof roleColors]}>
                            {roleLabels[userItem.rol_global as keyof typeof roleLabels] || 'Usuario'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          Registrado: {formatDateTime(userItem.creado_en)}
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
                  <Card key={agent.id} className="transition-all duration-300 hover:shadow-md hover:border-primary/20">
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
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-sm text-muted-foreground">Tickets Asignados</p>
                          <p className="text-2xl font-bold text-blue-600">{agent.assignedTickets}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-sm text-muted-foreground">Tickets Resueltos</p>
                          <p className="text-2xl font-bold text-green-600">{agent.resolvedTickets}</p>
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

  // VISTA DE AGENTE
  if (isAgent) {
    return (
      <div className="min-h-screen bg-muted/30">
        <header className="border-b bg-background">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Ticket className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Panel de Agente</h1>
              </div>
              <nav className="flex items-center gap-2">
                <Button asChild variant="default" size="sm">
                  <Link href="/movilidad">
                    <Car className="mr-2 h-4 w-4" />
                    Movilidad
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/tickets">
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
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Dashboard de Tickets</h2>
            <p className="text-muted-foreground">Gestiona y resuelve tickets de soporte</p>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <Card className="transition-all duration-300 hover:shadow-md hover:border-blue-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
                <ClipboardList className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-md hover:border-purple-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mis Tickets</CardTitle>
                <Ticket className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.assigned}</div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-md hover:border-orange-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sin Asignar</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.unassigned}</div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-md hover:border-green-500/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
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
              {assignedTickets && assignedTickets.length > 0 ? (
                assignedTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
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

  // VISTA DE USUARIO NORMAL
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Ticket className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Tickets</h1>
            </div>
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
            <Link href="/tickets/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Ticket
            </Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {myTickets && myTickets.length > 0 ? (
            myTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Ticket className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No tienes tickets</h3>
                <p className="mb-4 text-sm text-muted-foreground">Crea tu primer ticket para comenzar</p>
                <Button asChild>
                  <Link href="/tickets/nuevo">
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
