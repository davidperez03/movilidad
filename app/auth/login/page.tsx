"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { SessionManager } from "@/lib/session-manager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/auth/password-input"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Car, Loader2 } from "lucide-react"
import { AlertBox } from "@/components/ui/alert-box"
import { SESSION_CONFIG } from "@/lib/config/session"

function traducirErrorAuth(message: string): string {
  const traducciones: Record<string, string> = {
    "Invalid login credentials": "Correo o contraseña incorrectos",
    "Email not confirmed": "Tu cuenta aún no ha sido confirmada por un administrador",
    "Invalid Refresh Token: Refresh Token Not Found": "Tu sesión ha expirado. Inicia sesión nuevamente.",
    "User not found": "Correo o contraseña incorrectos",
    "Too many requests": "Demasiados intentos. Espera unos minutos e intenta de nuevo.",
    "Email rate limit exceeded": "Demasiados intentos. Espera unos minutos e intenta de nuevo.",
  }
  for (const [eng, esp] of Object.entries(traducciones)) {
    if (message.includes(eng)) return esp
  }
  return message
}

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [timeoutMessage, setTimeoutMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setChecking(false)
        return
      }
      if (session.user.user_metadata?.debe_cambiar_password) {
        router.replace("/auth/cambiar-password")
        return
      }
      const { data: profile } = await supabase
        .from("perfiles")
        .select("rol_global")
        .eq("id", session.user.id)
        .single()
      if (profile?.rol_global === "superadmin") {
        router.replace("/superadmin/dashboard")
        return
      }
      const { data: roles } = await supabase
        .from("usuarios_roles")
        .select("modulo_id")
        .eq("usuario_id", session.user.id)
      if (roles?.some(r => r.modulo_id === "movilidad")) {
        router.replace("/movilidad")
        return
      }
      if (roles?.some(r => r.modulo_id === "parqueadero")) {
        router.replace("/parqueadero")
        return
      }
      router.replace("/sin-acceso")
    })
  }, [router])

  useEffect(() => {
    if (searchParams?.get("timeout") === "true") {
      setTimeoutMessage(true)
      setTimeout(() => setTimeoutMessage(false), 5000)
    }
    if (searchParams?.get("message") === "password_updated") {
      setSuccessMessage("Contraseña actualizada exitosamente. Inicia sesión con tu nueva contraseña.")
      setTimeout(() => setSuccessMessage(null), 5000)
    }
  }, [searchParams])

  if (checking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      if (data.user) {
        if (data.user.user_metadata?.debe_cambiar_password) {
          router.push("/auth/cambiar-password")
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from("perfiles")
          .select("rol_global, activo, suspendido_hasta, razon_suspension")
          .eq("id", data.user.id)
          .single()

        if (profileError) {
          throw new Error("Error al verificar perfil de usuario")
        }

        if (!profile.activo) {
          await supabase.auth.signOut()
          throw new Error(
            profile.razon_suspension
              ? `Cuenta desactivada: ${profile.razon_suspension}`
              : "Tu cuenta ha sido desactivada. Contacta al administrador."
          )
        }

        if (profile.suspendido_hasta) {
          const suspendidoHasta = new Date(profile.suspendido_hasta)
          if (suspendidoHasta > new Date()) {
            await supabase.auth.signOut()
            throw new Error(
              `Cuenta suspendida hasta ${suspendidoHasta.toLocaleDateString('es-CO')}. ${profile.razon_suspension || ''}`
            )
          }
        }

        await supabase
          .from("perfiles")
          .update({ ultima_conexion: new Date().toISOString() })
          .eq("id", data.user.id)

        await SessionManager.registrarInicio(data.user.id)

        if (profile?.rol_global === "superadmin") {
          window.location.href = "/superadmin/dashboard"
          return
        }

        const { data: rolesUsuario } = await supabase
          .from("usuarios_roles")
          .select("modulo_id")
          .eq("usuario_id", data.user.id)

        const tieneMovilidad = rolesUsuario?.some(r => r.modulo_id === "movilidad")
        const tieneParqueadero = rolesUsuario?.some(r => r.modulo_id === "parqueadero")

        if (tieneMovilidad) {
          window.location.href = "/movilidad"
          return
        }

        if (tieneParqueadero) {
          window.location.href = "/parqueadero"
          return
        }

        window.location.href = "/sin-acceso"
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al iniciar sesión"
      setError(traducirErrorAuth(msg))

      try {
        const ipRes = await fetch('/api/client-info').then(r => r.json()).catch(() => ({}))
        await supabase.rpc('registrar_login_fallido', {
          p_correo: email,
          p_razon: msg,
          p_ip_address: ipRes.ip ?? null,
          p_user_agent: navigator.userAgent,
        })
      } catch { /* silencioso — no afecta UX */ }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Car className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight">
              Movilidad
            </h2>
          </div>

          {timeoutMessage && (
            <AlertBox variant="warning" title="Sesión cerrada por inactividad">
              Tu sesión se cerró después de {SESSION_CONFIG.INACTIVITY_TIMEOUT_WEB / 60000} minutos de inactividad. Por favor, inicia sesión nuevamente.
            </AlertBox>
          )}

          {successMessage && (
            <AlertBox variant="success" title="Contraseña actualizada">
              {successMessage}
            </AlertBox>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4 rounded-xl border bg-card p-8 shadow-sm">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </div>

            <div className="text-center">
              <p className="mt-4 text-sm text-muted-foreground">
                ¿Usuario externo?{" "}
                <Link href="/consulta" className="font-medium text-primary hover:underline">
                  Consulta tu trámite
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:block relative bg-gradient-to-br from-primary to-primary/80">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative flex h-full flex-col items-center justify-center p-12 text-white">
          <div className="space-y-6 text-center max-w-lg">
            <Car className="h-20 w-20 mx-auto opacity-90" />
            <h1 className="text-4xl font-bold tracking-tight">
              Sistema de Gestión de Movilidad
            </h1>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
