'use client'

import { useState, useMemo } from 'react'
import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasCuentas, type CuentaVehiculo } from './cuentas-columns'
import { CuentasFilters, CuentasFilterState } from './cuentas-filters'

interface CuentasTableProps {
  cuentas: CuentaVehiculo[]
  permisos: any
}

export function CuentasTable({ cuentas, permisos }: CuentasTableProps) {
  const [filters, setFilters] = useState<CuentasFilterState>({
    search: '',
    tipoServicio: new Set(),
    estadoProceso: new Set(),
  })

  // Filtrar cuentas
  const cuentasFiltradas = useMemo(() => {
    return cuentas.filter((cuenta) => {
      // Filtro de búsqueda
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        filters.search === '' ||
        cuenta.placa.toLowerCase().includes(searchLower) ||
        cuenta.numero_cuenta.toLowerCase().includes(searchLower)

      // Filtro de tipo de servicio (multi-select)
      let matchesTipoServicio = true
      if (filters.tipoServicio.size > 0) {
        matchesTipoServicio = filters.tipoServicio.has(cuenta.tipo_servicio)
      }

      // Filtro de estado del proceso (multi-select)
      let matchesEstadoProceso = true
      if (filters.estadoProceso.size > 0) {
        if (filters.estadoProceso.has('con_proceso')) {
          matchesEstadoProceso = cuenta.procesoActivo?.proceso_tipo !== undefined && cuenta.procesoActivo?.proceso_tipo !== null
        } else if (filters.estadoProceso.has('sin_proceso')) {
          matchesEstadoProceso = !cuenta.procesoActivo?.proceso_tipo && !cuenta.ultimo_proceso_completado
        } else if (filters.estadoProceso.has('completado')) {
          matchesEstadoProceso = !cuenta.procesoActivo?.proceso_tipo && cuenta.ultimo_proceso_completado !== undefined && cuenta.ultimo_proceso_completado !== null
        }
      }

      return matchesSearch && matchesTipoServicio && matchesEstadoProceso
    })
  }, [cuentas, filters])

  return (
    <div className="space-y-4">
      <CuentasFilters filters={filters} onFilterChange={setFilters} />

      {/* Tabla */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{cuentasFiltradas.length}</span>{' '}
            de <span className="font-medium text-foreground">{cuentas.length}</span> cuentas
          </p>
        </div>

        <div className="px-4 pt-4">
          <DataTable
            columns={columnasCuentas}
            data={cuentasFiltradas}
            enablePagination={true}
            pageSize={20}
            pageSizeOptions={[10, 20, 50, 100]}
            enableSorting={true}
            defaultSorting={[{ id: 'numero_cuenta', desc: true }]}
            emptyMessage="No se encontraron cuentas"
          />
        </div>
      </div>
    </div>
  )
}
