"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LogIn, LogOut, Download, RefreshCw,
  ShieldCheck, ShieldOff, RotateCcw, Users, QrCode
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Registro {
  id:               string
  usuario_id:       string
  tipo:             "INGRESO" | "SALIDA"
  timestamp:        string
  nombre_completo:  string | null
  documento_numero: string | null
  rol_nombre:       string | null
}

interface Jornada {
  key:              string
  usuario_id:       string
  nombre_completo:  string | null
  documento_numero: string | null
  rol_nombre:       string | null
  ingreso:          string | null
  salida:           string | null
}

function agruparJornadas(registros: Registro[]): Jornada[] {
  // Ordena ASC para parear ingreso → salida en secuencia
  const sorted = [...registros].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  const porUsuario: Record<string, Registro[]> = {}
  for (const r of sorted) {
    if (!porUsuario[r.usuario_id]) porUsuario[r.usuario_id] = []
    porUsuario[r.usuario_id].push(r)
  }

  const jornadas: Jornada[] = []
  for (const [uid, recs] of Object.entries(porUsuario)) {
    let i = 0
    let par = 0
    while (i < recs.length) {
      const r = recs[i]
      if (r.tipo === "INGRESO") {
        const siguiente = recs[i + 1]
        jornadas.push({
          key:              `${uid}-${par++}`,
          usuario_id:       uid,
          nombre_completo:  r.nombre_completo,
          documento_numero: r.documento_numero,
          rol_nombre:       r.rol_nombre,
          ingreso:          r.timestamp,
          salida:           siguiente?.tipo === "SALIDA" ? siguiente.timestamp : null,
        })
        i += siguiente?.tipo === "SALIDA" ? 2 : 1
      } else {
        i++
      }
    }
  }

  // Ordena por ingreso DESC para mostrar más reciente primero
  return jornadas.sort(
    (a, b) => new Date(b.ingreso ?? 0).getTime() - new Date(a.ingreso ?? 0).getTime()
  )
}

interface Empleado {
  id:               string
  nombre_completo:  string | null
  documento_numero: string | null
  rol_nombre:       string | null
  tiene_pin:        boolean
}

function horaCol(ts: string) {
  return new Date(ts).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
  })
}

