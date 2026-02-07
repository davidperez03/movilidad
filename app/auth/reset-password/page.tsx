"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordRequirements, validatePassword } from "@/components/auth/password-requirements"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react"

export default function ResetPasswordPage() {
  const [newPwd, setNewPwd] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [exchanging, setExchanging] = useState(true)

  // Intercambiar código PKCE si viene en la URL (email de Supabase)
  useEffect(() => {
    const exchangeCode = async () => {
      const supabase = createClient()
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          // Limpiar URL para que no se reuse el código
          window.history.replaceState({}, "", "/auth/reset-password")
          setSessionReady(true)
          setExchanging(false)
          return
        }
      }

      // Si no hay código, verificar si ya hay sesión activa (viene de /auth/confirm)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSessionReady(true)
      }
      setExchanging(false)
    }

    exchangeCode()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validatePassword(newPwd)) {
      setError("La contraseña no cumple con los requisitos minimos")
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

  // Cargando mientras se intercambia el código
  if (exchanging) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // No hay sesión válida
  if (!sessionReady) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-2xl">Enlace invalido</CardTitle>
              <CardDescription>
                Este enlace de recuperacion ha expirado o ya fue utilizado. Solicita uno nuevo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/auth/forgot-password">Solicitar nuevo enlace</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
                <Link href="/auth/login?message=password_updated">Iniciar sesion</Link>
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
                  <Label htmlFor="newPwd">Nueva contraseña</Label>
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
                  <Label htmlFor="confirmPwd">Confirmar contraseña</Label>
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
