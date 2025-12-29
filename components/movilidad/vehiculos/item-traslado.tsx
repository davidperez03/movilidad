import { Badge } from "@/components/ui/badge"
import { formatDateForDisplay, formatDateShort } from "@/lib/utils"
import { formatearEstadoProceso } from "@/lib/movilidad/formatters"
import { BotonDescargarRemision } from "@/components/movilidad/boton-descargar-remision"

interface ItemTrasladoProps {
  traslado: any
  placa: string
}

export function ItemTraslado({ traslado, placa }: ItemTrasladoProps) {
  return (
    <div
      className={`border rounded-md p-3 space-y-2 ${
        traslado.estado === "devuelto"
          ? "border-red-300 bg-red-50"
          : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={
          traslado.estado === "devuelto"
            ? "bg-red-100 text-red-700 border-red-300"
            : ""
        }>
          {formatearEstadoProceso(traslado.estado)}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {formatDateShort(traslado.creado_en)}
        </span>
      </div>
      <div className="text-sm space-y-1">
        <p><strong>Destino:</strong> {traslado.organismo?.nombre || 'Sin información'}</p>
        <p><strong>Creado por:</strong> {traslado.creador?.nombre_completo || 'Sin información'}</p>
        <p><strong>Fecha trámite:</strong> {formatDateForDisplay(traslado.fecha_tramite)}</p>
        <p><strong>Vencimiento:</strong> {formatDateForDisplay(traslado.fecha_vencimiento)}</p>
        {traslado.fecha_completado && (
          <p><strong>Completado:</strong> {formatDateForDisplay(traslado.fecha_completado)}</p>
        )}
        {traslado.empresa_transporte?.nombre && (
          <p className="text-blue-700">
            <strong>Empresa:</strong> {traslado.empresa_transporte.nombre}
          </p>
        )}
        {traslado.numero_guia && (
          <p className="text-blue-700">
            <strong>Guía:</strong> {traslado.numero_guia}
          </p>
        )}
        {traslado.observaciones && (
          <div className={`mt-2 p-2 rounded ${
            traslado.estado === "devuelto"
              ? "bg-red-100 border border-red-200"
              : "bg-muted"
          }`}>
            <p className={`text-sm font-medium mb-1 ${
              traslado.estado === "devuelto"
                ? "text-red-900"
                : ""
            }`}>
              {traslado.estado === "devuelto" ? "Motivo de devolución:" : "Observaciones:"}
            </p>
            <p className={`text-sm ${
              traslado.estado === "devuelto"
                ? "text-red-800"
                : "text-muted-foreground"
            }`}>
              {traslado.observaciones}
            </p>
          </div>
        )}
      </div>
      {(traslado.estado === "enviado_organismo" || traslado.estado === "trasladado") && (
        <div className="mt-2">
          <BotonDescargarRemision
            trasladoId={traslado.id}
            placa={placa}
            size="sm"
            variant="outline"
          />
        </div>
      )}
    </div>
  )
}
