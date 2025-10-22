"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface TicketDetailsAdminProps {
  ticket: any
  agents: Array<{ id: string; full_name: string | null; email: string }>
}

export function TicketDetailsAdmin({ ticket, agents }: TicketDetailsAdminProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState(ticket.status)
  const [assignedTo, setAssignedTo] = useState(ticket.assigned_to || "")
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
      .from("comments")
      .select(
        `
        *,
        user:profiles!comments_user_id_fkey(id, full_name, email, role)
      `,
      )
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true })

    if (data) {
      setComments(data)
    }
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

  const handleUpdate = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (assignedTo && assignedTo !== "unassigned") {
        updateData.assigned_to = assignedTo
      } else if (assignedTo === "unassigned") {
        updateData.assigned_to = null
      }

      if (status === "resolved") {
        updateData.resolved_at = new Date().toISOString()
      } else if (status === "closed") {
        updateData.closed_at = new Date().toISOString()
      }

      const { error } = await supabase.from("tickets").update(updateData).eq("id", ticket.id)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error updating ticket:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("tickets").delete().eq("id", ticket.id)

      if (error) throw error

      router.push("/admin")
      router.refresh()
    } catch (error) {
      console.error("Error deleting ticket:", error)
      setIsLoading(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUserId) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("comments").insert({
        ticket_id: ticket.id,
        user_id: currentUserId,
        content: newComment,
        is_internal: false,
      })

      if (error) throw error

      setNewComment("")
      await loadComments()
    } catch (error) {
      console.error("Error adding comment:", error)
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
            <Link href="/admin">
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
                  <CardTitle className="text-2xl">{ticket.title}</CardTitle>
                  <CardDescription className="mt-2">Ticket ID: {ticket.id.slice(0, 8)}</CardDescription>
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
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 font-semibold">Descripción</h3>
                <p className="text-muted-foreground">{ticket.description}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Creado por:</span>
                  <span className="font-medium">
                    {ticket.created_by_profile?.full_name || ticket.created_by_profile?.email}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Fecha de creación:</span>
                  <span className="font-medium">{new Date(ticket.created_at).toLocaleDateString("es-ES")}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{typeLabels[ticket.type as keyof typeof typeLabels]}</span>
                </div>

                {ticket.assigned_to_profile && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Asignado a:</span>
                    <span className="font-medium">
                      {ticket.assigned_to_profile?.full_name || ticket.assigned_to_profile?.email}
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
                      <SelectItem value="new">Nuevo</SelectItem>
                      <SelectItem value="in_progress">En Progreso</SelectItem>
                      <SelectItem value="resolved">Resuelto</SelectItem>
                      <SelectItem value="closed">Cerrado</SelectItem>
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
                          {agent.full_name || agent.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleUpdate} disabled={isLoading} className="flex-1">
                  {isLoading ? "Actualizando..." : "Actualizar Ticket"}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isLoading}>
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
                            {getInitials(comment.user?.full_name, comment.user?.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              {comment.user?.full_name || comment.user?.email}
                            </span>
                            {(comment.user?.role === "agent" || comment.user?.role === "admin") && (
                              <Badge variant="outline" className="text-xs">
                                {comment.user?.role === "admin" ? "Admin" : "Agente"}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
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
                <Button type="submit" disabled={isLoading || !newComment.trim()} className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  {isLoading ? "Enviando..." : "Enviar Comentario"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
