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
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Placa" className="justify-center" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="font-bold text-base text-center">{row.getValue('placa')}</div>
    ),
  },
  {
    accessorKey: 'numero_cuenta',
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="N° Cuenta" className="justify-center" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="font-medium text-center">{row.getValue('numero_cuenta')}</div>
    ),
  },
  {
    accessorKey: 'tipo_servicio',
    header: () => <div className="text-center">Tipo Servicio</div>,
    cell: ({ row }) => {
      const tipo = row.getValue('tipo_servicio') as string
      const labels: Record<string, string> = {
        particular: 'Particular',
        publico: 'Público',
        otro: 'Otro',
      }
      return (
        <div className="flex justify-center">
          <Badge variant="outline">{labels[tipo] || tipo}</Badge>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'estado',
    header: () => <div className="text-center">Estado</div>,
    cell: ({ row }) => {
      const procesoActivo = row.original.procesoActivo
      if (!procesoActivo?.proceso_tipo) {
        return (
          <div className="flex justify-center">
            <Badge variant="secondary">Sin proceso activo</Badge>
          </div>
        )
      }
      const config = ESTADOS_CONFIG[procesoActivo.proceso_estado]
      const isNovedad = procesoActivo.proceso_estado === 'con_novedades'
      return (
        <div className="flex justify-center">
          <Badge variant={isNovedad ? 'destructive' : 'default'} className={config?.color}>
            {config?.label || procesoActivo.proceso_estado}
          </Badge>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'proceso_activo',
    header: () => <div className="text-center">Proceso Activo</div>,
    cell: ({ row }) => {
      const procesoActivo = row.original.procesoActivo
      if (!procesoActivo?.proceso_tipo) {
        return <div className="text-center text-sm text-muted-foreground">-</div>
      }
      return (
        <div className="flex justify-center">
          <Badge variant="outline" className="capitalize">
            {procesoActivo.proceso_tipo === 'traslado' ? 'Traslado' : 'Radicación'}
          </Badge>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'organismo',
    header: () => <div className="text-center">Organismo</div>,
    cell: ({ row }) => {
      const procesoActivo = row.original.procesoActivo
      const ultimoCompletado = row.original.ultimo_proceso_completado

      if (procesoActivo?.ciudad) {
        return <div className="text-sm text-center max-w-[200px] truncate mx-auto">{procesoActivo.ciudad}</div>
      }

      if (!procesoActivo?.proceso_tipo && ultimoCompletado) {
        return (
          <div className="text-xs text-muted-foreground max-w-[200px] truncate flex items-center justify-center gap-1 mx-auto">
            <History className="h-3 w-3" />
            {ultimoCompletado.organismo_nombre}
          </div>
        )
      }

      return <div className="text-center text-sm text-muted-foreground">-</div>
    },
    enableSorting: false,
  },
  {
    id: 'creado_por',
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Creado por" className="justify-center" />
      </div>
    ),
    accessorKey: 'creador.nombre_completo',
    cell: ({ row }) => (
      <div className="max-w-[180px] truncate text-center mx-auto">
        {row.original.creador?.nombre_completo || 'Sin información'}
      </div>
    ),
  },
  {
    accessorKey: 'creado_en',
    header: ({ column }) => (
      <div className="text-center">
        <DataTableColumnHeader column={column} title="Fecha Creación" className="justify-center" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-sm whitespace-nowrap text-center">
        {formatDateLong(row.getValue('creado_en'))}
      </div>
    ),
    sortingFn: 'datetime',
  },
  {
    id: 'acciones',
    header: () => <div className="text-center">Acciones</div>,
    cell: ({ row }) => {
      const cuenta = row.original
      const procesoActivo = cuenta.procesoActivo
      const tieneNovedades = procesoActivo?.proceso_estado === 'con_novedades'

      return (
        <div className="flex gap-2 justify-center items-center">
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
