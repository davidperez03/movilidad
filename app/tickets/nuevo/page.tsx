"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NuevoTicketPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    tipo: "soporte_tecnico",
    prioridad: "media",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("No autenticado")
      }

      const { error: insertError } = await supabase.from("tks_tickets").insert({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        prioridad: formData.prioridad,
        creado_por: user.id,
        estado: "nuevo",
      })

      if (insertError) throw insertError

      toast.success("¡Ticket creado exitosamente!", {
        description: "Tu ticket ha sido registrado y será atendido pronto.",
        duration: 4000,
      })

      router.push("/tickets")
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear el ticket"
      setError(errorMessage)
      toast.error("Error al crear el ticket", {
        description: errorMessage,
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tickets">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Crear Nuevo Ticket</CardTitle>
            <CardDescription>Completa el formulario para crear una nueva solicitud</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Título <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Describe brevemente el problema o solicitud"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">Máximo 100 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Descripción <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Proporciona detalles adicionales sobre tu solicitud"
                  required
                  rows={6}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">Sé lo más específico posible para recibir una mejor ayuda</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger id="type" className="transition-all focus:ring-2 focus:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soporte_tecnico">
                        <div className="flex flex-col">
                          <span className="font-medium">Soporte Técnico</span>
                          <span className="text-xs text-muted-foreground">Problemas técnicos o errores</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="solicitud_interna">
                        <div className="flex flex-col">
                          <span className="font-medium">Solicitud Interna</span>
                          <span className="text-xs text-muted-foreground">Peticiones del equipo</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="tarea_general">
                        <div className="flex flex-col">
                          <span className="font-medium">Tarea General</span>
                          <span className="text-xs text-muted-foreground">Otras tareas o consultas</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select
                    value={formData.prioridad}
                    onValueChange={(value) => setFormData({ ...formData, prioridad: value })}
                  >
                    <SelectTrigger id="priority" className="transition-all focus:ring-2 focus:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-gray-500" />
                          <span>Baja - Puede esperar</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="media">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          <span>Media - Atención normal</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="alta">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-orange-500" />
                          <span>Alta - Requiere pronta atención</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="urgente">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          <span>Urgente - Crítico</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Selecciona según la urgencia del problema</p>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <p className="text-sm font-medium text-destructive">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1 transition-all hover:shadow-md">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Creando...
                    </span>
                  ) : (
                    "Crear Ticket"
                  )}
                </Button>
                <Button type="button" variant="outline" asChild className="transition-all hover:shadow-md">
                  <Link href="/tickets">Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
