'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { BadgeEstadoProceso } from '@/components/movilidad/badge-estado-proceso'
import { formatearFecha, formatearDiasRestantes } from '@/lib/movilidad/formatters'
import type { DatosReporteActivos } from '@/lib/movilidad/reportes/tipos'

export const columnasTablaActivos: ColumnDef<DatosReporteActivos>[] = [
  {
    accessorKey: 'placa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Placa" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('placa')}</div>
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
    header: 'Tipo Servicio',
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue('tipo_servicio')}</Badge>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'proceso_tipo',
    header: 'Tipo Proceso',
    cell: ({ row }) => {
      const tipo = row.getValue('proceso_tipo') as string
      return (
        <Badge variant={tipo === 'traslado' ? 'default' : 'secondary'}>
          {tipo}
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'proceso_estado',
    header: 'Estado',
    cell: ({ row }) => (
      <BadgeEstadoProceso estado={row.getValue('proceso_estado')} />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'ciudad',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organismo" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.getValue('ciudad')}</div>
    ),
  },
  {
    accessorKey: 'fecha_tramite',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Trámite" />
    ),
    cell: ({ row }) => formatearFecha(row.getValue('fecha_tramite')),
    sortingFn: 'datetime',
  },
  {
    accessorKey: 'dias_restantes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Días Restantes" />
    ),
    cell: ({ row }) => {
      const dias = row.getValue('dias_restantes') as number | null
      return dias !== null ? (
        <Badge variant="outline">{formatearDiasRestantes(dias)}</Badge>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      )
    },
    sortingFn: 'basic',
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
  },
]
