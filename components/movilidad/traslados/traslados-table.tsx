'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasTraslados, columnasTrasladosCompletados, type TrasladoData } from './traslados-columns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface TrasladosTableProps {
  traslados: TrasladoData[]
  esCompletados?: boolean
}

export function TrasladosTable({ traslados, esCompletados = false }: TrasladosTableProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filtrar traslados por búsqueda
  const trasladosFiltrados = useMemo(() => {
    if (!searchQuery) return traslados

    const query = searchQuery.toLowerCase()
    return traslados.filter((traslado) =>
      traslado.mov_cuentas_vehiculos?.placa.toLowerCase().includes(query) ||
      traslado.mov_cuentas_vehiculos?.numero_cuenta.toLowerCase().includes(query) ||
      traslado.organismo?.nombre.toLowerCase().includes(query) ||
      traslado.empresa_transporte?.nombre.toLowerCase().includes(query) ||
      traslado.numero_guia?.toLowerCase().includes(query)
    )
  }, [traslados, searchQuery])

  const columnas = esCompletados ? columnasTrasladosCompletados : columnasTraslados

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa, número de cuenta, organismo o guía..."
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
            Mostrando <span className="font-medium text-foreground">{trasladosFiltrados.length}</span>{' '}
            de <span className="font-medium text-foreground">{traslados.length}</span> traslados
          </p>
        </div>

        <div className="px-4 pt-4">
          <DataTable
            columns={columnas}
            data={trasladosFiltrados}
            enablePagination={true}
            pageSize={10}
            pageSizeOptions={[10, 20, 50]}
            enableSorting={true}
            defaultSorting={[{ id: 'numero_cuenta', desc: true }]}
            emptyMessage={esCompletados
              ? "No se encontraron traslados completados"
              : "No se encontraron traslados activos"
            }
          />
        </div>
      </div>
    </div>
  )
}
