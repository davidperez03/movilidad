"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/tickets/status-badge"
import { PriorityBadge } from "@/components/tickets/priority-badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, User, Calendar, Trash2, MessageSquare, Send } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface TicketDetailsAdminProps {
  ticket: any
  agents: Array<{ id: string; nombre_completo: string | null; correo: string }>
}

export function TicketDetailsAdmin({ ticket, agents }: TicketDetailsAdminProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState(ticket.estado)
  const [assignedTo, setAssignedTo] = useState(ticket.asignado_a || "")
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>("")

  useEffect(() => {
    loadComments()
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
    }
  }

  const loadComments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("tks_comentarios")
      .select(
        `
        *,
        usuario:perfiles!tks_comentarios_usuario_id_fkey(id, nombre_completo, correo, rol)
      `,
      )
      .eq("ticket_id", ticket.id)
      .order("creado_en", { ascending: true })

    if (data) {
      setComments(data)
    }
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

  const handleUpdate = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const updateData: any = {
        estado: status,
        actualizado_en: new Date().toISOString(),
      }

      if (assignedTo && assignedTo !== "unassigned") {
        updateData.asignado_a = assignedTo
      } else if (assignedTo === "unassigned") {
        updateData.asignado_a = null
      }

      if (status === "resuelto") {
        updateData.resuelto_en = new Date().toISOString()
      } else if (status === "cerrado") {
        updateData.cerrado_en = new Date().toISOString()
      }

      const { error } = await supabase.from("tks_tickets").update(updateData).eq("id", ticket.id)

      if (error) throw error

      toast.success("Ticket actualizado", {
        description: "Los cambios se han guardado correctamente.",
        duration: 3000,
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating ticket:", error)
      toast.error("Error al actualizar", {
        description: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("tks_tickets").delete().eq("id", ticket.id)

      if (error) throw error

      toast.success("Ticket eliminado", {
        description: "El ticket ha sido eliminado permanentemente.",
        duration: 3000,
      })

      router.push("/tickets")
      router.refresh()
    } catch (error) {
      console.error("Error deleting ticket:", error)
      toast.error("Error al eliminar", {
        description: "No se pudo eliminar el ticket. Inténtalo de nuevo.",
        duration: 4000,
      })
      setIsLoading(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUserId) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("tks_comentarios").insert({
        ticket_id: ticket.id,
        usuario_id: currentUserId,
        contenido: newComment,
        es_interno: false,
      })

      if (error) throw error

      toast.success("Comentario agregado", {
        description: "Tu comentario se ha publicado correctamente.",
        duration: 3000,
      })

      setNewComment("")
      await loadComments()
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Error al comentar", {
        description: "No se pudo publicar el comentario. Inténtalo de nuevo.",
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tickets">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Panel
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{ticket.titulo}</CardTitle>
                  <CardDescription className="mt-2">Ticket ID: {ticket.id.slice(0, 8)}</CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  <StatusBadge status={ticket.estado as "nuevo" | "en_progreso" | "resuelto" | "cerrado"} />
                  <PriorityBadge priority={ticket.prioridad as "baja" | "media" | "alta" | "urgente"} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 font-semibold">Descripción</h3>
                <p className="text-muted-foreground">{ticket.descripcion}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Creado por:</span>
                  <span className="font-medium">
                    {ticket.perfil_creador?.nombre_completo || ticket.perfil_creador?.correo}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Fecha de creación:</span>
                  <span className="font-medium">{new Date(ticket.creado_en).toLocaleDateString("es-ES")}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{typeLabels[ticket.tipo as keyof typeof typeLabels]}</span>
                </div>

                {ticket.perfil_asignado && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Asignado a:</span>
                    <span className="font-medium">
                      {ticket.perfil_asignado?.nombre_completo || ticket.perfil_asignado?.correo}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gestionar Ticket</CardTitle>
              <CardDescription>Actualiza el estado, asignación o elimina el ticket</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nuevo">Nuevo</SelectItem>
                      <SelectItem value="en_progreso">En Progreso</SelectItem>
                      <SelectItem value="resuelto">Resuelto</SelectItem>
                      <SelectItem value="cerrado">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assigned">Asignar a</Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger id="assigned">
                      <SelectValue placeholder="Seleccionar agente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Sin asignar</SelectItem>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.nombre_completo || agent.correo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleUpdate} disabled={isLoading} className="flex-1 transition-all hover:shadow-md">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Actualizando...
                    </span>
                  ) : (
                    "Actualizar Ticket"
                  )}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isLoading} className="transition-all hover:shadow-md">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. El ticket será eliminado permanentemente del sistema.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>Comentarios</CardTitle>
              </div>
              <CardDescription>Conversación sobre este ticket</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <div key={comment.id}>
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(comment.usuario?.nombre_completo, comment.usuario?.correo)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              {comment.usuario?.nombre_completo || comment.usuario?.correo}
                            </span>
                            {(comment.usuario?.rol === "agente" || comment.usuario?.rol === "administrador") && (
                              <Badge variant="outline" className="text-xs">
                                {comment.usuario?.rol === "administrador" ? "Admin" : "Agente"}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.creado_en).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.contenido}</p>
                        </div>
                      </div>
                      {index < comments.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No hay comentarios aún</p>
                </div>
              )}

              <form onSubmit={handleAddComment} className="space-y-4">
                <Textarea
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !newComment.trim()} className="w-full transition-all hover:shadow-md">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Enviando...
                    </span>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Comentario
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
