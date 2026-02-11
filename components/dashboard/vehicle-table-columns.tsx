'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { Eye, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { ESTADOS_CONFIG } from '@/lib/movilidad/config'

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
      <div className="font-plate">{row.getValue('placa')}</div>
    ),
  },
  {
    id: 'proceso',
    header: 'Proceso / Estado',
    cell: ({ row }) => {
      const procesoTipo = row.original.proceso_tipo
      const procesoEstado = row.original.proceso_estado

      if (!procesoTipo) {
        return <span className="text-sm text-muted-foreground">Sin proceso activo</span>
      }

      const config = ESTADOS_CONFIG[procesoEstado || '']
      const isNovedad = procesoEstado === 'con_novedades'
      const procesoLabel = procesoTipo === 'traslado' ? 'Traslado' : 'Radicación'

      return (
        <div className="space-y-1">
          <div className="text-xs font-medium capitalize text-muted-foreground">
            {procesoLabel}
          </div>
          <Badge variant={isNovedad ? 'destructive' : 'outline'} className={`text-xs ${config?.color || ''}`}>
            {config?.label || procesoEstado?.replace(/_/g, ' ')}
          </Badge>
        </div>
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
      <DataTableColumnHeader column={column} title="Días Hábiles" />
    ),
    cell: ({ row }) => {
      const dias = row.getValue('dias_restantes') as number | null
      if (dias === null || dias === undefined) {
        return <span className="text-sm text-muted-foreground">-</span>
      }
      return (
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${
              dias < 0
                ? 'text-red-600'
                : dias <= 2
                  ? 'text-orange-600'
                  : dias <= 7
                    ? 'text-yellow-600'
                    : 'text-green-600'
            }`}
          >
            {dias < 0 ? `Vencido (${Math.abs(dias)}d)` : `${dias} días`}
          </span>
        </div>
      )
    },
    sortingFn: 'basic',
  },
  {
    id: 'prioridad',
    header: 'Prioridad',
    cell: ({ row }) => {
      const dias = row.original.dias_restantes
      const estado = row.original.proceso_estado

      // Sin proceso activo
      if (!row.original.proceso_tipo) {
        return <span className="text-sm text-muted-foreground">-</span>
      }

      // Con novedades = máxima prioridad
      if (estado === 'con_novedades') {
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Urgente
          </Badge>
        )
      }

      // Basado en días
      if (dias === null || dias === undefined) {
        return <Badge variant="outline">Normal</Badge>
      }

      if (dias < 0) {
        return <Badge variant="destructive">Vencido</Badge>
      }

      if (dias <= 2) {
        return <Badge variant="destructive" className="bg-orange-600 hover:bg-orange-700">Alta</Badge>
      }

      if (dias <= 7) {
        return <Badge variant="outline" className="border-yellow-600 text-yellow-600">Media</Badge>
      }

      return <Badge variant="outline" className="border-green-600 text-green-600">Baja</Badge>
    },
    enableSorting: false,
  },
  {
    id: 'acciones',
    header: () => <div className="text-right">Acciones</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <Button asChild size="sm" variant="outline">
          <Link href={`/movilidad/vehiculos/${row.original.placa}`}>
            <Eye className="h-4 w-4 mr-1.5" />
            Ver
          </Link>
        </Button>
      </div>
    ),
    enableSorting: false,
  },
]
