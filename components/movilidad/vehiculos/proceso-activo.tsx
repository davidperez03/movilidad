import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRightLeft, ArrowDownToLine, AlertTriangle } from "lucide-react"
import { formatDateForDisplay, formatDateShort } from "@/lib/utils"
import { formatearEstadoProceso } from "@/lib/movilidad/formatters"
import { CambiarEstado } from "@/components/movilidad/cambiar-estado"
import { AgregarNovedad } from "@/components/movilidad/agregar-novedad"
import { AgregarDatosTransporte } from "@/components/movilidad/agregar-datos-transporte"
import { ResolverNovedad } from "@/components/movilidad/resolver-novedad"

interface ProcesoActivoProps {
  proceso: any
  novedades: any[]
  placa: string
}

export function ProcesoActivo({ proceso, novedades, placa }: ProcesoActivoProps) {
  if (!proceso?.proceso_id) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Sin procesos activos</p>
              <p className="text-xs text-muted-foreground">
                Este vehículo no tiene procesos en curso
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <Button asChild size="sm">
                <Link href={`/movilidad/traslados/nuevo?placa=${placa}`}>
                  <ArrowRightLeft className="h-3 w-3 mr-1.5" />
                  Traslado
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/movilidad/radicaciones/nueva?placa=${placa}`}>
                  <ArrowDownToLine className="h-3 w-3 mr-1.5" />
                  Radicación
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {proceso.proceso_tipo === "traslado" ? (
                <ArrowRightLeft className="h-5 w-5" />
              ) : (
                <ArrowDownToLine className="h-5 w-5" />
              )}
              Proceso Activo: {proceso.proceso_tipo === "traslado" ? "Traslado" : "Radicación"}
            </CardTitle>
            <CardDescription>
              Este vehículo tiene un proceso en curso
            </CardDescription>
          </div>
          <Badge
            variant={proceso.proceso_estado === "con_novedades" ? "destructive" : "default"}
          >
            {formatearEstadoProceso(proceso.proceso_estado)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {proceso.proceso_tipo === "traslado" ? "Destino" : "Origen"}
            </p>
            <p className="font-medium">{proceso.ciudad}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha trámite</p>
            <p className="font-medium">
              {formatDateForDisplay(proceso.fecha_tramite)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Vencimiento</p>
            <p className={`font-medium ${
              (proceso.dias_restantes ?? 0) < 7 ? "text-orange-600" : ""
            }`}>
              {formatDateForDisplay(proceso.fecha_vencimiento)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Días hábiles restantes</p>
            <p className={`font-medium ${
              (proceso.dias_restantes ?? 0) < 7
                ? "text-orange-600"
                : "text-green-600"
            }`}>
              {proceso.dias_restantes ?? 0} días
            </p>
          </div>
        </div>

        {/* Información de auditoría */}
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Creado por</p>
            <p className="font-medium">{proceso.creador?.nombre_completo || 'Sin información'}</p>
          </div>
          {proceso.actualizador && (
            <div>
              <p className="text-xs text-muted-foreground">Última actualización por</p>
              <p className="font-medium">{proceso.actualizador?.nombre_completo}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Actualizado</p>
            <p className="font-medium">
              {formatDateShort(proceso.actualizado_en)}
            </p>
          </div>
        </div>

        {proceso.observaciones && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground mb-1">Observaciones:</p>
            <p className="text-sm">{proceso.observaciones}</p>
          </div>
        )}

        {/* Datos de transporte - Solo para traslados en estado enviado_organismo */}
        {proceso.proceso_tipo === "traslado" && proceso.proceso_estado === "enviado_organismo" && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Información de Transporte</p>
                <div className="text-sm text-blue-700 space-y-1">
                  {proceso.empresa_transporte?.nombre && (
                    <p><strong>Empresa:</strong> {proceso.empresa_transporte.nombre}</p>
                  )}
                  {proceso.numero_guia && (
                    <p><strong>Número de guía:</strong> {proceso.numero_guia}</p>
                  )}
                  {!proceso.empresa_transporte && !proceso.numero_guia && (
                    <p className="text-blue-600 italic">No se han agregado datos de transporte</p>
                  )}
                </div>
              </div>
              <AgregarDatosTransporte
                trasladoId={proceso.proceso_id}
                empresaActualId={proceso.empresa_transportadora_id}
                numeroGuiaActual={proceso.numero_guia}
              />
            </div>
          </div>
        )}

        {/* Acciones del proceso */}
        <div className="flex gap-2">
          <CambiarEstado
            procesoId={proceso.proceso_id}
            procesoTipo={proceso.proceso_tipo as "traslado" | "radicacion"}
            estadoActual={proceso.proceso_estado}
          />
          <AgregarNovedad
            procesoId={proceso.proceso_id}
            procesoTipo={proceso.proceso_tipo as "traslado" | "radicacion"}
          />
        </div>

        {/* Novedades del proceso activo */}
        {novedades.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Novedades Activas ({novedades.length})
            </h3>
            <div className="space-y-2">
              {novedades.map((novedad) => (
                <div
                  key={novedad.id}
                  className={`p-3 rounded-md border ${
                    novedad.estado === "resuelta"
                      ? "bg-green-50 border-green-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          novedad.prioridad === "critica" ? "destructive" :
                          novedad.prioridad === "alta" ? "destructive" :
                          "secondary"
                        }
                      >
                        {novedad.prioridad}
                      </Badge>
                      <Badge variant="outline">
                        {formatearEstadoProceso(novedad.tipo_novedad)}
                      </Badge>
                    </div>
                    <Badge variant={novedad.estado === "resuelta" ? "default" : "secondary"}>
                      {formatearEstadoProceso(novedad.estado)}
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{novedad.descripcion}</p>
                  {novedad.solucion && novedad.estado === "resuelta" && (
                    <div className="mb-2 p-2 bg-white rounded border">
                      <p className="text-xs font-medium text-green-700 mb-1">Solución:</p>
                      <p className="text-sm text-green-900">{novedad.solucion}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Creado por: {novedad.creador?.nombre_completo}</span>
                      <span>
                        {formatDateShort(novedad.creado_en)}
                      </span>
                      {novedad.estado === "resuelta" && (
                        <>
                          <span>•</span>
                          <span>Resuelto por: {novedad.resolutor?.nombre_completo}</span>
                        </>
                      )}
                    </div>
                    {novedad.estado !== "resuelta" && (
                      <ResolverNovedad
                        novedadId={novedad.id}
                        descripcion={novedad.descripcion}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
