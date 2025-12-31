"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FacetedFilter } from "@/components/ui/data-table/faceted-filter"
import { Search, X, Car, Bus, Truck, Circle, CheckCircle2, XCircle } from "lucide-react"

interface CuentasFiltersProps {
  onFilterChange: (filters: CuentasFilterState) => void
  filters: CuentasFilterState
}

export interface CuentasFilterState {
  search: string
  tipoServicio: Set<string>
  estadoProceso: Set<string>
}

const tipoServicioOptions = [
  { label: "Particular", value: "particular", icon: Car },
  { label: "Público", value: "publico", icon: Bus },
  { label: "Otro", value: "otro", icon: Truck },
]

const estadoProcesoOptions = [
  { label: "En proceso activo", value: "con_proceso", icon: CheckCircle2 },
  { label: "Sin proceso", value: "sin_proceso", icon: Circle },
  { label: "Completado", value: "completado", icon: XCircle },
]

export function CuentasFilters({ onFilterChange, filters }: CuentasFiltersProps) {
  const hasActiveFilters =
    filters.search !== "" ||
    filters.tipoServicio.size > 0 ||
    filters.estadoProceso.size > 0

  const handleReset = () => {
    onFilterChange({
      search: "",
      tipoServicio: new Set(),
      estadoProceso: new Set(),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa o N° cuenta..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value.toUpperCase() })}
            className="pl-9 h-9"
          />
        </div>

        {/* Filtros con FacetedFilter */}
        <div className="flex flex-wrap gap-2">
          <FacetedFilter
            title="Tipo de Servicio"
            options={tipoServicioOptions}
            selectedValues={filters.tipoServicio}
            onSelectedValuesChange={(values) =>
              onFilterChange({ ...filters, tipoServicio: values })
            }
          />
          <FacetedFilter
            title="Estado del Proceso"
            options={estadoProcesoOptions}
            selectedValues={filters.estadoProceso}
            onSelectedValuesChange={(values) =>
              onFilterChange({ ...filters, estadoProceso: values })
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
