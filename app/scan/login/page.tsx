"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PinInput } from "@/components/scan/pin-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, QrCode } from "lucide-react"
import { toast } from "sonner"

export default function ScanLoginPage() {
  const router = useRouter()
  const [documento, setDocumento] = useState("")
  const [pin, setPin]             = useState("")
  const [loading, setLoading]     = useState(false)

  const handleLogin = async (pinValue?: string) => {
    const pinFinal = pinValue ?? pin
    if (!documento.trim()) {
      toast.error("Ingrese su número de documento")
      return
    }
    if (pinFinal.length < 4) {
      toast.error("PIN incompleto")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/scan/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ documento_numero: documento.trim(), pin: pinFinal }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? "Error al iniciar sesión")
        setPin("")
        return
      }

      router.replace("/scan")
    } catch {
      toast.error("Error de conexión")
      setPin("")
    } finally {
      setLoading(false)
    }
  }

  const onPinChange = (v: string) => {
    setPin(v)
    if (v.length === 4 && documento.trim()) {
      setTimeout(() => handleLogin(v), 120)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8 w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center">
          <QrCode className="h-7 w-7 text-background" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Control de Asistencia</h1>
        <p className="text-sm text-muted-foreground">Ingrese su documento y PIN de 4 dígitos</p>
      </div>

      <div className="w-full max-w-xs space-y-2">
        <Label htmlFor="documento" className="text-sm">Número de documento</Label>
        <Input
          id="documento"
          type="tel"
          inputMode="numeric"
          placeholder="Ej: 1234567890"
          value={documento}
          onChange={(e) => setDocumento(e.target.value.replace(/\D/g, ""))}
          disabled={loading}
          className="h-12 text-lg text-center tracking-widest"
          autoComplete="off"
        />
      </div>

      <div className="w-full max-w-xs">
        <PinInput value={pin} onChange={onPinChange} disabled={loading} />
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Verificando...</span>
        </div>
      )}
    </div>
  )
}
