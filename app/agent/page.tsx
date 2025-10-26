import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BotonCerrarSesion } from "@/components/logout-button"
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

  // Obtener perfil del usuario
  const { data: profile } = await supabase.from("perfiles").select("*").eq("id", user.id).single()

  // Verificar si el usuario es agente o administrador
  if (profile?.rol !== "agente" && profile?.rol !== "administrador") {
    redirect("/dashboard")
  }

  // Obtener todos los tickets
  const { data: allTickets } = await supabase
    .from("tks_tickets")
    .select(
      `
      *,
      perfil_creador:perfiles!tickets_creado_por_fkey(nombre_completo, correo),
      perfil_asignado:perfiles!tickets_asignado_a_fkey(nombre_completo, correo)
    `,
    )
    .order("creado_en", { ascending: false })

  // Obtener tickets asignados a este agente
  const { data: myTickets } = await supabase
    .from("tks_tickets")
    .select(
      `
      *,
      perfil_creador:perfiles!tickets_creado_por_fkey(nombre_completo, correo)
    `,
    )
    .eq("asignado_a", user.id)
    .order("creado_en", { ascending: false })

  // Obtener tickets sin asignar
  const { data: unassignedTickets } = await supabase
    .from("tks_tickets")
    .select(
      `
      *,
      perfil_creador:perfiles!tickets_creado_por_fkey(nombre_completo, correo)
    `,
    )
    .is("asignado_a", null)
    .order("creado_en", { ascending: false })

  // Calcular estadísticas
  const stats = {
    total: allTickets?.length || 0,
    assigned: myTickets?.length || 0,
    unassigned: unassignedTickets?.length || 0,
    resolved: allTickets?.filter((t) => t.estado === "resuelto" || t.estado === "cerrado").length || 0,
  }

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

  const TicketCard = ({ ticket }: { ticket: any }) => (
    <Link href={`/agent/tickets/${ticket.id}`}>
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
                Creado por: {ticket.perfil_creador?.nombre_completo || ticket.perfil_creador?.correo || "Desconocido"}
              </span>
              {ticket.perfil_asignado && (
                <span>Asignado a: {ticket.perfil_asignado?.nombre_completo || ticket.perfil_asignado?.correo}</span>
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
