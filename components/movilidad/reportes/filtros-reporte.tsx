'use client'

// =====================================================
// FILTROS DE REPORTE
// Componente reutilizable para filtrar reportes
// =====================================================

import { useState, useEffect } from 'react'
import { X, Filter } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ESTADOS_CONFIG } from '@/lib/movilidad/config'
import type { FiltrosReporte, TipoReporte, Organismo, Responsable } from '@/lib/movilidad/reportes/tipos'

interface FiltrosReporteProps {
  filtros: FiltrosReporte
  onFilterChange: (filtros: FiltrosReporte) => void
  tipoReporte: TipoReporte
  organismos: Organismo[]
  responsables: Responsable[]
}

export function FiltrosReporteComponent({
  filtros,
  onFilterChange,
  tipoReporte,
  organismos,
  responsables,
}: FiltrosReporteProps) {
  const [filtrosActivos, setFiltrosActivos] = useState(0)

  // Contar filtros activos
  useEffect(() => {
    let count = 0
    if (filtros.fechaInicio) count++
    if (filtros.fechaFin) count++
    if (filtros.estado !== 'todos') count++
    if (filtros.tipoProceso !== 'todos') count++
    setFiltrosActivos(count)
  }, [filtros])

  const handleLimpiar = () => {
    onFilterChange({
      fechaInicio: null,
      fechaFin: null,
      estado: 'todos',
      organismoId: 'todos',
      responsable: 'todos',
      tipoProceso: 'todos',
    })
  }

  // Obtener estados disponibles según configuración
  const estadosDisponibles = Object.entries(ESTADOS_CONFIG).map(([valor, config]) => ({
    valor,
    label: config.label,
  }))

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <h3 className="font-semibold">Filtros</h3>
            {filtrosActivos > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filtrosActivos} activo{filtrosActivos > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          {filtrosActivos > 0 && (
            <Button variant="ghost" size="sm" onClick={handleLimpiar}>
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Fecha Inicio */}
          <div className="space-y-2">
            <Label htmlFor="fechaInicio">Fecha Inicio</Label>
            <Input
              id="fechaInicio"
              type="date"
              value={filtros.fechaInicio || ''}
              onChange={(e) =>
                onFilterChange({
                  ...filtros,
                  fechaInicio: e.target.value || null,
                })
              }
            />
          </div>

          {/* Fecha Fin */}
          <div className="space-y-2">
            <Label htmlFor="fechaFin">Fecha Fin</Label>
            <Input
              id="fechaFin"
              type="date"
              value={filtros.fechaFin || ''}
              onChange={(e) =>
                onFilterChange({
                  ...filtros,
                  fechaFin: e.target.value || null,
                })
              }
            />
          </div>

          {/* Estado - solo para ciertos reportes */}
          {(tipoReporte === 'activos' || tipoReporte === 'por-vencer') && (
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={filtros.estado} onValueChange={(value) => onFilterChange({ ...filtros, estado: value })}>
                <SelectTrigger id="estado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  {estadosDisponibles.map((estado) => (
                    <SelectItem key={estado.valor} value={estado.valor}>
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tipo de Proceso */}
          <div className="space-y-2">
            <Label htmlFor="tipoProceso">Tipo de Proceso</Label>
            <Select
              value={filtros.tipoProceso}
              onValueChange={(value) => onFilterChange({ ...filtros, tipoProceso: value as FiltrosReporte['tipoProceso'] })}
            >
              <SelectTrigger id="tipoProceso">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="traslado">Traslado</SelectItem>
                <SelectItem value="radicacion">Radicación</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
