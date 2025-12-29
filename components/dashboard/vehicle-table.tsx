'use client'

import { useState, useMemo } from 'react'
import { VehicleFilters, FilterState } from './vehicle-filters'
import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasVehicleTable, VehicleData } from './vehicle-table-columns'

interface VehicleTableProps {
  vehicles: VehicleData[]
}

export function VehicleTable({ vehicles }: VehicleTableProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tipoServicio: 'todos',
    procesoTipo: 'todos',
    estado: 'todos',
  })

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      // Filtro de búsqueda
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        filters.search === '' ||
        vehicle.placa.toLowerCase().includes(searchLower) ||
        vehicle.numero_cuenta.toLowerCase().includes(searchLower)

      // Filtro de tipo de servicio
      const matchesTipoServicio =
        filters.tipoServicio === 'todos' || vehicle.tipo_servicio === filters.tipoServicio

      // Filtro de tipo de proceso
      let matchesProcesoTipo = true
      if (filters.procesoTipo === 'sin_proceso') {
        matchesProcesoTipo = vehicle.proceso_tipo === null
      } else if (filters.procesoTipo !== 'todos') {
        matchesProcesoTipo = vehicle.proceso_tipo === filters.procesoTipo
      }

      // Filtro de estado
      const matchesEstado = filters.estado === 'todos' || vehicle.proceso_estado === filters.estado

      return matchesSearch && matchesTipoServicio && matchesProcesoTipo && matchesEstado
    })
  }, [vehicles, filters])

  return (
    <div className="space-y-4">
      <VehicleFilters filters={filters} onFilterChange={setFilters} />

      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{filteredVehicles.length}</span>{' '}
            de <span className="font-medium text-foreground">{vehicles.length}</span> vehículos
          </p>
        </div>

        <div className="px-4 pt-4">
          <DataTable
            columns={columnasVehicleTable}
            data={filteredVehicles}
            enablePagination={true}
            pageSize={10}
            pageSizeOptions={[10, 20, 50, 100]}
            enableSorting={true}
            defaultSorting={[{ id: 'placa', desc: false }]}
            emptyMessage="No se encontraron vehículos. Intenta ajustar los filtros"
          />
        </div>
      </div>
    </div>
  )
}
