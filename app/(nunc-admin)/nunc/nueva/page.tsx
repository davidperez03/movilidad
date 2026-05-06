"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Copy, Check, Scale } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const ENTIDADES = [
  "Policía Nacional",
  "Fiscalía General de la Nación",
  "CTI",
  "DIJIN",
  "SIJIN",
  "Otro",
]

const ANO_ACTUAL = new Date().getFullYear()

export default function NuevaSesionPeritajeAdminPage() {
  const [loading, setLoading] = useState(false)
  const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null)
  const [sesionId, setSesionId] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  const [form, setForm] = useState({
    entidad_nombre: "",
    nombre_peritos: "",
    nunc_dpto: "",
    nunc_municipio: "",
    nunc_entidad: "",
    nunc_unidad: "",
    nunc_anio: ANO_ACTUAL,
    observaciones: "",
  })

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.entidad_nombre || !form.nombre_peritos || !form.nunc_dpto ||
        !form.nunc_municipio || !form.nunc_entidad || !form.nunc_unidad) {
      toast.error("Complete todos los campos obligatorios")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/nunc/sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, nunc_anio: Number(form.nunc_anio) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al crear")
      setCodigoGenerado(data.codigo)
      setSesionId(data.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear la sesión")
    } finally {
      setLoading(false)
    }
  }

  async function copiar() {
    if (!codigoGenerado) return
    await navigator.clipboard.writeText(codigoGenerado)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (codigoGenerado) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Sesión creada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-green-700">
              Comparta este código con el personal de nunc. Expira a medianoche.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white border-2 border-green-300 rounded-lg px-4 py-3 text-center">
                <span className="font-mono text-3xl font-bold tracking-widest text-green-800">
                  {codigoGenerado}
                </span>
              </div>
              <Button variant="outline" size="icon" onClick={copiar}>
                {copiado ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-green-600 text-center">
              Los peritos ingresan a <strong>/nunc/acceso</strong> y digitan este código
            </p>
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/nunc/${sesionId}`}>Ver sesión</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/nunc">Volver al listado</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/nunc">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Nueva sesión de nunc</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Entidad y peritos</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Entidad *</Label>
              <Select onValueChange={(v) => set("entidad_nombre", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione la entidad" />
                </SelectTrigger>
                <SelectContent>
                  {ENTIDADES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nombre del perito / equipo *</Label>
              <Input
                placeholder="Ej: Cap. Garcia - Ten. Rodriguez"
                value={form.nombre_peritos}
                onChange={(e) => set("nombre_peritos", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Datos NUNC por defecto</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Dpto *</Label>
                <Input placeholder="85" maxLength={3} value={form.nunc_dpto} onChange={(e) => set("nunc_dpto", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Municipio *</Label>
                <Input placeholder="001" maxLength={3} value={form.nunc_municipio} onChange={(e) => set("nunc_municipio", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Entidad código *</Label>
                <Input placeholder="60" maxLength={5} value={form.nunc_entidad} onChange={(e) => set("nunc_entidad", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Unidad *</Label>
                <Input placeholder="01169" maxLength={10} value={form.nunc_unidad} onChange={(e) => set("nunc_unidad", e.target.value)} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Año</Label>
                <Input type="number" value={form.nunc_anio} onChange={(e) => set("nunc_anio", Number(e.target.value))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <Label>Observaciones internas</Label>
              <Textarea
                placeholder="Notas sobre la visita (opcional)"
                value={form.observaciones}
                onChange={(e) => set("observaciones", e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Generando código..." : "Generar código de sesión"}
        </Button>
      </form>
    </div>
  )
}
