"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { PinInput } from "@/components/scan/pin-input"
import { Truck, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function GruaLoginPage() {
  const router              = useRouter()
  const { vehiculoId }      = useParams<{ vehiculoId: string }>()
  const [pin, setPin]       = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (pinValue?: string) => {
    const pinFinal = pinValue ?? pin
    if (pinFinal.length < 4) { toast.error("PIN incompleto"); return }

    setLoading(true)
    try {
      const res  = await fetch(`/api/grua/${vehiculoId}/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ pin: pinFinal }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "PIN incorrecto"); setPin(""); return }
      router.replace(`/grua/${vehiculoId}`)
    } catch { toast.error("Error de conexión"); setPin("") }
    finally { setLoading(false) }
  }

  const onPinChange = (v: string) => {
    setPin(v)
    if (v.length === 4) setTimeout(() => handleLogin(v), 120)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-8 w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center">
          <Truck className="h-7 w-7 text-background" />
        </div>
        <h1 className="text-2xl font-bold">Registro de Grúa</h1>
        <p className="text-sm text-muted-foreground">Ingrese el PIN de acceso</p>
      </div>

      <div className="w-full max-w-xs">
        <PinInput value={pin} onChange={onPinChange} disabled={loading} />
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Verificando…</span>
        </div>
      )}
    </div>
  )
}
