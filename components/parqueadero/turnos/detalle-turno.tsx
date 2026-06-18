"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Plus, CheckCircle, XCircle, Trash2, Lock, ClipboardCheck, StopCircle, Link2 } from "lucide-react"
import { toast } from "sonner"
import type { VistaTurno, TurnoNovedad } from "@/lib/parqueadero/types"
import type { PermisoParqueadero } from "@/lib/types/permissions"
import { getNowTimestampColombia, localColombiaToUTC } from "@/lib/utils/date"

interface InspeccionResumen {
  id: string
  consecutivo: string | null
  fecha: string
  hora: string
  es_apto: boolean
  operador_nombre: string
  auxiliar_nombre: string | null
  km_inicio: number | null
  items_buenos: number
  items_regulares: number
  items_malos: number
}

interface InspeccionSinTurno {
  id: string
  consecutivo: string | null
  hora: string
  es_apto: boolean
  operador_nombre: string
  km_inicio: number | null
}

interface DetalleTurnoProps {
  turno:                 VistaTurno
  inspecciones:          InspeccionResumen[]
  inspeccionesSinTurno:  InspeccionSinTurno[]
  novedades:             TurnoNovedad[]
  permisos:              Record<PermisoParqueadero, boolean>
  esSuperadmin?:         boolean
}

function horaCol(ts: string) {
  return new Date(ts).toLocaleString("es-CO", {
    timeZone: "America/Bogota", hour: "2-digit", minute: "2-digit", hour12: false,
  })
}

function fmtHoras(h: number | null) {
  if (h == null) return "—"
  const hh = Math.floor(Math.abs(h))
  const mm = Math.round((Math.abs(h) - hh) * 60)
  return `${hh}h ${mm.toString().padStart(2, "0")}m`
}

