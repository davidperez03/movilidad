"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X, Filter } from "lucide-react"

interface VehicleFiltersProps {
  onFilterChange: (filters: FilterState) => void
  filters: FilterState
}

export interface FilterState {
  search: string
  tipoServicio: string
  procesoTipo: string
  estado: string
}

const filterLabels: Record<string, string> = {
  search: "Búsqueda",
  tipoServicio: "Tipo de servicio",
  procesoTipo: "Tipo de proceso",
  estado: "Estado",
}

const valueLabels: Record<string, string> = {
  particular: "Particular",
  publico: "Público",
  otro: "Otro",
  sin_proceso: "Sin proceso",
  traslado: "Traslado",
  radicacion: "Radicación",
  sin_asignar: "Sin asignar",
  enviado_organismo: "Enviado a organismo",
  recibido: "Recibido",
  revisado: "Revisado",
  con_novedades: "Con novedades",
  pendiente_radicar: "Pendiente radicar",
  trasladado: "Trasladado",
  radicado: "Radicado",
  devuelto: "Devuelto",
}

export function VehicleFilters({ onFilterChange, filters }: VehicleFiltersProps) {
  const handleReset = () => {
    onFilterChange({
      search: "",
      tipoServicio: "todos",
      procesoTipo: "todos",
      estado: "todos",
    })
  }

  const handleRemoveFilter = (filterKey: keyof FilterState) => {
    if (filterKey === "search") {
      onFilterChange({ ...filters, [filterKey]: "" })
    } else {
      onFilterChange({ ...filters, [filterKey]: "todos" })
    }
  }

  const getActiveFilters = () => {
    const active: Array<{ key: keyof FilterState; label: string; value: string }> = []

    if (filters.search !== "") {
      active.push({ key: "search", label: filterLabels.search, value: filters.search })
    }
    if (filters.tipoServicio !== "todos") {
      active.push({
        key: "tipoServicio",
        label: filterLabels.tipoServicio,
        value: valueLabels[filters.tipoServicio] || filters.tipoServicio,
      })
    }
    if (filters.procesoTipo !== "todos") {
      active.push({
        key: "procesoTipo",
        label: filterLabels.procesoTipo,
        value: valueLabels[filters.procesoTipo] || filters.procesoTipo,
      })
    }
    if (filters.estado !== "todos") {
      active.push({
        key: "estado",
        label: filterLabels.estado,
        value: valueLabels[filters.estado] || filters.estado,
      })
    }

    return active
  }

  const activeFilters = getActiveFilters()
  const hasActiveFilters = activeFilters.length > 0

  return (
    <div className="space-y-4">
      {/* Filtros principales */}
      <div className="grid gap-3 md:grid-cols-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa o cuenta..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value.toUpperCase() })}
            className="pl-9"
          />
        </div>

        {/* Tipo de Servicio */}
        <Select
          value={filters.tipoServicio}
          onValueChange={(value) => onFilterChange({ ...filters, tipoServicio: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo de servicio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los servicios</SelectItem>
            <SelectItem value="particular">Particular</SelectItem>
            <SelectItem value="publico">Público</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>

        {/* Tipo de Proceso */}
        <Select
          value={filters.procesoTipo}
          onValueChange={(value) => onFilterChange({ ...filters, procesoTipo: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo de proceso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los procesos</SelectItem>
            <SelectItem value="sin_proceso">Sin proceso</SelectItem>
            <SelectItem value="traslado">Traslado</SelectItem>
            <SelectItem value="radicacion">Radicación</SelectItem>
          </SelectContent>
        </Select>

        {/* Estado */}
        <Select
          value={filters.estado}
          onValueChange={(value) => onFilterChange({ ...filters, estado: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="sin_asignar">Sin asignar</SelectItem>
            <SelectItem value="enviado_organismo">Enviado a organismo</SelectItem>
            <SelectItem value="recibido">Recibido</SelectItem>
            <SelectItem value="revisado">Revisado</SelectItem>
            <SelectItem value="con_novedades">Con novedades</SelectItem>
            <SelectItem value="pendiente_radicar">Pendiente radicar</SelectItem>
            <SelectItem value="trasladado">Trasladado</SelectItem>
            <SelectItem value="radicado">Radicado</SelectItem>
            <SelectItem value="devuelto">Devuelto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Filtros activos:</span>
          </div>

          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="gap-1.5 pr-1 font-normal"
            >
              <span className="text-xs text-muted-foreground">{filter.label}:</span>
              <span className="font-medium">{filter.value}</span>
              <button
                onClick={() => handleRemoveFilter(filter.key)}
                className="ml-1 rounded-sm hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          <Button variant="ghost" size="sm" onClick={handleReset} className="ml-auto h-7">
            <X className="h-3.5 w-3.5 mr-1" />
            Limpiar todos
          </Button>
        </div>
      )}
    </div>
  )
}
