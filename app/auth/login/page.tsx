"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { SessionManager } from "@/lib/session-manager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Car, Loader2 } from "lucide-react"
import { AlertBox } from "@/components/ui/alert-box"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [timeoutMessage, setTimeoutMessage] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Detectar si viene de timeout
  useEffect(() => {
    if (searchParams?.get("timeout") === "true") {
      setTimeoutMessage(true)
      // Ocultar mensaje después de 5 segundos
      setTimeout(() => setTimeoutMessage(false), 5000)
    }
  }, [searchParams])

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

      // Verificar estado del usuario
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from("perfiles")
          .select("rol_global, activo, suspendido_hasta, razon_suspension")
          .eq("id", data.user.id)
          .single()

        if (profileError) {
          throw new Error("Error al verificar perfil de usuario")
        }

        // Verificar si el usuario está activo
        if (!profile.activo) {
          // Cerrar sesión inmediatamente
          await supabase.auth.signOut()
          throw new Error(
            profile.razon_suspension
              ? `Cuenta desactivada: ${profile.razon_suspension}`
              : "Tu cuenta ha sido desactivada. Contacta al administrador."
          )
        }

        // Verificar si está suspendido temporalmente
        if (profile.suspendido_hasta) {
          const suspendidoHasta = new Date(profile.suspendido_hasta)
          if (suspendidoHasta > new Date()) {
            await supabase.auth.signOut()
            throw new Error(
              `Cuenta suspendida hasta ${suspendidoHasta.toLocaleDateString('es-CO')}. ${profile.razon_suspension || ''}`
            )
          }
        }

        // Actualizar última conexión
        await supabase
          .from("perfiles")
          .update({ ultima_conexion: new Date().toISOString() })
          .eq("id", data.user.id)

        // Registrar inicio de sesión en BD - ESPERAR a que se complete
        const sessionId = await SessionManager.registrarInicio(data.user.id)
        if (!sessionId) {
          throw new Error("No se pudo registrar la sesión. Intenta nuevamente.")
        }

        // Si es superadmin, redirigir al dashboard
        if (profile?.rol_global === "superadmin") {
          window.location.href = "/superadmin/dashboard"
          return
        }

        // Verificar si tiene acceso a movilidad
        const { data: rolMovilidad } = await supabase
          .from("usuarios_roles")
          .select("id")
          .eq("usuario_id", data.user.id)
          .eq("modulo_id", "movilidad")
          .single()

        if (rolMovilidad) {
          window.location.href = "/movilidad"
          return
        }

        // Si no tiene acceso a ningún módulo, redirigir a sin-acceso
        window.location.href = "/sin-acceso"
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left side - Login Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Car className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight">
              Movilidad
            </h2>
          </div>

          {/* Mensaje de timeout */}
          {timeoutMessage && (
            <AlertBox variant="warning" title="Sesión cerrada por inactividad">
              Tu sesión se cerró después de 10 minutos de inactividad. Por favor, inicia sesión nuevamente.
            </AlertBox>
          )}

          {/* Login Form */}
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
                <Input
                  id="password"
                  type="password"
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

      {/* Right side - Branding */}
      <div className="hidden lg:block relative bg-gradient-to-br from-primary to-primary/80">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative flex h-full flex-col items-center justify-center p-12 text-white">
          <div className="space-y-6 text-center max-w-lg">
            <Car className="h-20 w-20 mx-auto opacity-90" />
            <h1 className="text-4xl font-bold tracking-tight">
              Sistema de Gestión de Movilidad
            </h1>
            <p className="text-lg text-white/90">
              Administración de traslados y radicaciones de vehículos
            </p>
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
