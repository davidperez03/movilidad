"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scale, Pencil, CheckCircle, X, Loader2, Trash2, Save, ClipboardList, PlusCircle } from "lucide-react"
import { toast } from "sonner"

type Fase = "codigo" | "formulario" | "finalizada"
type Vista = "registrar" | "lista"
type AccionFila = "normal" | "editando" | "confirmando_eliminar"

interface Sesion {
  id: string
  codigo: string
  entidad_nombre: string
  nombre_peritos: string
  nunc_dpto: string
  nunc_municipio: string
  nunc_entidad: string
  nunc_unidad: string
  nunc_anio: number
}

interface NuncBase {
  dpto: string; municipio: string; entidad: string; unidad: string; anio: number; consecutivo: string
}

interface RegistroLocal {
  id: string
  placa: string
  nunc_dpto: string; nunc_municipio: string; nunc_entidad: string; nunc_unidad: string; nunc_anio: number; nunc_consecutivo: string
  observaciones: string
}

function nuncStr(r: Pick<RegistroLocal, "nunc_dpto"|"nunc_municipio"|"nunc_entidad"|"nunc_unidad"|"nunc_anio"|"nunc_consecutivo">) {
  return `${r.nunc_dpto}-${r.nunc_municipio}-${r.nunc_entidad}-${r.nunc_unidad}-${r.nunc_anio}-${r.nunc_consecutivo}`
}

