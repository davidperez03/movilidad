'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { ESTADOS_CONFIG, TIPOS_SERVICIO_CONFIG } from '@/lib/movilidad/config'
import { formatDateShort } from '@/lib/utils'
import { HistorialProcesoDialog } from './historial-proceso-dialog'

interface UltimoProcesoCompletado {
  proceso_tipo: string
  estado: string
  fecha_completado: string
  organismo_nombre: string
}

export interface VehicleData {
  cuenta_id: string
  placa: string
  numero_cuenta: string
  tipo_servicio: string
  proceso_tipo: string | null
  proceso_estado: string | null
  ciudad: string | null
  dias_restantes: number | null
  ultimo_proceso_completado?: UltimoProcesoCompletado | null
}

export const columnasVehicleTable: ColumnDef<VehicleData>[] = [
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
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.getValue('numero_cuenta')}</div>
    ),
  },
  {
    accessorKey: 'tipo_servicio',
    header: 'Tipo Servicio',
    cell: ({ row }) => {
      const tipoServicio = row.getValue('tipo_servicio') as string
      const config = TIPOS_SERVICIO_CONFIG[tipoServicio as keyof typeof TIPOS_SERVICIO_CONFIG]
      return (
        <Badge variant="outline" className={config?.color || ''}>
          {config?.label || tipoServicio}
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'proceso_tipo',
    header: 'Proceso Activo',
    cell: ({ row }) => {
      const procesoTipo = row.getValue('proceso_tipo') as string | null
      return procesoTipo ? (
        <Badge variant="outline" className="capitalize">
          {procesoTipo}
        </Badge>
      ) : (
        <span className="text-sm text-muted-foreground">Sin proceso</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'proceso_estado',
    header: 'Estado',
    cell: ({ row }) => {
      const estado = row.getValue('proceso_estado') as string | null
      if (!estado) {
        return <span className="text-sm text-muted-foreground">-</span>
      }
      const config = ESTADOS_CONFIG[estado]
      return (
        <Badge variant="outline" className={config?.color || ''}>
          {config?.label || estado.replace(/_/g, ' ')}
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'ciudad',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organismo" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue('ciudad') || '-'}</div>
    ),
  },
  {
    accessorKey: 'dias_restantes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Días Restantes" />
    ),
    cell: ({ row }) => {
      const dias = row.getValue('dias_restantes') as number | null
      if (dias === null || dias === undefined) {
        return <span className="text-sm text-muted-foreground">-</span>
      }
      return (
        <span
          className={`text-sm font-medium ${
            dias < 0
              ? 'text-red-600'
              : dias <= 7
                ? 'text-orange-600'
                : 'text-green-600'
          }`}
        >
          {dias < 0 ? `Vencido hace ${Math.abs(dias)} días` : `${dias} días`}
        </span>
      )
    },
    sortingFn: 'basic',
  },
  {
    id: 'historial',
    header: 'Historial',
    cell: ({ row }) => {
      const ultimoProceso = row.original.ultimo_proceso_completado
      return ultimoProceso ? (
        <div className="space-y-1.5">
          <div className="text-xs">
            <span className="font-medium capitalize">
              {ultimoProceso.proceso_tipo}
            </span>
            <span className="text-muted-foreground mx-1">•</span>
            <span className="text-muted-foreground">
              {formatDateShort(ultimoProceso.fecha_completado)}
            </span>
          </div>
          <HistorialProcesoDialog
            cuentaId={row.original.cuenta_id}
            placa={row.original.placa}
          />
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Sin historial</span>
      )
    },
    enableSorting: false,
  },
  {
    id: 'acciones',
    header: () => <div className="text-right">Acciones</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <Button asChild size="sm" variant="ghost">
          <Link href={`/movilidad/vehiculos/${row.original.placa}`}>
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Link>
        </Button>
      </div>
    ),
    enableSorting: false,
  },
]
