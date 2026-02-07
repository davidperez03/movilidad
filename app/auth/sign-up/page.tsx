"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

function traducirErrorAuth(message: string): string {
  const traducciones: Record<string, string> = {
    "A user with this email address has already been registered": "No se pudo completar el registro. Intenta de nuevo o inicia sesion si ya tienes cuenta.",
    "User already registered": "No se pudo completar el registro. Intenta de nuevo o inicia sesion si ya tienes cuenta.",
    "Too many requests": "Demasiados intentos. Espera unos minutos e intenta de nuevo.",
    "Email rate limit exceeded": "Demasiados intentos. Espera unos minutos e intenta de nuevo.",
    "Signup requires a valid password": "Error al procesar la solicitud. Intenta de nuevo.",
  }
  for (const [eng, esp] of Object.entries(traducciones)) {
    if (message.includes(eng)) return esp
  }
  return message
}

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (fullName.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres")
      setIsLoading(false)
      return
    }

    try {
      // Generar password aleatorio (el usuario nunca lo usará, el admin genera uno al aprobar)
      const randomPassword = crypto.randomUUID() + "A1!"

      const { data, error } = await supabase.auth.signUp({
        email,
        password: randomPassword,
        options: {
          data: {
            nombre_completo: fullName,
            rol_global: "usuario",
            pendiente_aprobacion: true,
          },
        },
      })

      if (error) throw error

      // Detectar email duplicado (Supabase no lanza error, retorna user con identities vacío)
      // No revelamos si el email existe o no (seguridad: prevenir enumeración de emails)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        await supabase.auth.signOut()
        router.push("/auth/sign-up-success")
        return
      }

      // Cerrar sesión inmediatamente (el usuario no debe quedar logueado)
      await supabase.auth.signOut()

      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al registrarse"
      setError(traducirErrorAuth(msg))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Solicitar Cuenta</CardTitle>
            <CardDescription>
              Completa tus datos para solicitar acceso al sistema. Un administrador revisará tu solicitud.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Nombre Completo *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Juan Pérez"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando solicitud...
                    </>
                  ) : (
                    "Solicitar Cuenta"
                  )}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/auth/login" className="underline underline-offset-4">
                  Inicia sesión
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
