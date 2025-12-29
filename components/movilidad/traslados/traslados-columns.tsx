'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { Eye, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { BadgeEstadoProceso } from '@/components/movilidad/badge-estado-proceso'
import { BotonDescargarRemision } from '@/components/movilidad/boton-descargar-remision'
import { formatDateForDisplay } from '@/lib/utils'
import { calcularDiasRestantes } from '@/lib/movilidad/formatters'

interface Organismo {
  nombre: string
  municipio: string
  departamento: string
}

interface Cuenta {
  placa: string
  numero_cuenta: string
  tipo_servicio: string
}

interface Perfil {
  nombre_completo: string
}

interface EmpresaTransporte {
  id: string
  nombre: string
}

export interface TrasladoData {
  id: string
  cuenta_id: string
  estado: string
  fecha_tramite: string
  fecha_vencimiento: string
  fecha_completado?: string | null
  observaciones?: string | null
  numero_guia?: string | null
  empresa_transportadora_id?: string | null
  creado_por: string
  mov_cuentas_vehiculos?: Cuenta
  organismo?: Organismo
  perfiles?: Perfil
  empresa_transporte?: EmpresaTransporte
}

export const columnasTraslados: ColumnDef<TrasladoData>[] = [
  {
    accessorKey: 'mov_cuentas_vehiculos.placa',
    id: 'placa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Placa" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.mov_cuentas_vehiculos?.placa}</div>
    ),
  },
  {
    accessorKey: 'mov_cuentas_vehiculos.numero_cuenta',
    id: 'numero_cuenta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="N° Cuenta" />
    ),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.original.mov_cuentas_vehiculos?.numero_cuenta}</div>
    ),
  },
  {
    accessorKey: 'organismo.nombre',
    id: 'organismo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organismo Destino" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.original.organismo?.nombre || '-'}</div>
    ),
  },
  {
    accessorKey: 'fecha_tramite',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Trámite" />
    ),
    cell: ({ row }) => (
      <div className="text-sm whitespace-nowrap">
        {formatDateForDisplay(row.getValue('fecha_tramite'))}
      </div>
    ),
    sortingFn: 'datetime',
  },
  {
    accessorKey: 'fecha_vencimiento',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vencimiento" />
    ),
    cell: ({ row }) => {
      const fecha = row.getValue('fecha_vencimiento') as string
      const dias = calcularDiasRestantes(fecha)
      return (
        <div className="text-sm whitespace-nowrap">
          <div>{formatDateForDisplay(fecha)}</div>
          {dias !== null && (
            <div className={`text-xs ${
              dias < 0 ? 'text-red-600' : dias <= 7 ? 'text-orange-600' : 'text-green-600'
            }`}>
              {dias < 0 ? `Vencido hace ${Math.abs(dias)} días` : `${dias} días restantes`}
            </div>
          )}
        </div>
      )
    },
    sortingFn: 'datetime',
  },
  {
    id: 'transporte',
    header: 'Transporte',
    cell: ({ row }) => {
      const empresa = row.original.empresa_transporte?.nombre
      const guia = row.original.numero_guia

      if (!empresa && !guia) {
        return <span className="text-sm text-muted-foreground">-</span>
      }

      return (
        <div className="text-xs space-y-0.5">
          {empresa && <div className="font-medium">{empresa}</div>}
          {guia && <div className="text-muted-foreground">Guía: {guia}</div>}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => (
      <BadgeEstadoProceso estado={row.getValue('estado')} tipoProceso="traslado" />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'perfiles.nombre_completo',
    id: 'responsable',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Responsable" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.original.perfiles?.nombre_completo || 'Sin información'}</div>
    ),
  },
  {
    id: 'acciones',
    header: () => <div className="text-right">Acciones</div>,
    cell: ({ row }) => {
      const traslado = row.original
      const puedeDescargar = traslado.estado === 'enviado_organismo' || traslado.estado === 'trasladado'

      return (
        <div className="text-right flex gap-1.5 justify-end">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/movilidad/vehiculos/${traslado.mov_cuentas_vehiculos?.placa}`}>
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Link>
          </Button>
          {puedeDescargar && (
            <BotonDescargarRemision
              trasladoId={traslado.id}
              placa={traslado.mov_cuentas_vehiculos?.placa || ''}
            />
          )}
        </div>
      )
    },
    enableSorting: false,
  },
]

// Columnas para traslados completados
export const columnasTrasladosCompletados: ColumnDef<TrasladoData>[] = [
  {
    accessorKey: 'mov_cuentas_vehiculos.placa',
    id: 'placa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Placa" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.mov_cuentas_vehiculos?.placa}</div>
    ),
  },
  {
    accessorKey: 'mov_cuentas_vehiculos.numero_cuenta',
    id: 'numero_cuenta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="N° Cuenta" />
    ),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.original.mov_cuentas_vehiculos?.numero_cuenta}</div>
    ),
  },
  {
    accessorKey: 'organismo.nombre',
    id: 'organismo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organismo Destino" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.original.organismo?.nombre || '-'}</div>
    ),
  },
  {
    accessorKey: 'fecha_tramite',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Trámite" />
    ),
    cell: ({ row }) => (
      <div className="text-sm whitespace-nowrap">
        {formatDateForDisplay(row.getValue('fecha_tramite'))}
      </div>
    ),
    sortingFn: 'datetime',
  },
  {
    accessorKey: 'fecha_completado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Completado" />
    ),
    cell: ({ row }) => (
      <div className="text-sm whitespace-nowrap">
        {row.getValue('fecha_completado') ? formatDateForDisplay(row.getValue('fecha_completado')) : '-'}
      </div>
    ),
    sortingFn: 'datetime',
  },
  {
    id: 'transporte',
    header: 'Transporte',
    cell: ({ row }) => {
      const empresa = row.original.empresa_transporte?.nombre
      const guia = row.original.numero_guia

      if (!empresa && !guia) {
        return <span className="text-sm text-muted-foreground">-</span>
      }

      return (
        <div className="text-xs space-y-0.5">
          {empresa && <div className="font-medium">{empresa}</div>}
          {guia && <div className="text-muted-foreground">Guía: {guia}</div>}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => (
      <BadgeEstadoProceso estado={row.getValue('estado')} tipoProceso="traslado" />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'perfiles.nombre_completo',
    id: 'responsable',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Responsable" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.original.perfiles?.nombre_completo || 'Sin información'}</div>
    ),
  },
  {
    id: 'acciones',
    header: () => <div className="text-right">Acciones</div>,
    cell: ({ row }) => {
      const traslado = row.original

      return (
        <div className="text-right flex gap-1.5 justify-end">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/movilidad/vehiculos/${traslado.mov_cuentas_vehiculos?.placa}`}>
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Link>
          </Button>
          <BotonDescargarRemision
            trasladoId={traslado.id}
            placa={traslado.mov_cuentas_vehiculos?.placa || ''}
          />
        </div>
      )
    },
    enableSorting: false,
  },
]
