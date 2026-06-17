"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogIn, LogOut, Loader2, User, QrCode, MapPin, MapPinOff, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

type GpsEstado = "idle" | "ok" | "denegado" | "inactivo" | "cargando"

interface Estado {
  nombre:  string
  avatar:  string | null
  ultimo:  { tipo: string; timestamp: string } | null
  proximo: "INGRESO" | "SALIDA"
}

function horaCol(ts: string) {
  return new Date(ts).toLocaleString("es-CO", {
    timeZone: "America/Bogota", hour: "2-digit", minute: "2-digit", hour12: true,
  })
}

async function pedirGps(): Promise<{ pos: GeolocationPosition | null; estado: GpsEstado }> {
  if (!navigator.geolocation) return { pos: null, estado: "inactivo" }
  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, maximumAge: 0 })
    )
    return { pos, estado: "ok" }
  } catch (err) {
    const e = err as GeolocationPositionError
    if (e.code === 1) return { pos: null, estado: "denegado" }
    return { pos: null, estado: "inactivo" }
  }
}

export default function ScanPage() {
  const router = useRouter()
  const [estado, setEstado]   = useState<Estado | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [gps, setGps]         = useState<GpsEstado>("idle")

  useEffect(() => {
    fetch("/api/scan/estado")
      .then((r) => { if (r.status === 401) { router.replace("/scan/login"); return null } return r.json() })
      .then((data) => { if (data) setEstado(data) })
      .catch(() => router.replace("/scan/login"))
      .finally(() => setLoading(false))
  }, [router])

  // Verificar estado GPS al cargar
  useEffect(() => {
    if (!navigator.geolocation) { setGps("inactivo"); return }
    navigator.permissions?.query({ name: "geolocation" }).then((p) => {
      if (p.state === "granted") setGps("ok")
      else if (p.state === "denied") setGps("denegado")
    }).catch(() => {})
  }, [])

  const solicitarGps = async () => {
    setGps("cargando")
    const { estado: nuevoEstado } = await pedirGps()
    setGps(nuevoEstado)
    if (nuevoEstado === "ok") toast.success("Ubicación habilitada")
    else if (nuevoEstado === "denegado") toast.error("Permiso denegado — actívalo en la configuración del navegador")
    else toast.error("No se pudo obtener la ubicación")
  }

  const registrar = async () => {
    if (!estado || saving) return
    setSaving(true)
    try {
      const { pos, estado: nuevoGps } = await pedirGps()
      setGps(nuevoGps)

      if (!pos) {
        if (nuevoGps === "denegado") throw new Error("Debes permitir el acceso a tu ubicación en la configuración del navegador")
        throw new Error("No se pudo obtener tu ubicación. Verifica que el GPS esté activo")
      }

      const res  = await fetch("/api/scan/registrar", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Error al registrar"); return }
      router.push(`/scan/confirm?tipo=${data.tipo}&ts=${encodeURIComponent(data.timestamp)}&nombre=${encodeURIComponent(data.nombre)}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  const cerrarSesion = async () => {
    await fetch("/api/scan/logout", { method: "POST" })
    router.replace("/scan/login")
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )

  if (!estado) return null

  const esIngreso = estado.proximo === "INGRESO"

  const gpsBadge = {
    idle:     null,
    cargando: <span className="flex items-center gap-1 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />Obteniendo ubicación…</span>,
    ok:       <span className="flex items-center gap-1 text-xs text-emerald-600"><MapPin className="h-3 w-3" />Ubicación activa</span>,
    denegado: (
      <button onClick={solicitarGps} className="flex items-center gap-1 text-xs text-amber-600 underline underline-offset-2">
        <MapPinOff className="h-3 w-3" />Ubicación denegada — toca para reintentar
      </button>
    ),
    inactivo: (
      <button onClick={solicitarGps} className="flex items-center gap-1 text-xs text-rose-600 underline underline-offset-2">
        <AlertTriangle className="h-3 w-3" />Sin ubicación — toca para activar
      </button>
    ),
  }[gps]

  return (
    <div className="flex-1 flex flex-col items-center justify-between px-6 py-8 gap-6 w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
          <QrCode className="h-5 w-5 text-background" />
        </div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Control de Asistencia
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 text-center">
        {estado.avatar ? (
          <img src={estado.avatar} alt={estado.nombre} className="w-20 h-20 rounded-full object-cover border-2 border-border" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <div>
          <p className="text-xl font-bold leading-tight">{estado.nombre}</p>
          {estado.ultimo && (
            <p className="text-sm text-muted-foreground mt-1">
              Último {estado.ultimo.tipo === "INGRESO" ? "ingreso" : "salida"}: {horaCol(estado.ultimo.timestamp)}
            </p>
          )}
        </div>
        {gpsBadge && <div className="mt-1">{gpsBadge}</div>}
      </div>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <button
          onClick={registrar}
          disabled={saving}
          className={`
            w-full h-20 rounded-2xl text-white text-xl font-bold
            flex items-center justify-center gap-3
            transition-all active:scale-95 disabled:opacity-60
            ${esIngreso ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}
          `}
        >
          {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : esIngreso ? (
            <><LogIn className="h-6 w-6" />REGISTRAR INGRESO</>
          ) : (
            <><LogOut className="h-6 w-6" />REGISTRAR SALIDA</>
          )}
        </button>

        <button onClick={cerrarSesion} className="text-xs text-muted-foreground hover:text-foreground text-center py-2 transition-colors">
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
