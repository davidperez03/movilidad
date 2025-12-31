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
    procesoTipo: new Set(),
    estado: new Set(),
    prioridad: new Set(),
  })

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      // Filtro de búsqueda
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        filters.search === '' ||
        vehicle.placa.toLowerCase().includes(searchLower) ||
        vehicle.numero_cuenta.toLowerCase().includes(searchLower)

      // Filtro de tipo de proceso (multi-select)
      let matchesProcesoTipo = true
      if (filters.procesoTipo.size > 0) {
        if (filters.procesoTipo.has('sin_proceso')) {
          matchesProcesoTipo = vehicle.proceso_tipo === null
        } else {
          matchesProcesoTipo = vehicle.proceso_tipo !== null && filters.procesoTipo.has(vehicle.proceso_tipo)
        }
      }

      // Filtro de estado (multi-select)
      let matchesEstado = true
      if (filters.estado.size > 0) {
        matchesEstado = vehicle.proceso_estado !== null && filters.estado.has(vehicle.proceso_estado)
      }

      // Filtro de prioridad (multi-select)
      let matchesPrioridad = true
      if (filters.prioridad.size > 0) {
        const dias = vehicle.dias_restantes
        const estado = vehicle.proceso_estado

        // Solo aplicar filtro de prioridad a vehículos con proceso activo
        if (!vehicle.proceso_tipo) {
          matchesPrioridad = false
        } else {
          const vehiclePriorities: string[] = []

          // Urgente: con novedades
          if (estado === 'con_novedades') {
            vehiclePriorities.push('urgente')
          }

          // Vencido
          if (dias !== null && dias < 0) {
            vehiclePriorities.push('vencido')
          }

          // Alta: 0-2 días
          if (dias !== null && dias >= 0 && dias <= 2) {
            vehiclePriorities.push('alta')
          }

          // Media: 3-7 días
          if (dias !== null && dias > 2 && dias <= 7) {
            vehiclePriorities.push('media')
          }

          // Baja: >7 días
          if (dias !== null && dias > 7) {
            vehiclePriorities.push('baja')
          }

          // Check if vehicle matches any selected priority
          matchesPrioridad = vehiclePriorities.some(p => filters.prioridad.has(p))
        }
      }

      return matchesSearch && matchesProcesoTipo && matchesEstado && matchesPrioridad
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
