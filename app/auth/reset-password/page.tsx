"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PasswordForm } from "@/components/auth/password-form"
import { BackToLogin } from "@/components/auth/back-to-login"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import type { EmailOtpType } from "@supabase/supabase-js"

export default function ResetPasswordPage() {
  const [sessionReady, setSessionReady] = useState(false)
  const [checking, setChecking] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const params = new URLSearchParams(window.location.search)
      const tokenHash = params.get("token_hash") || params.get("code")
      const type = params.get("type") as EmailOtpType | null

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        if (!error) {
          window.history.replaceState({}, "", "/auth/reset-password")
          setSessionReady(true)
          setChecking(false)
          return
        }
        setChecking(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSessionReady(true)
      }
      setChecking(false)
    }

    init()
  }, [])

  if (checking) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

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
            <CardContent className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth/forgot-password">Solicitar nuevo enlace</Link>
              </Button>
              <BackToLogin />
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
              <CardDescription>Tu contraseña ha sido actualizada exitosamente.</CardDescription>
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
        <PasswordForm
          title="Nueva contraseña"
          description="Ingresa tu nueva contraseña."
          buttonText="Actualizar contraseña"
          onSuccess={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            setSuccess(true)
          }}
        />
        <BackToLogin />
      </div>
    </div>
  )
}
