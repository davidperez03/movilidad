"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FacetedFilter } from "@/components/ui/data-table/faceted-filter"
import { Search, X, Circle, AlertTriangle, CheckCircle2, Clock, XCircle, FileX } from "lucide-react"

interface VehicleFiltersProps {
  onFilterChange: (filters: FilterState) => void
  filters: FilterState
}

export interface FilterState {
  search: string
  procesoTipo: Set<string>
  estado: Set<string>
  prioridad: Set<string>
}

const procesoTipoOptions = [
  { label: "Sin proceso", value: "sin_proceso", icon: Circle },
  { label: "Traslado", value: "traslado", icon: CheckCircle2 },
  { label: "Radicación", value: "radicacion", icon: FileX },
]

const estadoOptions = [
  { label: "Sin asignar", value: "sin_asignar", icon: Circle },
  { label: "Enviado", value: "enviado_organismo", icon: CheckCircle2 },
  { label: "Recibido", value: "recibido", icon: Clock },
  { label: "Revisado", value: "revisado", icon: CheckCircle2 },
  { label: "Con novedades", value: "con_novedades", icon: AlertTriangle },
  { label: "Pendiente radicar", value: "pendiente_radicar", icon: Clock },
  { label: "Enviado devolución", value: "enviado_devolucion", icon: AlertTriangle },
  { label: "Trasladado", value: "trasladado", icon: CheckCircle2 },
  { label: "Radicado", value: "radicado", icon: CheckCircle2 },
  { label: "Devuelto", value: "devuelto", icon: XCircle },
]

const prioridadOptions = [
  { label: "Urgente", value: "urgente", icon: AlertTriangle },
  { label: "Vencido", value: "vencido", icon: XCircle },
  { label: "Alta", value: "alta", icon: AlertTriangle },
  { label: "Media", value: "media", icon: Clock },
  { label: "Baja", value: "baja", icon: CheckCircle2 },
]

export function VehicleFilters({ onFilterChange, filters }: VehicleFiltersProps) {
  const hasActiveFilters =
    filters.search !== "" ||
    filters.procesoTipo.size > 0 ||
    filters.estado.size > 0 ||
    filters.prioridad.size > 0

  const handleReset = () => {
    onFilterChange({
      search: "",
      procesoTipo: new Set(),
      estado: new Set(),
      prioridad: new Set(),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value.toUpperCase() })}
            className="pl-9 h-9"
          />
        </div>

        {/* Filtros con FacetedFilter */}
        <div className="flex flex-wrap gap-2">
          <FacetedFilter
            title="Tipo de Proceso"
            options={procesoTipoOptions}
            selectedValues={filters.procesoTipo}
            onSelectedValuesChange={(values) =>
              onFilterChange({ ...filters, procesoTipo: values })
            }
          />
          <FacetedFilter
            title="Estado"
            options={estadoOptions}
            selectedValues={filters.estado}
            onSelectedValuesChange={(values) =>
              onFilterChange({ ...filters, estado: values })
            }
          />
          <FacetedFilter
            title="Prioridad"
            options={prioridadOptions}
            selectedValues={filters.prioridad}
            onSelectedValuesChange={(values) =>
              onFilterChange({ ...filters, prioridad: values })
            }
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="h-9 px-2 lg:px-3"
            >
              Limpiar
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
