import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket, Users, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Sistema de Tickets Interno</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Gestiona soporte técnico, solicitudes internas y tareas generales
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/sign-up">Registrarse</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <Ticket className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>Crea y gestiona tus tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Crear tickets de soporte</li>
                <li>• Seguimiento en tiempo real</li>
                <li>• Comentarios y actualizaciones</li>
                <li>• Historial completo</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Agentes</CardTitle>
              <CardDescription>Resuelve tickets eficientemente</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Ver todos los tickets</li>
                <li>• Asignación automática</li>
                <li>• Cambiar estados</li>
                <li>• Estadísticas en tiempo real</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Administradores</CardTitle>
              <CardDescription>Control total del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Gestión de usuarios</li>
                <li>• Asignación de roles</li>
                <li>• Estadísticas avanzadas</li>
                <li>• Control completo</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
