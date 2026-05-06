import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CerrarSesionNunc } from "@/components/nunc/cerrar-sesion"
import { CopiarCodigoNunc } from "@/components/nunc/copiar-codigo"
import { ExportarRegistrosNunc } from "@/components/nunc/exportar-registros"
import type { FilaRegistroNunc } from "@/lib/nunc/reportes/tipos"

function nuncCompleto(r: { nunc_dpto: string; nunc_municipio: string; nunc_entidad: string; nunc_unidad: string; nunc_anio: number; nunc_consecutivo: string }) {
  return `${r.nunc_dpto}-${r.nunc_municipio}-${r.nunc_entidad}-${r.nunc_unidad}-${r.nunc_anio}-${r.nunc_consecutivo}`
}

function estadoBadge(estado: string) {
  if (estado === "activa")  return <Badge className="bg-green-100 text-green-700 border-green-200">Activa</Badge>
  if (estado === "cerrada") return <Badge variant="secondary">Cerrada</Badge>
  return <Badge variant="destructive">Expirada</Badge>
}

function formatearHoraColombia(fechaIso: string) {
  return new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" }).format(new Date(fechaIso))
}

function formatearExpiracion(fechaIso: string) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" }).format(new Date(fechaIso))
}

export default async function DetalleSesionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: sesion }, { data: registros }] = await Promise.all([
    supabase.from("nunc_sesiones").select("*").eq("id", id).single(),
    supabase.from("nunc_registros").select("*").eq("sesion_id", id).order("registrado_en", { ascending: true }),
  ])

  if (!sesion) notFound()

  const filasExcel: FilaRegistroNunc[] = (registros ?? []).map(r => ({
    placa:            r.placa,
    nunc_completo:    nuncCompleto(r),
    nunc_dpto:        r.nunc_dpto,
    nunc_municipio:   r.nunc_municipio,
    nunc_entidad:     r.nunc_entidad,
    nunc_unidad:      r.nunc_unidad,
    nunc_anio:        r.nunc_anio,
    nunc_consecutivo: r.nunc_consecutivo,
    observaciones:    r.observaciones ?? null,
    registrado_en:    r.registrado_en,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/nunc">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Link>
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Sesión de Estudios NUNC
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl font-bold tracking-widest">{sesion.codigo}</span>
                <CopiarCodigoNunc codigo={sesion.codigo} />
              </div>
              {estadoBadge(sesion.estado)}
            </div>
            <div>
              <p className="font-semibold">{sesion.entidad_nombre}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {sesion.nombre_peritos}
              </p>
            </div>
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p>NUNC base: <span className="font-mono">{sesion.nunc_dpto}-{sesion.nunc_municipio}-{sesion.nunc_entidad}-{sesion.nunc_unidad}-{sesion.nunc_anio}</span></p>
              <p>Expira: {formatearExpiracion(sesion.expira_en)}</p>
            </div>
            {sesion.observaciones && (
              <p className="text-sm text-muted-foreground border-t pt-2">{sesion.observaciones}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full gap-4">
            <div>
              <p className="text-3xl font-bold">{registros?.length ?? 0}</p>
              <p className="text-sm text-muted-foreground">
                vehículo{(registros?.length ?? 0) !== 1 ? "s" : ""} registrado{(registros?.length ?? 0) !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <ExportarRegistrosNunc
                registros={filasExcel}
                codigoSesion={sesion.codigo}
                entidad={sesion.entidad_nombre}
              />
              {sesion.estado === "activa" && (
                <CerrarSesionNunc codigo={sesion.codigo} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vehículos registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {!registros || registros.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Sin registros aún</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 pr-4 font-medium">#</th>
                    <th className="text-left py-2 pr-4 font-medium">Placa</th>
                    <th className="text-left py-2 pr-4 font-medium">NUNC completo</th>
                    <th className="text-left py-2 pr-4 font-medium hidden md:table-cell">Observaciones</th>
                    <th className="text-left py-2 font-medium hidden sm:table-cell">Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((r, i) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                      <td className="py-2 pr-4 font-plate font-semibold">{r.placa}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{nuncCompleto(r)}</td>
                      <td className="py-2 pr-4 text-muted-foreground hidden md:table-cell">{r.observaciones || "—"}</td>
                      <td className="py-2 text-muted-foreground hidden sm:table-cell">{formatearHoraColombia(r.registrado_en)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
