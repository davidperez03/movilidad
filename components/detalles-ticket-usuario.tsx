"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, User, Calendar, MessageSquare, Send } from "lucide-react"
import Link from "next/link"

interface TicketDetailsUserProps {
  ticket: any
  comments: any[]
  currentUserId: string
}

export function TicketDetailsUser({ ticket, comments, currentUserId }: TicketDetailsUserProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [newComment, setNewComment] = useState("")

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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

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

      setNewComment("")
      router.refresh()
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (nombre: string | null, correo: string) => {
    if (nombre) {
      return nombre
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return correo.slice(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tickets">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Mis Tickets
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
                  <Badge className={statusColors[ticket.estado as keyof typeof statusColors]}>
                    {statusLabels[ticket.estado as keyof typeof statusLabels]}
                  </Badge>
                  <Badge className={priorityColors[ticket.prioridad as keyof typeof priorityColors]}>
                    {priorityLabels[ticket.prioridad as keyof typeof priorityLabels]}
                  </Badge>
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
                  <p className="text-xs text-muted-foreground">Sé el primero en comentar</p>
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
