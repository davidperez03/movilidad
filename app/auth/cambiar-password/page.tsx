"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { SessionManager } from "@/lib/session-manager"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordRequirements, validatePassword } from "@/components/auth/password-requirements"
import { useState } from "react"
import { Loader2, ShieldAlert } from "lucide-react"

export default function CambiarPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validatePassword(password)) {
      setError("La contraseña no cumple con los requisitos mínimos")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Actualizar contraseña y quitar flag
      const { error } = await supabase.auth.updateUser({
        password,
        data: { debe_cambiar_password: false },
      })

      if (error) throw error

      // Obtener perfil para saber a dónde redirigir
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: perfil } = await supabase
          .from("perfiles")
          .select("rol_global")
          .eq("id", user.id)
          .single()

        // Registrar sesión
        await SessionManager.registrarInicio(user.id)

        // Redirigir según rol
        if (perfil?.rol_global === "superadmin") {
          window.location.href = "/superadmin/dashboard"
          return
        }

        const { data: roles } = await supabase
          .from("usuarios_roles")
          .select("modulo_id")
          .eq("usuario_id", user.id)

        if (roles?.some(r => r.modulo_id === "movilidad")) {
          window.location.href = "/movilidad"
          return
        }

        if (roles?.some(r => r.modulo_id === "parqueadero")) {
          window.location.href = "/parqueadero"
          return
        }

        window.location.href = "/sin-acceso"
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al cambiar la contraseña"
      setError(
        msg.includes("New password should be different")
          ? "La nueva contraseña debe ser diferente a la anterior"
          : msg.includes("Auth session missing")
            ? "Tu sesion ha expirado. Inicia sesion nuevamente."
            : msg
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <ShieldAlert className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">Cambiar contraseña</CardTitle>
            <CardDescription>
              Debes establecer una nueva contraseña antes de continuar. Esta es una contraseña temporal asignada por el administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <PasswordRequirements password={password} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading || !validatePassword(password)}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    "Establecer nueva contraseña"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
