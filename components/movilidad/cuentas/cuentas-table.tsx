'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasCuentas, type CuentaVehiculo } from './cuentas-columns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CuentasTableProps {
  cuentas: CuentaVehiculo[]
  permisos: any
}

export function CuentasTable({ cuentas, permisos }: CuentasTableProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filtrar cuentas por búsqueda
  const cuentasFiltradas = useMemo(() => {
    if (!searchQuery) return cuentas

    const query = searchQuery.toLowerCase()
    return cuentas.filter((cuenta) =>
      cuenta.placa.toLowerCase().includes(query) ||
      cuenta.numero_cuenta.toLowerCase().includes(query)
    )
  }, [cuentas, searchQuery])

  // Usar columnas sin modificaciones
  const columnasFinales = columnasCuentas

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa o número de cuenta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            Limpiar
          </Button>
        )}
      </div>

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
            columns={columnasFinales}
            data={cuentasFiltradas}
            enablePagination={true}
            pageSize={20}
            pageSizeOptions={[10, 20, 50, 100]}
            enableSorting={true}
            defaultSorting={[{ id: 'placa', desc: false }]}
            emptyMessage="No se encontraron cuentas"
          />
        </div>
      </div>
    </div>
  )
}
