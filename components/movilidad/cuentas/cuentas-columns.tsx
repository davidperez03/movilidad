'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { FileText, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { ESTADOS_CONFIG } from '@/lib/movilidad/config'
import { formatDateLong } from '@/lib/utils'

interface ProcesoActivo {
  proceso_tipo: string
  proceso_estado: string
  ciudad: string
}

interface UltimoProcesoCompletado {
  proceso_tipo: string
  estado: string
  fecha_completado: string
  organismo_nombre: string
}

interface Creador {
  nombre_completo: string
  correo: string
}

export interface CuentaVehiculo {
  id: string
  placa: string
  numero_cuenta: string
  tipo_servicio: string
  creado_en: string
  creador?: Creador | null
  procesoActivo?: ProcesoActivo | null
  ultimo_proceso_completado?: UltimoProcesoCompletado | null
}

export const columnasCuentas: ColumnDef<CuentaVehiculo>[] = [
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
      const tipo = row.getValue('tipo_servicio') as string
      const labels: Record<string, string> = {
        particular: 'Particular',
        publico: 'Público',
        otro: 'Otro',
      }
      return (
        <Badge variant="outline">{labels[tipo] || tipo}</Badge>
      )
    },
    enableSorting: false,
  },
  {
    id: 'proceso_activo',
    header: 'Proceso Activo',
    cell: ({ row }) => {
      const procesoActivo = row.original.procesoActivo
      if (!procesoActivo?.proceso_tipo) {
        return <span className="text-sm text-muted-foreground">Sin proceso</span>
      }
      return (
        <Badge variant="outline" className="capitalize">
          {procesoActivo.proceso_tipo === 'traslado' ? 'Traslado' : 'Radicación'}
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    id: 'estado',
    header: 'Estado',
    cell: ({ row }) => {
      const procesoActivo = row.original.procesoActivo
      if (!procesoActivo?.proceso_tipo) {
        return <span className="text-sm text-muted-foreground">-</span>
      }
      const config = ESTADOS_CONFIG[procesoActivo.proceso_estado]
      const isNovedad = procesoActivo.proceso_estado === 'con_novedades'
      return (
        <Badge variant={isNovedad ? 'destructive' : 'outline'} className={config?.color || ''}>
          {config?.label || procesoActivo.proceso_estado}
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    id: 'organismo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organismo" />
    ),
    cell: ({ row }) => {
      const procesoActivo = row.original.procesoActivo
      const ultimoCompletado = row.original.ultimo_proceso_completado

      if (procesoActivo?.ciudad) {
        return <div className="text-sm font-medium">{procesoActivo.ciudad}</div>
      }

      if (!procesoActivo?.proceso_tipo && ultimoCompletado) {
        return (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950">
              <History className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">Último</span>
              <span className="text-xs text-muted-foreground">{ultimoCompletado.organismo_nombre}</span>
            </div>
          </div>
        )
      }

      return <span className="text-sm text-muted-foreground">-</span>
    },
    enableSorting: false,
  },
  {
    id: 'creado_por',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creado por" />
    ),
    accessorKey: 'creador.nombre_completo',
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.creador?.nombre_completo || 'Sin información'}
      </div>
    ),
  },
  {
    accessorKey: 'creado_en',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Creación" />
    ),
    cell: ({ row }) => (
      <div className="text-sm whitespace-nowrap">
        {formatDateLong(row.getValue('creado_en'))}
      </div>
    ),
    sortingFn: 'datetime',
  },
  {
    id: 'acciones',
    header: () => <div className="text-right">Acciones</div>,
    cell: ({ row }) => {
      const cuenta = row.original

      return (
        <div className="flex gap-2 justify-end items-center">
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
        </div>
      )
    },
    enableSorting: false,
  },
]
