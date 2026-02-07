"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordRequirements, validatePassword } from "@/components/auth/password-requirements"
import Link from "next/link"
import { useState } from "react"
import { Loader2, CheckCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const [newPwd, setNewPwd] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validatePassword(newPwd)) {
      setError("La contraseña no cumple con los requisitos mínimos")
      return
    }

    if (newPwd !== confirmPwd) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPwd })

      if (error) throw error

      // Cerrar sesión para que inicie con la nueva contraseña
      await supabase.auth.signOut()
      setSuccess(true)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al actualizar la contraseña"
      setError(
        msg.includes("New password should be different")
          ? "La nueva contraseña debe ser diferente a la anterior"
          : msg.includes("Auth session missing")
            ? "Tu sesion ha expirado. Solicita un nuevo enlace de recuperacion."
            : msg
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Contraseña actualizada</CardTitle>
              <CardDescription>
                Tu contraseña ha sido actualizada exitosamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/auth/login?message=password_updated">Iniciar sesión</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
            <CardDescription>
              Ingresa tu nueva contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <Input
                    id="newPwd"
                    type="password"
                    required
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    disabled={isLoading}
                  />
                  <PasswordRequirements password={newPwd} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input
                    id="confirmPwd"
                    type="password"
                    required
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading || !validatePassword(newPwd)}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    "Actualizar contraseña"
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
