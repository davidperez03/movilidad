"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { History, Loader2, ArrowRightLeft, ArrowDownToLine, Calendar, Building2 } from "lucide-react"
import { ESTADOS_CONFIG } from "@/lib/movilidad/config"
import { toast } from "sonner"
import { formatDateShort, formatDateForDisplay } from "@/lib/utils"

interface HistorialProcesoDialogProps {
  cuentaId: string
  placa: string
}

interface ProcesoHistorial {
  proceso_tipo: string
  proceso_id: string
  estado: string
  fecha_tramite: string
  fecha_completado: string | null
  organismo_nombre: string
  creado_por_nombre: string
  observaciones: string | null
  creado_en: string
}

export function HistorialProcesoDialog({ cuentaId, placa }: HistorialProcesoDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [historial, setHistorial] = useState<ProcesoHistorial[]>([])

  const cargarHistorial = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .rpc('obtener_historial_procesos_vehiculo', { p_cuenta_id: cuentaId })

    if (error) {
      toast.error('Error al cargar historial')
    } else {
      setHistorial(data || [])
    }

    setLoading(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen && historial.length === 0) {
      cargarHistorial()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          <History className="h-3.5 w-3.5 mr-1.5" />
          Ver historial
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historial de Procesos - {placa}</DialogTitle>
          <DialogDescription>
            Todos los procesos (traslados y radicaciones) realizados en este vehículo
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : historial.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No hay historial de procesos para este vehículo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {historial.map((proceso, index) => {
              const Icono = proceso.proceso_tipo === 'traslado' ? ArrowRightLeft : ArrowDownToLine
              const esFinal = proceso.fecha_completado !== null

              return (
                <div
                  key={proceso.proceso_id}
                  className={`p-4 rounded-lg border ${
                    index === 0 ? 'bg-muted/50 border-primary/50' : 'bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icono className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium capitalize">{proceso.proceso_tipo}</span>
                      {index === 0 && (
                        <Badge variant="outline" className="text-xs">Más reciente</Badge>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={ESTADOS_CONFIG[proceso.estado]?.color || ""}
                    >
                      {ESTADOS_CONFIG[proceso.estado]?.label || proceso.estado}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {proceso.proceso_tipo === 'traslado' ? 'Destino' : 'Origen'}
                        </p>
                        <p className="font-medium">{proceso.organismo_nombre}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha trámite</p>
                        <p className="font-medium">{formatDateForDisplay(proceso.fecha_tramite)}</p>
                      </div>
                    </div>

                    {esFinal && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha completado</p>
                          <p className="font-medium">{formatDateShort(proceso.fecha_completado!)}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-muted-foreground">Creado por</p>
                      <p className="font-medium">{proceso.creado_por_nombre}</p>
                    </div>
                  </div>

                  {proceso.observaciones && (
                    <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                      <p className="text-xs text-muted-foreground mb-1">Observaciones:</p>
                      <p>{proceso.observaciones}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
