'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { BadgeEstadoProceso } from '@/components/movilidad/shared/badge-estado-proceso'
import { formatearFecha } from '@/lib/movilidad/formatters'
import {
  formatearUrgenciaPorVencer,
  obtenerNivelUrgenciaPorVencer,
} from '@/lib/movilidad/reportes/urgencia'
import type { DatosReportePorVencer } from '@/lib/movilidad/reportes/tipos'

function BadgeUrgencia({ diasRestantes }: { diasRestantes: number }) {
  const nivel = obtenerNivelUrgenciaPorVencer(diasRestantes)
  const texto = formatearUrgenciaPorVencer(diasRestantes)

  if (nivel === 'vencido') return <Badge variant="destructive">{texto}</Badge>
  if (nivel === 'vence_hoy') return <Badge className="bg-red-500 hover:bg-red-600">{texto}</Badge>
  if (nivel === 'alta') return <Badge className="bg-orange-500 hover:bg-orange-600">{texto}</Badge>
  if (nivel === 'media') return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950">{texto}</Badge>
  return <Badge variant="outline">{texto}</Badge>
}

export const columnasTablaPorVencer: ColumnDef<DatosReportePorVencer>[] = [
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
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => (
      <BadgeEstadoProceso estado={row.getValue('estado')} />
    ),
  },
  {
    accessorKey: 'ciudad',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organismo" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.getValue('ciudad')}</div>
    ),
    meta: { className: 'hidden lg:table-cell' },
  },
  {
    accessorKey: 'fecha_vencimiento',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Vencimiento" />
    ),
    cell: ({ row }) => formatearFecha(row.getValue('fecha_vencimiento')),
    sortingFn: 'datetime',
  },
  {
    accessorKey: 'dias_restantes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Urgencia" />
    ),
    cell: ({ row }) => {
      const dias = row.getValue('dias_restantes') as number
      return <BadgeUrgencia diasRestantes={dias} />
    },
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
    meta: { className: 'hidden md:table-cell' },
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
