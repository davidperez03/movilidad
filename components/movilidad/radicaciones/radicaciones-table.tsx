'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasRadicaciones, columnasRadicacionesCompletadas, type RadicacionData } from './radicaciones-columns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface RadicacionesTableProps {
  radicaciones: RadicacionData[]
  esCompletadas?: boolean
}

export function RadicacionesTable({ radicaciones, esCompletadas = false }: RadicacionesTableProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filtrar radicaciones por búsqueda
  const radicacionesFiltradas = useMemo(() => {
    if (!searchQuery) return radicaciones

    const query = searchQuery.toLowerCase()
    return radicaciones.filter((radicacion) =>
      radicacion.mov_cuentas_vehiculos?.placa.toLowerCase().includes(query) ||
      radicacion.mov_cuentas_vehiculos?.numero_cuenta.toLowerCase().includes(query) ||
      radicacion.organismo?.nombre.toLowerCase().includes(query)
    )
  }, [radicaciones, searchQuery])

  const columnas = esCompletadas ? columnasRadicacionesCompletadas : columnasRadicaciones

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa, número de cuenta u organismo..."
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
            Mostrando <span className="font-medium text-foreground">{radicacionesFiltradas.length}</span>{' '}
            de <span className="font-medium text-foreground">{radicaciones.length}</span> radicaciones
          </p>
        </div>

        <div className="px-4 pt-4">
          <DataTable
            columns={columnas}
            data={radicacionesFiltradas}
            enablePagination={true}
            pageSize={10}
            pageSizeOptions={[10, 20, 50]}
            enableSorting={true}
            defaultSorting={[{ id: 'numero_cuenta', desc: true }]}
            emptyMessage={esCompletadas
              ? "No se encontraron radicaciones completadas"
              : "No se encontraron radicaciones activas"
            }
          />
        </div>
      </div>
    </div>
  )
}