export default function AsistenciaPage() {
  const hoy = new Date().toISOString().slice(0, 10)
  const [fecha, setFecha]         = useState(hoy)
  const [busqueda, setBusqueda]   = useState("")
  const [registros, setRegistros] = useState<Registro[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading]     = useState(true)
  const [loadingEmp, setLoadingEmp] = useState(true)
  const [procesando, setProcesando] = useState<string | null>(null)

  const cargarRegistros = useCallback(async (f: string) => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("asist_vista_registros")
      .select("id, usuario_id, tipo, timestamp, nombre_completo, documento_numero, rol_nombre")
      .gte("timestamp", `${f}T00:00:00.000Z`)
      .lte("timestamp", `${f}T23:59:59.999Z`)
      .order("timestamp", { ascending: true })
    if (error) toast.error("Error al cargar registros")
    setRegistros(data ?? [])
    setLoading(false)
  }, [])

  const cargarEmpleados = useCallback(async () => {
    setLoadingEmp(true)
    const supabase = createClient()

    const [{ data: roles }, { data: conPin }] = await Promise.all([
      supabase
        .from("usuarios_roles")
        .select("usuario_id, roles_modulo(nombre)")
        .eq("modulo_id", "parqueadero"),
      supabase.from("asist_datos_empleado").select("perfil_id"),
    ])

    const ids = (roles ?? []).map((r) => r.usuario_id)
    const rolMap = Object.fromEntries(
      (roles ?? []).map((r) => [
        r.usuario_id,
        (r.roles_modulo as unknown as { nombre: string } | null)?.nombre ?? null,
      ])
    )

    const { data: usuarios } = ids.length
      ? await supabase
          .from("perfiles")
          .select("id, nombre_completo, documento_numero")
          .in("id", ids)
          .eq("activo", true)
          .order("nombre_completo")
      : { data: [] }

    const pinSet = new Set((conPin ?? []).map((r) => r.perfil_id))

    const lista: Empleado[] = (usuarios ?? []).map((p) => ({
      id:               p.id,
      nombre_completo:  p.nombre_completo,
      documento_numero: p.documento_numero,
      rol_nombre:       rolMap[p.id] ?? null,
      tiene_pin:        pinSet.has(p.id),
    }))

    setEmpleados(lista)
    setLoadingEmp(false)
  }, [])

  useEffect(() => { cargarRegistros(fecha) }, [fecha, cargarRegistros])
  useEffect(() => { cargarEmpleados() }, [cargarEmpleados])

  const jornadas = agruparJornadas(registros)
  const filtrados = jornadas.filter((j) => {
    const q = busqueda.toLowerCase()
    return j.nombre_completo?.toLowerCase().includes(q) || j.documento_numero?.includes(q)
  })

  const asignarPin = async (perfilId: string | "todos") => {
    setProcesando(perfilId)
    try {
      const body = perfilId === "todos" ? { todos: true } : { perfil_id: perfilId }
      const res  = await fetch("/api/scan/admin/pin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Error"); return }
      toast.success(perfilId === "todos"
        ? `${data.actualizados} empleados habilitados`
        : "PIN asignado — últimos 4 dígitos del documento"
      )
      cargarEmpleados()
    } catch { toast.error("Error de conexión") }
    finally   { setProcesando(null) }
  }

  const revocarPin = async (perfilId: string) => {
    setProcesando(perfilId + "_rev")
    try {
      const res = await fetch("/api/scan/admin/pin", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ perfil_id: perfilId }),
      })
      if (!res.ok) { toast.error("Error al revocar"); return }
      toast.success("Acceso revocado")
      cargarEmpleados()
    } catch { toast.error("Error de conexión") }
    finally   { setProcesando(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asistencia</h1>
          <p className="text-muted-foreground text-sm">Control de ingreso y salida por QR</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/parqueadero/asistencia/qr">
              <QrCode className="h-4 w-4 mr-1" />QR
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(`/api/scan/exportar?fecha=${fecha}`, "_blank")}>
            <Download className="h-4 w-4 mr-1" />Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="registros">
        <TabsList>
          <TabsTrigger value="registros">
            <span className="sm:hidden">Registros</span>
            <span className="hidden sm:inline">Registros del día</span>
          </TabsTrigger>
          <TabsTrigger value="accesos">
            <span className="sm:hidden">Accesos</span>
            <span className="hidden sm:inline">Gestión de accesos</span>
          </TabsTrigger>
        </TabsList>

        {/* ── REGISTROS ── */}
        <TabsContent value="registros" className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-auto" />
            <Input
              placeholder="Buscar por nombre o documento…"
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              className="max-w-xs"
            />
            <Button variant="outline" size="sm" onClick={() => cargarRegistros(fecha)} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">{filtrados.length} jornada{filtrados.length !== 1 ? "s" : ""}</p>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Documento</th>
                  <th className="text-left px-4 py-3 font-medium">
                    <span className="flex items-center gap-1 text-emerald-600">
                      <LogIn className="h-3 w-3" />Ingreso
                    </span>
                  </th>
                  <th className="text-left px-4 py-3 font-medium">
                    <span className="flex items-center gap-1 text-rose-600">
                      <LogOut className="h-3 w-3" />Salida
                    </span>
                  </th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">Cargando…</td></tr>
                ) : filtrados.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">Sin registros para esta fecha</td></tr>
                ) : filtrados.map((j) => (
                  <tr key={j.key} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{j.nombre_completo ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{j.documento_numero ?? "—"}</td>
                    <td className="px-4 py-3 tabular-nums text-emerald-600 font-medium">
                      {j.ingreso ? horaCol(j.ingreso) : "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-rose-600 font-medium">
                      {j.salida ? horaCol(j.salida) : (
                        <span className="text-amber-500 text-xs font-normal">En turno</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {j.salida ? (
                        <Badge variant="outline" className="border-muted-foreground text-muted-foreground text-xs">
                          Completado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500 text-amber-600 text-xs">
                          En turno
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── ACCESOS ── */}
        <TabsContent value="accesos" className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              PIN = últimos 4 dígitos del documento. Al resetear se recalcula automáticamente.
            </p>
            <Button
              size="sm"
              onClick={() => asignarPin("todos")}
              disabled={procesando === "todos"}
            >
              <Users className="h-4 w-4 mr-1" />
              {procesando === "todos" ? "Procesando…" : "Habilitar todos"}
            </Button>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Documento</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Rol</th>
                  <th className="text-left px-4 py-3 font-medium">Acceso QR</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loadingEmp ? (
                  <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">Cargando…</td></tr>
                ) : empleados.map((e) => (
                  <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{e.nombre_completo ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {e.documento_numero ?? <span className="text-amber-600 text-xs">Sin documento</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{e.rol_nombre ?? "—"}</td>
                    <td className="px-4 py-3">
                      {e.tiene_pin
                        ? <Badge variant="outline" className="border-emerald-500 text-emerald-600"><ShieldCheck className="h-3 w-3 mr-1" />Habilitado</Badge>
                        : <Badge variant="outline" className="border-muted-foreground text-muted-foreground"><ShieldOff className="h-3 w-3 mr-1" />Sin acceso</Badge>
                      }
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col sm:flex-row gap-1.5 items-end sm:items-center sm:justify-end">
                        <Button
                          size="sm" variant="outline"
                          disabled={!e.documento_numero || procesando === e.id}
                          onClick={() => asignarPin(e.id)}
                          className="w-full sm:w-auto text-xs"
                          title={e.tiene_pin ? "Resetear PIN" : "Habilitar acceso"}
                        >
                          {e.tiene_pin
                            ? <><RotateCcw className="h-3 w-3 mr-1" />Resetear</>
                            : <><ShieldCheck className="h-3 w-3 mr-1" />Habilitar</>
                          }
                        </Button>
                        {e.tiene_pin && (
                          <Button
                            size="sm" variant="outline"
                            className="w-full sm:w-auto text-xs text-destructive hover:text-destructive"
                            disabled={procesando === e.id + "_rev"}
                            onClick={() => revocarPin(e.id)}
                          >
                            <ShieldOff className="h-3 w-3 mr-1" />Revocar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
