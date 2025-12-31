'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
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
        <Badge variant="outline" className="text-xs">
          {labels[tipo] || tipo}
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'creado_en',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Creación" />
    ),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {formatDateLong(row.getValue('creado_en'))}
      </div>
    ),
    sortingFn: 'datetime',
  },
  {
    id: 'ultimo_proceso',
    header: 'Último Proceso',
    cell: ({ row }) => {
      const procesoActivo = row.original.procesoActivo
      const ultimoCompletado = row.original.ultimo_proceso_completado

      // Si tiene proceso activo
      if (procesoActivo?.proceso_tipo) {
        return (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950">
              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            </div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">En proceso activo</span>
          </div>
        )
      }

      // Si tiene último proceso completado
      if (ultimoCompletado) {
        const esDevuelto = ultimoCompletado.estado === 'devuelto'
        const label = ultimoCompletado.estado === 'trasladado' ? 'Trasladado' :
                      ultimoCompletado.estado === 'radicado' ? 'Radicado' : 'Devuelto'

        return (
          <div className="space-y-0.5">
            <div className="text-xs font-medium capitalize text-muted-foreground">
              {ultimoCompletado.proceso_tipo}
            </div>
            <Badge variant={esDevuelto ? 'destructive' : 'outline'} className="text-[10px] px-1.5 py-0">
              {label}
            </Badge>
          </div>
        )
      }

      return <span className="text-sm text-muted-foreground">Sin historial</span>
    },
    enableSorting: false,
  },
  {
    id: 'acciones',
    header: () => <div className="text-right">Acciones</div>,
    cell: ({ row }) => {
      const cuenta = row.original

      return (
        <div className="text-right">
          <Button
            asChild
            variant="outline"
            size="sm"
          >
            <Link href={`/movilidad/vehiculos/${cuenta.placa}`}>
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Ver detalles
            </Link>
          </Button>
        </div>
      )
    },
    enableSorting: false,
  },
]
