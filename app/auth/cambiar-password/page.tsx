"use client"

import { createClient } from "@/lib/supabase/client"
import { PasswordForm } from "@/components/auth/password-form"
import { ShieldAlert } from "lucide-react"

export default function CambiarPasswordPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <PasswordForm
          title="Cambiar contraseña"
          description="Debes establecer una nueva contraseña antes de continuar. Esta es una contraseña temporal asignada por el administrador."
          buttonText="Establecer nueva contraseña"
          clearFlag
          onSuccess={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            window.location.href = "/auth/login?message=password_updated"
          }}
          icon={
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <ShieldAlert className="h-6 w-6 text-amber-600" />
            </div>
          }
        />
      </div>
    </div>
  )
}
