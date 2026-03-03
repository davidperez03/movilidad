"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/auth/password-input"
import { PasswordRequirements, validatePassword } from "@/components/auth/password-requirements"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface PasswordFormProps {
  title: string
  description: string
  buttonText: string
  clearFlag?: boolean
  onSuccess: () => void | Promise<void>
  icon?: React.ReactNode
}

export function PasswordForm({ title, description, buttonText, clearFlag, onSuccess, icon }: PasswordFormProps) {
  const [newPwd, setNewPwd] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
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
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newPwd, clearFlag }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al actualizar la contraseña")
      }

      await onSuccess()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al actualizar la contraseña"
      setError(msg)
      setIsLoading(false)
    }
    // No resetear isLoading en éxito — queda bloqueado hasta que onSuccess navegue
  }

  return (
    <Card>
      <CardHeader className={icon ? "text-center" : undefined}>
        {icon && <div className="mx-auto mb-4">{icon}</div>}
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="newPwd">Nueva contraseña</Label>
              <PasswordInput
                id="newPwd"
                required
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                disabled={isLoading}
              />
              <PasswordRequirements password={newPwd} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPwd">Confirmar contraseña</Label>
              <PasswordInput
                id="confirmPwd"
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
                buttonText
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
