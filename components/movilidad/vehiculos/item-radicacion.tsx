import { Badge } from "@/components/ui/badge"
import { formatDateForDisplay, formatDateShort } from "@/lib/utils"
import { formatearEstadoProceso } from "@/lib/movilidad/formatters"
import type { RadicacionHistorial } from "@/lib/movilidad/types"

interface ItemRadicacionProps {
  radicacion: RadicacionHistorial
}

export function ItemRadicacion({ radicacion }: ItemRadicacionProps) {
  return (
    <div
      className={`border rounded-md p-3 space-y-2 ${
        radicacion.estado === "devuelto"
          ? "border-red-300 bg-red-50"
          : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={
          radicacion.estado === "devuelto"
            ? "bg-red-100 text-red-700 border-red-300"
            : ""
        }>
          {formatearEstadoProceso(radicacion.estado)}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {formatDateShort(radicacion.creado_en)}
        </span>
      </div>
      <div className="text-sm space-y-1">
        <p><strong>Origen:</strong> {radicacion.organismo?.nombre || 'Sin información'}</p>
        <p><strong>Creado por:</strong> {radicacion.creador?.nombre_completo || 'Sin información'}</p>
        <p><strong>Fecha trámite:</strong> {formatDateForDisplay(radicacion.fecha_tramite)}</p>
        <p><strong>Vencimiento:</strong> {formatDateForDisplay(radicacion.fecha_vencimiento)}</p>
        {radicacion.fecha_completado && (
          <p><strong>Completado:</strong> {formatDateForDisplay(radicacion.fecha_completado)}</p>
        )}
        {radicacion.observaciones && (
          <div className={`mt-2 p-2 rounded ${
            radicacion.estado === "devuelto"
              ? "bg-red-100 border border-red-200"
              : "bg-muted"
          }`}>
            <p className={`text-sm font-medium mb-1 ${
              radicacion.estado === "devuelto"
                ? "text-red-900"
                : ""
            }`}>
              {radicacion.estado === "devuelto" ? "Motivo de devolución:" : "Observaciones:"}
            </p>
            <p className={`text-sm ${
              radicacion.estado === "devuelto"
                ? "text-red-800"
                : "text-muted-foreground"
            }`}>
              {radicacion.observaciones}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
