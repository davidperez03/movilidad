"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Car, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
      router.refresh()
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
            <p className="mt-2 text-sm text-muted-foreground">
              Gestión de Trámites Vehiculares
            </p>
          </div>

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
              <p className="text-sm text-muted-foreground">
                ¿No tienes una cuenta?{" "}
                <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
                  Regístrate aquí
                </Link>
              </p>
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
          <div className="space-y-6 text-center">
            <h1 className="text-5xl font-bold tracking-tight">
              Bienvenido a Movilidad
            </h1>
            <p className="text-xl text-white/90 max-w-md">
              Gestiona traslados y radicaciones de vehículos de manera eficiente y segura
            </p>
            <div className="grid grid-cols-2 gap-6 pt-8 max-w-md mx-auto">
              <div className="rounded-lg bg-white/10 backdrop-blur-sm p-4 text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm text-white/80">Disponibilidad</div>
              </div>
              <div className="rounded-lg bg-white/10 backdrop-blur-sm p-4 text-center">
                <div className="text-3xl font-bold">100%</div>
                <div className="text-sm text-white/80">Seguro</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
