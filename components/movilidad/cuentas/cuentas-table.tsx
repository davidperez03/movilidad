'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { FileText, AlertTriangle, Play, Search } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasCuentas, type CuentaVehiculo } from './cuentas-columns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BotonesIniciarProceso } from '@/components/movilidad/cuentas-acciones'

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

  // Crear columnas con la columna de acciones contextual
  const columnasConAcciones = columnasCuentas.map((col) => {
    if (col.id === 'acciones') {
      return {
        ...col,
        cell: ({ row }: any) => {
          const cuenta = row.original as CuentaVehiculo
          const procesoActivo = cuenta.procesoActivo
          const tieneNovedades = procesoActivo?.proceso_estado === 'con_novedades'

          return (
            <div className="text-right flex gap-1.5 justify-end items-center">
              {/* Sin proceso activo: Botones para iniciar */}
              {!procesoActivo?.proceso_tipo && (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-8"
                  >
                    <Link href={`/movilidad/vehiculos/${cuenta.placa}`}>
                      <FileText className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <BotonesIniciarProceso placa={cuenta.placa} permisos={permisos} />
                </>
              )}

              {/* Con proceso activo pero sin novedades: Ver proceso */}
              {procesoActivo?.proceso_tipo && !tieneNovedades && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8"
                >
                  <Link href={`/movilidad/vehiculos/${cuenta.placa}`}>
                    <Play className="h-3.5 w-3.5 mr-1.5" />
                    Ver proceso
                  </Link>
                </Button>
              )}

              {/* Con novedades: Botón urgente */}
              {tieneNovedades && (
                <Button
                  asChild
                  variant="destructive"
                  size="sm"
                  className="h-8"
                >
                  <Link href={`/movilidad/vehiculos/${cuenta.placa}`}>
                    <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                    Resolver novedades
                  </Link>
                </Button>
              )}
            </div>
          )
        },
      }
    }
    return col
  })

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
            columns={columnasConAcciones}
            data={cuentasFiltradas}
            enablePagination={true}
            pageSize={20}
            pageSizeOptions={[10, 20, 50, 100]}
            enableSorting={true}
            defaultSorting={[{ id: 'creado_en', desc: true }]}
            emptyMessage="No se encontraron cuentas"
          />
        </div>
      </div>
    </div>
  )
}
