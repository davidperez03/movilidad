'use client'

import Link from 'next/link'
import { FileText, AlertTriangle, Play } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table/data-table'
import { columnasCuentas, type CuentaVehiculo } from './cuentas-columns'
import { Button } from '@/components/ui/button'
import { BotonesIniciarProceso } from '@/components/movilidad/cuentas-acciones'

interface CuentasTableProps {
  cuentas: CuentaVehiculo[]
  permisos: any
}

export function CuentasTable({ cuentas, permisos }: CuentasTableProps) {
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
    <DataTable
      columns={columnasConAcciones}
      data={cuentas}
      enablePagination={true}
      pageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
      enableSorting={true}
      defaultSorting={[{ id: 'creado_en', desc: true }]}
      emptyMessage="No se encontraron cuentas"
    />
  )
}
