'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { BadgeAccion } from './components/badge-accion'
import { RenderDetalles } from './components/render-detalles'
import { formatearFechaCompleta } from './utils'

export interface RegistroAuditoria {
  id: string
  modulo: string
  accion: string
  entidad_tipo: string
  entidad_id: string
  detalles: any
  valor_anterior: string | null
  valor_nuevo: string | null
  usuario_id: string
  usuario_correo: string
  usuario_nombre: string
  ip_address: string | null
  creado_en: string
}

export const columnasAuditoria: ColumnDef<RegistroAuditoria>[] = [
  {
    accessorKey: 'creado_en',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => (
      <div className="align-top whitespace-nowrap w-[140px]">
        {formatearFechaCompleta(row.getValue('creado_en'))}
      </div>
    ),
    sortingFn: 'datetime',
  },
  {
    id: 'usuario',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Usuario" />
    ),
    accessorKey: 'usuario_nombre',
    cell: ({ row }) => (
      <div className="w-[180px]">
        <div className="font-medium">{row.original.usuario_nombre}</div>
        <div className="text-xs text-muted-foreground">{row.original.usuario_correo}</div>
      </div>
    ),
  },
  {
    accessorKey: 'accion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acción" />
    ),
    cell: ({ row }) => (
      <div className="w-[160px]">
        <BadgeAccion accion={row.getValue('accion')} />
      </div>
    ),
  },
  {
    id: 'detalles',
    header: 'Detalles',
    cell: ({ row }) => <RenderDetalles registro={row.original} />,
    enableSorting: false,
  },
  {
    accessorKey: 'ip_address',
    header: 'IP',
    cell: ({ row }) => (
      <div className="text-muted-foreground whitespace-nowrap w-[120px]">
        {row.getValue('ip_address') || '-'}
      </div>
    ),
    enableSorting: false,
  },
]
