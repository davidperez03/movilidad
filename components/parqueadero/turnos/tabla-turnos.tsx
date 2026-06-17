"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { VistaTurno } from "@/lib/parqueadero/types"

function horaCol(ts: string) {
  return new Date(ts).toLocaleString("es-CO", {
    timeZone: "America/Bogota", hour: "2-digit", minute: "2-digit", hour12: false,
  })
}

function fmtHoras(h: number | null) {
  if (h == null) return "—"
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${hh}h ${mm.toString().padStart(2, "0")}m`
}

export function TablaTurnos({ turnos }: { turnos: VistaTurno[] }) {
  if (!turnos.length) {
    return <p className="text-muted-foreground text-sm py-10 text-center">No hay turnos registrados</p>
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <table className="w-full text-sm min-w-[900px]">
        <thead>
          <tr className="border-b bg-muted/50 text-xs uppercase tracking-wide">
            <th className="text-left  px-3 py-3 font-medium">Turno</th>
            <th className="text-left  px-3 py-3 font-medium">Fecha</th>
            <th className="text-left  px-3 py-3 font-medium">Grúa</th>
            <th className="text-left  px-3 py-3 font-medium">Operadores</th>
            <th className="text-right px-3 py-3 font-medium">H. Inicio</th>
            <th className="text-right px-3 py-3 font-medium">H. Fin</th>
            <th className="text-right px-3 py-3 font-medium">H. Oper.</th>
            <th className="text-right px-3 py-3 font-medium">KM Ini</th>
            <th className="text-right px-3 py-3 font-medium">KM Fin</th>
            <th className="text-right px-3 py-3 font-medium">KM Rec.</th>
            <th className="text-center px-3 py-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          {turnos.map((t) => (
            <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
              <td className="px-3 py-3 capitalize">{t.tipo_turno}</td>
              <td className="px-3 py-3 tabular-nums">{new Date(t.fecha + "T12:00:00").toLocaleDateString("es-CO")}</td>
              <td className="px-3 py-3 font-medium">
                <Link href={`/parqueadero/turnos/${t.id}`} className="hover:underline text-foreground">
                  {t.placa}
                </Link>
              </td>
              <td className="px-3 py-3 text-muted-foreground max-w-[160px] truncate" title={t.operadores ?? ""}>
                {t.operadores ?? "—"}
              </td>
              <td className="px-3 py-3 text-right tabular-nums">{horaCol(t.hora_inicio)}</td>
              <td className="px-3 py-3 text-right tabular-nums">{t.hora_fin ? horaCol(t.hora_fin) : "—"}</td>
              <td className="px-3 py-3 text-right tabular-nums font-medium">{fmtHoras(t.horas_operadas)}</td>
              <td className="px-3 py-3 text-right tabular-nums">{t.km_inicio?.toLocaleString("es-CO") ?? "—"}</td>
              <td className="px-3 py-3 text-right tabular-nums">{t.km_fin?.toLocaleString("es-CO") ?? "—"}</td>
              <td className="px-3 py-3 text-right tabular-nums">{t.km_recorridos?.toLocaleString("es-CO") ?? "—"}</td>
              <td className="px-3 py-3 text-center">
                <Badge variant="outline" className={
                  t.estado === "abierto"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-muted-foreground text-muted-foreground"
                }>
                  {t.estado === "abierto" ? "Abierto" : "Cerrado"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
