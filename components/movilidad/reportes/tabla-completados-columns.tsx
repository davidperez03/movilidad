'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { BadgeEstadoProceso } from '@/components/movilidad/shared/badge-estado-proceso'
import { formatearFecha } from '@/lib/movilidad/formatters'
import type { DatosReporteCompletados } from '@/lib/movilidad/reportes/tipos'

export const columnasTablaCompletados: ColumnDef<DatosReporteCompletados>[] = [
  {
    accessorKey: 'placa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Placa" />
    ),
    cell: ({ row }) => (
      <div className="font-plate">{row.getValue('placa')}</div>
    ),
  },
  {
    accessorKey: 'numero_cuenta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="N° Cuenta" />
    ),
  },
  {
    accessorKey: 'tipo_servicio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo Servicio" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue('tipo_servicio')}</Badge>
    ),
  },
  {
    accessorKey: 'proceso_tipo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo Proceso" />
    ),
    cell: ({ row }) => {
      const tipo = row.getValue('proceso_tipo') as string
      return (
        <Badge variant={tipo === 'traslado' ? 'default' : 'secondary'}>
          {tipo}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado Final" />
    ),
    cell: ({ row }) => (
      <BadgeEstadoProceso estado={row.getValue('estado')} />
    ),
  },
  {
    accessorKey: 'organismo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organismo" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.getValue('organismo')}</div>
    ),
  },
  {
    accessorKey: 'fecha_completado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Completado" />
    ),
    cell: ({ row }) => formatearFecha(row.getValue('fecha_completado')),
    sortingFn: 'datetime',
  },
  {
    accessorKey: 'duracion_dias',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duración (días)" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue('duracion_dias')}</Badge>
    ),
    sortingFn: 'basic',
  },
  {
    accessorKey: 'responsable',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Responsable" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate">{row.getValue('responsable')}</div>
    ),
  },
  {
    id: 'acciones',
    header: () => <div className="text-right">Acciones</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/movilidad/vehiculos/${row.original.placa}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  },
]