export default function AccesoNuncPage() {
  const [fase, setFase] = useState<Fase>("codigo")
  const [vista, setVista] = useState<Vista>("registrar")
  const [codigoInput, setCodigoInput] = useState("")
  const [sesion, setSesion] = useState<Sesion | null>(null)
  const [editandoNuncBase, setEditandoNuncBase] = useState(false)
  const [nunc, setNunc] = useState<NuncBase>({ dpto: "", municipio: "", entidad: "", unidad: "", anio: 0, consecutivo: "" })
  const [placa, setPlaca] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [registros, setRegistros] = useState<RegistroLocal[]>([])
  const [accionFila, setAccionFila] = useState<Record<string, AccionFila>>({})
  const [editData, setEditData] = useState<Record<string, RegistroLocal>>({})
  const [loading, setLoading] = useState(false)
  const [cerrando, setCerrando] = useState(false)

  function getAccion(id: string): AccionFila { return accionFila[id] ?? "normal" }
  function setAccion(id: string, a: AccionFila) { setAccionFila((p) => ({ ...p, [id]: a })) }

  async function validarCodigo(e: React.FormEvent) {
    e.preventDefault()
    if (!codigoInput.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/nunc/validar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ codigo: codigoInput.trim() }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Código inválido")
      const s: Sesion = data.sesion
      setSesion(s)
      setNunc({ dpto: s.nunc_dpto, municipio: s.nunc_municipio, entidad: s.nunc_entidad, unidad: s.nunc_unidad, anio: s.nunc_anio, consecutivo: "" })
      setFase("formulario")
    } catch (err) { toast.error(err instanceof Error ? err.message : "Error al validar") }
    finally { setLoading(false) }
  }

  async function guardarVehiculo(e: React.FormEvent) {
    e.preventDefault()
    if (!sesion || !placa.trim() || !nunc.consecutivo.trim()) { toast.error("Placa y consecutivo son obligatorios"); return }
    setLoading(true)
    try {
      const body = { codigo: sesion.codigo, placa: placa.trim().toUpperCase(), nunc_dpto: nunc.dpto, nunc_municipio: nunc.municipio, nunc_entidad: nunc.entidad, nunc_unidad: nunc.unidad, nunc_anio: nunc.anio, nunc_consecutivo: nunc.consecutivo.trim(), observaciones: observaciones.trim() || undefined }
      const res = await fetch("/api/nunc/registro", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { if (res.status === 410) { toast.error(data.error); setFase("finalizada"); return } throw new Error(data.error) }
      setRegistros((prev) => [{ id: data.id, placa: body.placa, nunc_dpto: nunc.dpto, nunc_municipio: nunc.municipio, nunc_entidad: nunc.entidad, nunc_unidad: nunc.unidad, nunc_anio: nunc.anio, nunc_consecutivo: nunc.consecutivo.trim(), observaciones: observaciones.trim() }, ...prev])
      setPlaca("")
      setNunc((n) => ({ ...n, consecutivo: "" }))
      setObservaciones("")
      toast.success(`${body.placa} registrado`)
    } catch (err) { toast.error(err instanceof Error ? err.message : "Error al guardar") }
    finally { setLoading(false) }
  }

  function iniciarEdicion(r: RegistroLocal) { setEditData((p) => ({ ...p, [r.id]: { ...r } })); setAccion(r.id, "editando") }

  async function guardarEdicion(id: string) {
    const datos = editData[id]
    if (!datos || !sesion) return
    setLoading(true)
    try {
      const res = await fetch(`/api/nunc/registro/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ codigo: sesion.codigo, ...datos }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRegistros((prev) => prev.map((r) => r.id === id ? { ...datos } : r))
      setAccion(id, "normal")
      toast.success("Actualizado")
    } catch (err) { toast.error(err instanceof Error ? err.message : "Error al editar") }
    finally { setLoading(false) }
  }

  async function eliminarRegistro(id: string) {
    if (!sesion) return
    setLoading(true)
    try {
      const res = await fetch(`/api/nunc/registro/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ codigo: sesion.codigo }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRegistros((prev) => prev.filter((r) => r.id !== id))
      setAccion(id, "normal")
      toast.success("Eliminado")
    } catch (err) { toast.error(err instanceof Error ? err.message : "Error al eliminar") }
    finally { setLoading(false) }
  }

  async function finalizarSesion() {
    if (!sesion) return
    setCerrando(true)
    try {
      const res = await fetch("/api/nunc/cerrar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ codigo: sesion.codigo }) })
      if (!res.ok) throw new Error((await res.json()).error)
      setFase("finalizada")
    } catch (err) { toast.error(err instanceof Error ? err.message : "Error al finalizar") }
    finally { setCerrando(false) }
  }

  if (fase === "codigo") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="rounded-full bg-primary/10 p-3"><Scale className="h-6 w-6 text-primary" /></div>
            </div>
            <CardTitle>Estudios NUNC</CardTitle>
            <p className="text-sm text-muted-foreground">Ingrese el código proporcionado por el administrador</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={validarCodigo} className="space-y-4">
              <div className="space-y-2">
                <Label>Código de sesión</Label>
                <Input placeholder="PER-XXXXXX" value={codigoInput} onChange={(e) => setCodigoInput(e.target.value.toUpperCase())} className="font-mono text-center text-lg tracking-widest" maxLength={10} autoFocus />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Ingresar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (fase === "finalizada") {
    return (
      <div className="min-h-screen bg-muted/30 p-4">
        <div className="max-w-lg mx-auto space-y-4">
          <Card className="text-center">
            <CardContent className="pt-6 pb-4 space-y-2">
              <div className="flex justify-center"><div className="rounded-full bg-green-100 p-3"><CheckCircle className="h-7 w-7 text-green-600" /></div></div>
              <p className="text-lg font-bold">Sesión finalizada</p>
              <p className="text-muted-foreground text-sm">{registros.length} vehículo{registros.length !== 1 ? "s" : ""} registrado{registros.length !== 1 ? "s" : ""}</p>
            </CardContent>
          </Card>
          {registros.length > 0 && (
            <Card>
              <CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-sm">Resumen de la sesión</CardTitle></CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-muted-foreground text-xs"><th className="text-left py-1.5 pr-3 w-8">#</th><th className="text-left py-1.5 pr-3">Placa</th><th className="text-left py-1.5">NUNC</th></tr></thead>
                    <tbody>
                      {registros.map((r, i) => (
                        <tr key={r.id} className="border-b last:border-0">
                          <td className="py-1.5 pr-3 text-muted-foreground text-xs">{registros.length - i}</td>
                          <td className="py-1.5 pr-3 font-plate font-bold">{r.placa}</td>
                          <td className="py-1.5 font-mono text-xs text-muted-foreground">{nuncStr(r)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
          <p className="text-xs text-muted-foreground text-center">Puede cerrar esta ventana</p>
        </div>
      </div>
    )
  }

  const nuncBase = `${nunc.dpto}-${nunc.municipio}-${nunc.entidad}-${nunc.unidad}-${nunc.anio}`

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header fijo */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">{sesion!.entidad_nombre}</span>
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Activa</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{sesion!.nombre_peritos}</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={finalizarSesion} disabled={cerrando}>
              {cerrando ? <Loader2 className="h-3 w-3 animate-spin" /> : "Finalizar"}
            </Button>
          </div>

          {/* Toggle vistas */}
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setVista("registrar")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors ${vista === "registrar" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
            >
              <PlusCircle className="h-4 w-4" />
              Registrar
            </button>
            <button
              onClick={() => setVista("lista")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors ${vista === "lista" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
            >
              <ClipboardList className="h-4 w-4" />
              Registros
              {registros.length > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${vista === "lista" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted-foreground/20"}`}>
                  {registros.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 p-4">
        <div className="max-w-lg mx-auto">

          {/* Vista: Registrar */}
          {vista === "registrar" && (
            <div className="space-y-4">
              {/* NUNC base editable */}
              <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">NUNC base</p>
                  {editandoNuncBase ? (
                    <div className="grid grid-cols-5 gap-1 mt-1">
                      {(["dpto", "municipio", "entidad", "unidad"] as const).map((c) => (
                        <Input key={c} value={nunc[c]} onChange={(e) => setNunc((n) => ({ ...n, [c]: e.target.value }))} className="h-7 text-xs px-1.5 font-mono" placeholder={c.slice(0, 3)} />
                      ))}
                      <Input value={String(nunc.anio)} onChange={(e) => setNunc((n) => ({ ...n, anio: Number(e.target.value) }))} className="h-7 text-xs px-1.5 font-mono" />
                    </div>
                  ) : (
                    <p className="font-mono text-sm truncate">{nuncBase}</p>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 ml-2" onClick={() => setEditandoNuncBase((v) => !v)}>
                  {editandoNuncBase ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                </Button>
              </div>

              <form onSubmit={guardarVehiculo} className="space-y-3">
                <div className="space-y-2">
                  <Label>Placa *</Label>
                  <Input placeholder="ABC123" value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} className="font-plate text-lg" autoFocus />
                </div>
                <div className="space-y-2">
                  <Label>Consecutivo NUNC *</Label>
                  <Input placeholder="00300" value={nunc.consecutivo} onChange={(e) => setNunc((n) => ({ ...n, consecutivo: e.target.value }))} className="font-mono" />
                  {nunc.consecutivo && <p className="text-xs text-muted-foreground font-mono">{nuncBase}-{nunc.consecutivo}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Observaciones <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <Textarea placeholder="Condiciones del vehículo, notas..." value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={2} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Guardar y registrar otro
                </Button>
              </form>
            </div>
          )}

          {/* Vista: Lista */}
          {vista === "lista" && (
            <div>
              {registros.length === 0 ? (
                <div className="text-center py-16">
                  <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Sin vehículos registrados aún</p>
                  <Button variant="link" className="mt-2" onClick={() => setVista("registrar")}>Registrar el primero</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {registros.map((r, i) => {
                    const accion = getAccion(r.id)
                    const ed = editData[r.id] ?? r

                    if (accion === "confirmando_eliminar") {
                      return (
                        <div key={r.id} className="rounded-lg border border-red-200 bg-red-50 p-3">
                          <p className="text-sm font-medium text-red-800 mb-0.5">¿Eliminar <span className="font-plate">{r.placa}</span>?</p>
                          <p className="text-xs text-red-600 font-mono mb-2">{nuncStr(r)}</p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => eliminarRegistro(r.id)} disabled={loading}>
                              {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}Sí, eliminar
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setAccion(r.id, "normal")}>Cancelar</Button>
                          </div>
                        </div>
                      )
                    }

                    if (accion === "editando") {
                      return (
                        <div key={r.id} className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Placa</p>
                              <Input value={ed.placa} onChange={(e) => setEditData((p) => ({ ...p, [r.id]: { ...ed, placa: e.target.value.toUpperCase() } }))} className="h-8 font-plate" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Consecutivo</p>
                              <Input value={ed.nunc_consecutivo} onChange={(e) => setEditData((p) => ({ ...p, [r.id]: { ...ed, nunc_consecutivo: e.target.value } }))} className="h-8 font-mono" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Observaciones</p>
                            <Input value={ed.observaciones} onChange={(e) => setEditData((p) => ({ ...p, [r.id]: { ...ed, observaciones: e.target.value } }))} className="h-8" placeholder="Opcional" />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="h-8 flex-1" onClick={() => guardarEdicion(r.id)} disabled={loading}>
                              <Save className="h-3.5 w-3.5 mr-1" />Guardar
                            </Button>
                            <Button size="sm" variant="outline" className="h-8" onClick={() => setAccion(r.id, "normal")}>Cancelar</Button>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={r.id} className="flex items-center gap-3 rounded-lg border bg-background p-3">
                        <span className="text-xs text-muted-foreground w-6 text-right flex-shrink-0">{registros.length - i}.</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="font-plate font-bold">{r.placa}</span>
                            <span className="font-mono text-xs text-muted-foreground truncate">{nuncStr(r)}</span>
                          </div>
                          {r.observaciones && <p className="text-xs text-muted-foreground truncate mt-0.5">{r.observaciones}</p>}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => iniciarEdicion(r)}>
                            <Pencil className="h-3.5 w-3.5 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAccion(r.id, "confirmando_eliminar")}>
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
