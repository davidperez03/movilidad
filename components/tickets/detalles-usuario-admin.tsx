"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, Calendar, Ticket } from "lucide-react"
import Link from "next/link"

interface UserDetailsAdminProps {
  userProfile: any
  tickets: any[]
}

export function UserDetailsAdmin({ userProfile, tickets }: UserDetailsAdminProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState(userProfile.rol)

  const roleColors = {
    usuario: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    agente: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    administrador: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  }

  const roleLabels = {
    usuario: "Usuario",
    agente: "Agente",
    administrador: "Administrador",
  }

  const statusLabels = {
    nuevo: "Nuevo",
    en_progreso: "En Progreso",
    resuelto: "Resuelto",
    cerrado: "Cerrado",
  }

  const handleUpdateRole = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("perfiles")
        .update({
          rol: role,
          actualizado_en: new Date().toISOString(),
        })
        .eq("id", userProfile.id)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error updating user role:", error)
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
                  <CardTitle className="text-2xl">{userProfile.nombre_completo || "Sin nombre"}</CardTitle>
                  <CardDescription className="mt-2">Usuario ID: {userProfile.id.slice(0, 8)}</CardDescription>
                </div>
                <Badge className={roleColors[userProfile.rol as keyof typeof roleColors]}>
                  {roleLabels[userProfile.rol as keyof typeof roleLabels]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{userProfile.correo}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Registrado:</span>
                  <span className="font-medium">{new Date(userProfile.creado_en).toLocaleDateString("es-ES")}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Tickets creados:</span>
                  <span className="font-medium">{tickets.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gestionar Usuario</CardTitle>
              <CardDescription>Actualiza el rol del usuario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuario">Usuario</SelectItem>
                    <SelectItem value="agente">Agente</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleUpdateRole} disabled={isLoading} className="w-full">
                {isLoading ? "Actualizando..." : "Actualizar Rol"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tickets del Usuario</CardTitle>
              <CardDescription>Historial de tickets creados por este usuario</CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length > 0 ? (
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                      <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                        <div className="flex-1">
                          <p className="font-medium">{ticket.titulo}</p>
                          <p className="text-sm text-muted-foreground">
                            {statusLabels[ticket.estado as keyof typeof statusLabels]} •{" "}
                            {new Date(ticket.creado_en).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">Este usuario no ha creado tickets</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
