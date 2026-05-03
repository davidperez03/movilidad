'use client'

import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, ArrowRight, Clock } from 'lucide-react'
import { getCat } from '@/app/superadmin/auditoria/auditoria-columns'
import { capitalizeName } from '@/lib/utils/capitalize'

interface EventoHistorial {
  id: string
  modulo: string
  accion: string
  valor_anterior: string | null
  valor_nuevo: string | null
  usuario_nombre: string | null
  usuario_correo: string | null
  creado_en: string
  detalles: Record<string, unknown> | null
}

interface HistorialEntidadProps {
  tipo: string | null
  id: string | null
  titulo?: string
  open: boolean
  onClose: () => void
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getModuloColor(modulo: string): string {
  const colors: Record<string, string> = {
    sistema:      'bg-slate-100 text-slate-700',
    movilidad:    'bg-teal-100 text-teal-700',
    parqueadero:  'bg-cyan-100 text-cyan-700',
    inventarios:  'bg-amber-100 text-amber-700',
  }
  return colors[modulo] ?? 'bg-gray-100 text-gray-700'
}

export function HistorialEntidad({ tipo, id, titulo, open, onClose }: HistorialEntidadProps) {
  const [eventos, setEventos] = useState<EventoHistorial[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !tipo || !id) return

    setLoading(true)
    setEventos([])

    fetch(`/api/admin/auditoria/entidad?tipo=${encodeURIComponent(tipo)}&id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data) => setEventos(data.data ?? []))
      .catch(() => setEventos([]))
      .finally(() => setLoading(false))
  }, [open, tipo, id])

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Historial completo
            {titulo && <span className="text-muted-foreground font-normal">— {titulo}</span>}
          </SheetTitle>
          {!loading && (
            <p className="text-xs text-muted-foreground">
              {eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'} · orden cronológico
            </p>
          )}
        </SheetHeader>

        <div className="px-6 py-5">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && eventos.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Sin eventos registrados para esta entidad.
            </p>
          )}

          {!loading && eventos.length > 0 && (
            <ol className="relative border-l border-border ml-2 space-y-0">
              {eventos.map((ev, i) => {
                const cat = getCat(ev.accion)
                const esUltimo = i === eventos.length - 1
                return (
                  <li key={ev.id} className={`ml-4 ${esUltimo ? '' : 'pb-6'}`}>
                    {/* Punto de la línea de tiempo */}
                    <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-background bg-border" />

                    <div className="space-y-1">
                      {/* Fecha */}
                      <time className="text-xs text-muted-foreground">{formatFecha(ev.creado_en)}</time>

                      {/* Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge className={`${cat.color} text-xs`}>{cat.label}</Badge>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getModuloColor(ev.modulo)}`}>
                          {ev.modulo}
                        </span>
                      </div>

                      {/* Acción legible */}
                      <p className="text-sm font-medium">
                        {ev.accion.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>

                      {/* Cambio de valor */}
                      {(ev.valor_anterior || ev.valor_nuevo) && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {ev.valor_anterior && (
                            <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded ring-1 ring-red-200">
                              {ev.valor_anterior.replace(/_/g, ' ')}
                            </span>
                          )}
                          {ev.valor_anterior && ev.valor_nuevo && (
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          )}
                          {ev.valor_nuevo && (
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded ring-1 ring-green-200">
                              {ev.valor_nuevo.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Usuario */}
                      <p className="text-xs text-muted-foreground">
                        {ev.usuario_nombre
                          ? capitalizeName(ev.usuario_nombre)
                          : ev.usuario_correo ?? 'Sistema'}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
