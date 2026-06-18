"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { LogIn, LogOut, Loader2, User, QrCode, MapPin, MapPinOff, AlertTriangle, RefreshCw } from "lucide-react"
import { toast } from "sonner"

type GpsEstado = "idle" | "pendiente" | "ok" | "denegado" | "inactivo" | "cargando"

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

function InstruccionesGps({ onCerrar }: { onCerrar: () => void }) {
  return (
    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 text-left space-y-2">
      <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">Cómo volver a activar la ubicación:</p>
      <ol className="list-decimal list-inside space-y-1.5 text-xs text-amber-700 dark:text-amber-300">
        <li>Toca el ícono de candado <strong>🔒</strong> en la barra de dirección</li>
        <li>Selecciona <strong>Permisos del sitio</strong> o <strong>Configuración</strong></li>
        <li>Busca <strong>Ubicación</strong> y cámbialo a <strong>Permitir</strong></li>
        <li>Regresa aquí y recarga la página</li>
      </ol>
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 text-xs font-medium text-amber-800 dark:text-amber-200 underline underline-offset-2"
        >
          <RefreshCw className="h-3 w-3" />Recargar página
        </button>
        <button onClick={onCerrar} className="text-xs text-amber-600 underline underline-offset-2">
          Cerrar
        </button>
      </div>
    </div>
  )
}

export default function ScanPage() {
  const router = useRouter()
  const [estado, setEstado]               = useState<Estado | null>(null)
  const [loading, setLoading]             = useState(true)
  const [saving, setSaving]               = useState(false)
  const [gps, setGps]                     = useState<GpsEstado>("idle")
  const [verInstrucciones, setVerInst]    = useState(false)
  const permStatusRef                     = useRef<PermissionStatus | null>(null)

  useEffect(() => {
    fetch("/api/scan/estado")
      .then((r) => { if (r.status === 401) { router.replace("/scan/login"); return null } return r.json() })
      .then((data) => { if (data) setEstado(data) })
      .catch(() => router.replace("/scan/login"))
      .finally(() => setLoading(false))
  }, [router])

  // Verificar estado GPS al cargar y escuchar cambios
  useEffect(() => {
    if (!navigator.geolocation) { setGps("inactivo"); return }

    navigator.permissions?.query({ name: "geolocation" }).then((p) => {
      permStatusRef.current = p

      const aplicar = (state: PermissionState) => {
        if (state === "granted")  { setGps("ok"); setVerInst(false) }
        else if (state === "denied") setGps("denegado")
        else                         setGps("pendiente")
      }

      aplicar(p.state)
      p.onchange = () => aplicar(p.state)
    }).catch(() => {
      // Permissions API no disponible — dejar en "pendiente" para que el botón active el diálogo
      setGps("pendiente")
    })

    return () => { if (permStatusRef.current) permStatusRef.current.onchange = null }
  }, [])

  const solicitarGps = async () => {
    setGps("cargando")
    const { estado: nuevoEstado } = await pedirGps()
    setGps(nuevoEstado)
    if (nuevoEstado === "ok")        { toast.success("Ubicación habilitada"); setVerInst(false) }
    else if (nuevoEstado === "denegado") setVerInst(true)
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
    pendiente: (
      <button onClick={solicitarGps} className="flex items-center gap-1 text-xs text-blue-600 underline underline-offset-2">
        <MapPin className="h-3 w-3" />Habilitar ubicación
      </button>
    ),
    cargando: <span className="flex items-center gap-1 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />Obteniendo ubicación…</span>,
    ok:       <span className="flex items-center gap-1 text-xs text-emerald-600"><MapPin className="h-3 w-3" />Ubicación activa</span>,
    denegado: (
      <div className="text-center">
        <button
          onClick={() => setVerInst((v) => !v)}
          className="flex items-center gap-1 text-xs text-amber-600 underline underline-offset-2 mx-auto"
        >
          <MapPinOff className="h-3 w-3" />Ubicación denegada — ver cómo activar
        </button>
        {verInstrucciones && <InstruccionesGps onCerrar={() => setVerInst(false)} />}
      </div>
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
