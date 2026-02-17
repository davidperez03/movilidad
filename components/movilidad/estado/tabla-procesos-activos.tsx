'use client'

import { useState, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { Search, Eye, ArrowRightLeft, ArrowDownToLine } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table/data-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BadgeEstadoProceso } from '@/components/movilidad/shared/badge-estado-proceso'
import { formatDateForDisplay } from '@/lib/utils'
import { calcularDiasVencidosCalendario, formatearVencidoHace } from '@/lib/movilidad/formatters'
import { cn } from '@/lib/utils'

interface ProcesoActivo {
  cuenta_id: string
  placa: string
  numero_cuenta: string
  tipo_servicio: string
  proceso_tipo: 'traslado' | 'radicacion'
  proceso_id: string
  proceso_estado: string
  fecha_tramite: string
  fecha_vencimiento: string | null
  dias_restantes: number | null
  ciudad: string
  organismo_id: string
}

interface TablaProcesosActivosProps {
  procesos: ProcesoActivo[]
}

const columnas: ColumnDef<ProcesoActivo>[] = [
  {
    accessorKey: 'numero_cuenta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="N° Cuenta" />
    ),
    cell: ({ row }) => (
      <div className="font-mono font-medium">{row.getValue('numero_cuenta')}</div>
    ),
  },
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
    accessorKey: 'proceso_tipo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      const tipo = row.getValue('proceso_tipo') as string
      const isTraslado = tipo === 'traslado'
      return (
        <div className="flex items-center gap-1.5">
          {isTraslado ? (
            <ArrowRightLeft className="h-3.5 w-3.5 text-purple-600" />
          ) : (
            <ArrowDownToLine className="h-3.5 w-3.5 text-green-600" />
          )}
          <span className="text-sm capitalize">{tipo}</span>
        </div>
      )
    },
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
      <DataTableColumnHeader column={column} title="Vencimiento" />
    ),
    cell: ({ row }) => {
      const dias = row.getValue('dias_restantes') as number | null
      const fecha = row.original.fecha_vencimiento

      if (dias === null || !fecha) {
        return <span className="text-sm text-muted-foreground">Pendiente</span>
      }

      return (
        <div className="text-sm">
          <div>{formatDateForDisplay(fecha)}</div>
          <div className={cn(
            "text-xs font-medium",
            dias < 0 ? "text-red-600" : dias <= 7 ? "text-orange-600" : "text-green-600"
          )}>
            {dias < 0
              ? formatearVencidoHace(Math.max(calcularDiasVencidosCalendario(fecha), 1))
              : dias === 0
                ? "Vence hoy"
                : `${dias} días hábiles restantes`
            }
          </div>
        </div>
      )
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.getValue('dias_restantes') as number | null
      const b = rowB.getValue('dias_restantes') as number | null
      if (a === null && b === null) return 0
      if (a === null) return 1
      if (b === null) return -1
      return a - b
    },
  },
  {
    accessorKey: 'proceso_estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => (
      <BadgeEstadoProceso estado={row.getValue('proceso_estado')} />
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

export function TablaProcesosActivos({ procesos }: TablaProcesosActivosProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const procesosFiltrados = useMemo(() => {
    if (!searchQuery) return procesos

    const query = searchQuery.toLowerCase()
    return procesos.filter((p) =>
      p.placa.toLowerCase().includes(query) ||
      p.numero_cuenta.toLowerCase().includes(query) ||
      p.ciudad?.toLowerCase().includes(query) ||
      p.proceso_tipo.toLowerCase().includes(query)
    )
  }, [procesos, searchQuery])

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa, número de cuenta, organismo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            Limpiar
          </Button>
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Mostrando <span className="font-medium text-foreground">{procesosFiltrados.length}</span>{' '}
          de <span className="font-medium text-foreground">{procesos.length}</span> procesos activos
        </p>
      </div>

      {/* Tabla */}
      <DataTable
        columns={columnas}
        data={procesosFiltrados}
        enablePagination={true}
        pageSize={20}
        pageSizeOptions={[10, 20, 50, 100]}
        enableSorting={true}
        defaultSorting={[{ id: 'numero_cuenta', desc: true }]}
        emptyMessage="No hay procesos activos"
      />
    </div>
  )
}
