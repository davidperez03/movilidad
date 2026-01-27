'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { BadgeEstadoProceso } from '@/components/movilidad/shared/badge-estado-proceso'
import { formatDateForDisplay } from '@/lib/utils'
import {
  type ProcesoBase,
  crearColumnaPlaca,
  crearColumnaNumeroCuenta,
  crearColumnaOrganismo,
  crearColumnaFechaTramite,
  crearColumnaCreador,
} from '@/lib/movilidad/columns/common-columns'

export interface RadicacionData extends ProcesoBase {
  dias_restantes?: number | null
}

// Columna de vencimiento con días hábiles restantes
const columnaVencimientoConDias: ColumnDef<RadicacionData> = {
  accessorKey: 'fecha_vencimiento',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Vencimiento" />
  ),
  cell: ({ row }) => {
    const fecha = row.getValue('fecha_vencimiento') as string
    const dias = row.original.dias_restantes
    return (
      <div className="text-sm whitespace-nowrap">
        <div>{formatDateForDisplay(fecha)}</div>
        {dias !== null && dias !== undefined && (
          <div className={`text-xs ${
            dias < 0 ? 'text-red-600' : dias <= 7 ? 'text-orange-600' : 'text-green-600'
          }`}>
            {dias < 0 ? `Vencido hace ${Math.abs(dias)} días hábiles` : `${dias} días hábiles`}
          </div>
        )}
      </div>
    )
  },
  sortingFn: 'datetime',
}

// Columna de estado (para radicaciones)
const columnaEstado: ColumnDef<RadicacionData> = {
  accessorKey: 'estado',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Estado" />
  ),
  cell: ({ row }) => (
    <BadgeEstadoProceso estado={row.getValue('estado')} />
  ),
}

// Columna de acciones
const columnaAcciones: ColumnDef<RadicacionData> = {
  id: 'acciones',
  header: () => <div className="text-right">Acciones</div>,
  cell: ({ row }) => (
    <div className="text-right">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/movilidad/vehiculos/${row.original.mov_cuentas_vehiculos?.placa}`}>
          <Eye className="h-4 w-4 mr-1" />
          Ver
        </Link>
      </Button>
    </div>
  ),
  enableSorting: false,
}

// Columna fecha completado
const columnaFechaCompletado: ColumnDef<RadicacionData> = {
  accessorKey: 'fecha_completado',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Completado" />
  ),
  cell: ({ row }) => (
    <div className="text-sm whitespace-nowrap">
      {row.getValue('fecha_completado') ? formatDateForDisplay(row.getValue('fecha_completado')) : '-'}
    </div>
  ),
  sortingFn: 'datetime',
}

// Columnas para radicaciones activas
export const columnasRadicaciones: ColumnDef<RadicacionData>[] = [
  crearColumnaNumeroCuenta(),
  crearColumnaPlaca(),
  crearColumnaOrganismo('Origen'),
  columnaVencimientoConDias,
  columnaEstado,
  columnaAcciones,
]

// Columnas para radicaciones completadas
export const columnasRadicacionesCompletadas: ColumnDef<RadicacionData>[] = [
  crearColumnaNumeroCuenta(),
  crearColumnaPlaca(),
  crearColumnaOrganismo('Origen'),
  columnaFechaCompletado,
  columnaEstado,
  columnaAcciones,
]