export function DetalleTurno({ turno, inspecciones, inspeccionesSinTurno: initialSinTurno, novedades: initialNovedades, permisos, esSuperadmin }: DetalleTurnoProps) {
  const router = useRouter()
  const [novedades, setNovedades]             = useState(initialNovedades)
  const [sinTurno, setSinTurno]               = useState(initialSinTurno)
  const [asociando, setAsociando]             = useState<string | null>(null)
  const [cierresNovedad, setCierresNovedad]   = useState<Record<string, string>>({})
  const [loadingCierre, setLoadingCierre]     = useState(false)
  const [loadingNov, setLoadingNov]           = useState(false)
  const [formCierre, setFormCierre] = useState({ hora_fin: getNowTimestampColombia().slice(0, 16), km_fin: "" })
  const [formNov, setFormNov]       = useState({ motivo: "", hora_inicio: getNowTimestampColombia().slice(0, 16), hora_fin: "" })

  const [deletingTurno, setDeletingTurno] = useState(false)
  const turnoAbierto      = turno.estado === "abierto"
  const puedeGestionar    = permisos.gestionar_vehiculos && turnoAbierto
  const tieneApta         = inspecciones.some((i) => i.es_apto)
  const puedeInspeccionar = permisos.crear_inspecciones && !tieneApta

  const asociarInspeccion = async (inspeccionId: string) => {
    setAsociando(inspeccionId)
    try {
      const res = await fetch(`/api/parqueadero/inspecciones/${inspeccionId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turno_id: turno.id }),
      })
      if (!res.ok) { toast.error("Error al asociar inspección"); return }
      toast.success("Inspección asociada al turno")
      setSinTurno(p => p.filter(i => i.id !== inspeccionId))
      router.refresh()
    } catch { toast.error("Error de conexión") }
    finally { setAsociando(null) }
  }

  const eliminarTurno = async () => {
    if (!confirm("¿Eliminar este turno? Esta acción es irreversible.")) return
    setDeletingTurno(true)
    const res = await fetch(`/api/parqueadero/turnos/${turno.id}`, { method: "DELETE" })
    if (!res.ok) { toast.error("Error al eliminar"); setDeletingTurno(false); return }
    toast.success("Turno eliminado")
    router.push("/parqueadero/turnos")
  }

  const cerrarTurno = async () => {
    if (!formCierre.km_fin) { toast.error("Ingrese el KM final"); return }
    if (turno.km_inicio != null && Number(formCierre.km_fin) < turno.km_inicio) {
      toast.error(`KM final (${Number(formCierre.km_fin).toLocaleString("es-CO")}) no puede ser menor al KM inicial (${turno.km_inicio.toLocaleString("es-CO")})`)
      return
    }
    setLoadingCierre(true)
    try {
      const res = await fetch(`/api/parqueadero/turnos/${turno.id}/cerrar`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hora_fin: localColombiaToUTC(formCierre.hora_fin), km_fin: Number(formCierre.km_fin) }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Error"); return }
      toast.success("Turno cerrado")
      router.refresh()
    } catch { toast.error("Error de conexión") }
    finally { setLoadingCierre(false) }
  }

  const agregarNovedad = async () => {
    if (!formNov.motivo.trim()) { toast.error("Ingrese el motivo"); return }
    setLoadingNov(true)
    try {
      const body = {
        motivo:      formNov.motivo,
        hora_inicio: localColombiaToUTC(formNov.hora_inicio),
        hora_fin:    localColombiaToUTC(formNov.hora_fin) ?? undefined,
      }
      const res = await fetch(`/api/parqueadero/turnos/${turno.id}/novedades`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Error"); return }
      toast.success("Novedad registrada")
      setNovedades((p) => [...p, { id: data.id, turno_id: turno.id, creado_en: new Date().toISOString(), motivo: body.motivo, hora_inicio: body.hora_inicio ?? new Date().toISOString(), hora_fin: body.hora_fin ?? null }])
      setFormNov({ motivo: "", hora_inicio: getNowTimestampColombia().slice(0, 16), hora_fin: "" })
    } catch { toast.error("Error de conexión") }
    finally { setLoadingNov(false) }
  }

  const cerrarNovedad = async (id: string) => {
    const localVal = cierresNovedad[id]
    if (!localVal) { toast.error("Ingrese la hora de fin"); return }
    const hora_fin = localColombiaToUTC(localVal)
    if (!hora_fin) { toast.error("Hora inválida"); return }
    const res = await fetch(`/api/parqueadero/turnos/${turno.id}/novedades/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hora_fin }),
    })
    if (!res.ok) { toast.error("Error al cerrar"); return }
    setNovedades((p) => p.map((n) => n.id === id ? { ...n, hora_fin } : n))
    setCierresNovedad((p) => { const c = { ...p }; delete c[id]; return c })
    toast.success("Salida cerrada")
  }

  const eliminarNovedad = async (id: string) => {
    const res = await fetch(`/api/parqueadero/turnos/${turno.id}/novedades/${id}`, { method: "DELETE" })
    if (!res.ok) { toast.error("Error al eliminar"); return }
    setNovedades((p) => p.filter((n) => n.id !== id))
    toast.success("Novedad eliminada")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Turno</h1>
            <Badge variant="outline" className={
              turno.estado === "abierto" ? "border-emerald-500 text-emerald-600" : "border-muted-foreground text-muted-foreground"
            }>
              {turno.estado === "abierto" ? "Abierto" : "Cerrado"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground capitalize mt-1">
            {turno.tipo_turno} · {turno.placa} {turno.marca ? `(${turno.marca})` : ""} · {new Date(turno.fecha + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
        {esSuperadmin && (
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={eliminarTurno} disabled={deletingTurno}>
            <Trash2 className="h-4 w-4 mr-1" />Eliminar turno
          </Button>
        )}
        {puedeInspeccionar && (
          tieneApta ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground border rounded-lg px-3 py-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              Vehículo apto — no se permiten más inspecciones
            </div>
          ) : (
            <Button asChild variant="outline">
              <Link href={`/parqueadero/inspecciones/nueva?turno_id=${turno.id}&vehiculo_id=${turno.vehiculo_id}`}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Nueva inspección
              </Link>
            </Button>
          )
        )}
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "H. Inicio",  value: horaCol(turno.hora_inicio) },
          { label: "H. Fin",     value: turno.hora_fin ? horaCol(turno.hora_fin) : "—" },
          { label: "H. Operadas", value: fmtHoras(turno.horas_operadas) },
          { label: "KM Recorridos", value: turno.km_recorridos != null ? turno.km_recorridos.toLocaleString("es-CO") : "—" },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold tabular-nums mt-0.5">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inspecciones */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inspecciones ({inspecciones.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {inspecciones.length === 0 ? (
              <p className="text-sm text-muted-foreground px-6 pb-4">Sin inspecciones en este turno</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-2 font-medium text-xs">Consecutivo</th>
                    <th className="text-left px-4 py-2 font-medium text-xs">Operador</th>
                    <th className="text-right px-4 py-2 font-medium text-xs">KM Ini</th>
                    <th className="text-center px-4 py-2 font-medium text-xs">Apto</th>
                  </tr>
                </thead>
                <tbody>
                  {inspecciones.map((i) => (
                    <tr key={i.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-2.5">
                        <Link href={`/parqueadero/inspecciones/${i.id}`} className="hover:underline font-mono text-xs">
                          {i.consecutivo ?? i.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{i.operador_nombre}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{i.km_inicio?.toLocaleString("es-CO") ?? "—"}</td>
                      <td className="px-4 py-2.5 text-center">
                        {i.es_apto
                          ? <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                          : <XCircle className="h-4 w-4 text-rose-500 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Inspecciones del día sin turno asignado */}
            {sinTurno.length > 0 && permisos.crear_inspecciones && (
              <div className="border-t px-4 py-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" />
                  Inspecciones del día sin turno asignado
                </p>
                {sinTurno.map((i) => (
                  <div key={i.id} className="flex items-center justify-between gap-2 rounded-lg border border-dashed px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      {i.es_apto
                        ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        : <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />}
                      <div className="min-w-0">
                        <p className="font-mono text-xs truncate">{i.consecutivo ?? i.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground truncate">{i.operador_nombre} · {i.hora?.slice(0, 5)}</p>
                      </div>
                    </div>
                    <Button
                      size="sm" variant="outline"
                      className="shrink-0 text-xs h-7"
                      disabled={asociando === i.id}
                      onClick={() => asociarInspeccion(i.id)}
                    >
                      {asociando === i.id ? "…" : "Asociar"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Novedades */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Salidas de operación ({novedades.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {novedades.length > 0 && (
              <div className="space-y-2">
                {novedades.map((n) => (
                  <div key={n.id} className="flex items-start justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium">{n.motivo}</p>
                      <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                        {horaCol(n.hora_inicio)} → {n.hora_fin ? horaCol(n.hora_fin) : (
                          <span className="text-amber-500 font-medium">en curso</span>
                        )}
                      </p>
                      {puedeGestionar && !n.hora_fin && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <input
                            type="datetime-local"
                            value={cierresNovedad[n.id] ?? getNowTimestampColombia().slice(0, 16)}
                            onChange={(e) => setCierresNovedad((p) => ({ ...p, [n.id]: e.target.value }))}
                            className="h-7 rounded border border-input bg-background px-2 text-xs"
                          />
                          <button
                            onClick={() => cerrarNovedad(n.id)}
                            className="flex items-center gap-1 rounded border border-emerald-500 px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
                          >
                            <StopCircle className="h-3 w-3" />Cerrar
                          </button>
                        </div>
                      )}
                    </div>
                    {puedeGestionar && (
                      <button onClick={() => eliminarNovedad(n.id)} className="text-destructive hover:text-destructive/80 mt-0.5" title="Eliminar">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <Separator />
              </div>
            )}

            {puedeGestionar && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Motivo / razón de la salida</Label>
                  <Input
                    placeholder="Ej: Avería motor, cambio de llanta…"
                    value={formNov.motivo}
                    onChange={(e) => setFormNov((p) => ({ ...p, motivo: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Hora inicio</Label>
                    <Input type="datetime-local" value={formNov.hora_inicio}
                      onChange={(e) => setFormNov((p) => ({ ...p, hora_inicio: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Hora fin</Label>
                    <Input type="datetime-local" value={formNov.hora_fin}
                      onChange={(e) => setFormNov((p) => ({ ...p, hora_fin: e.target.value }))} />
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={agregarNovedad} disabled={loadingNov} className="w-full">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Registrar salida
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cerrar turno */}
      {puedeGestionar && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-600" />
              Cerrar turno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <Label>Hora de fin</Label>
                <Input type="datetime-local" value={formCierre.hora_fin}
                  onChange={(e) => { if (e.target.value) setFormCierre((p) => ({ ...p, hora_fin: e.target.value })) }} />
              </div>
              <div className="space-y-1.5">
                <Label>KM final</Label>
                <Input type="number" min={0} placeholder="Ej: 1250"
                  value={formCierre.km_fin}
                  onChange={(e) => setFormCierre((p) => ({ ...p, km_fin: e.target.value }))} />
              </div>
              <Button onClick={cerrarTurno} disabled={loadingCierre} variant="default">
                <Lock className="h-4 w-4 mr-2" />
                {loadingCierre ? "Cerrando…" : "Cerrar turno"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
