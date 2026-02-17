'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { BadgeEstadoProceso } from '@/components/movilidad/shared/badge-estado-proceso'
import { BotonDescargarRemision } from '@/components/movilidad/pdf/boton-descargar-remision'
import { formatDateForDisplay } from '@/lib/utils'
import { calcularDiasVencidosCalendario, formatearVencidoHace } from '@/lib/movilidad/formatters'
import {
  type ProcesoBase,
  type EmpresaTransporte,
  crearColumnaPlaca,
  crearColumnaNumeroCuenta,
  crearColumnaOrganismo,
  crearColumnaFechaTramite,
  crearColumnaCreador,
} from '@/lib/movilidad/columns/common-columns'

export interface TrasladoData extends ProcesoBase {
  numero_guia?: string | null
  empresa_transportadora_id?: string | null
  empresa_transporte?: EmpresaTransporte
  dias_restantes?: number | null
}

// Columna de vencimiento: hábiles para vigentes, calendario para vencidos
const columnaVencimientoConDias: ColumnDef<TrasladoData> = {
  accessorKey: 'fecha_vencimiento',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Vencimiento" />
  ),
  cell: ({ row }) => {
    const fecha = row.getValue('fecha_vencimiento') as string
    const dias = row.original.dias_restantes
    const diasVencidosCalendario = calcularDiasVencidosCalendario(fecha)
    const vencidoSinCalculoHabil = (dias === null || dias === undefined) && diasVencidosCalendario > 0
    const estaVencido = (dias !== null && dias !== undefined && dias < 0) || vencidoSinCalculoHabil
    const diasNoVencidos = dias ?? Number.POSITIVE_INFINITY
    return (
      <div className="text-sm whitespace-nowrap">
        <div>{formatDateForDisplay(fecha)}</div>
        {(dias !== null && dias !== undefined || vencidoSinCalculoHabil) && (
          <div className={`text-xs ${
            estaVencido ? 'text-red-600' : diasNoVencidos <= 7 ? 'text-orange-600' : 'text-green-600'
          }`}>
            {estaVencido
              ? formatearVencidoHace(Math.max(diasVencidosCalendario, 1))
              : dias === 0
                ? 'Vence hoy'
                : `${dias} días hábiles`}
          </div>
        )}
      </div>
    )
  },
  sortingFn: 'datetime',
}

// Columna de transporte (específica para traslados)
const columnaTransporte: ColumnDef<TrasladoData> = {
  accessorFn: (row) => {
    const empresa = row.empresa_transporte?.nombre || ''
    const guia = row.numero_guia || ''
    return `${empresa} ${guia}`.trim()
  },
  id: 'transporte',
  meta: { className: 'hidden md:table-cell' },
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Transporte" />
  ),
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
}

// Columna de estado (para traslados)
const columnaEstado: ColumnDef<TrasladoData> = {
  accessorKey: 'estado',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Estado" />
  ),
  cell: ({ row }) => (
    <BadgeEstadoProceso estado={row.getValue('estado')} />
  ),
}

// Columna de acciones con descarga de remisión
const columnaAccionesConRemision: ColumnDef<TrasladoData> = {
  id: 'acciones',
  header: () => <div className="text-right">Acciones</div>,
  cell: ({ row }) => {
    const traslado = row.original
    const puedeDescargar = traslado.estado === 'aprobado' || traslado.estado === 'enviado_organismo' || traslado.estado === 'trasladado'

    return (
      <div className="text-right flex flex-nowrap items-center gap-1.5 justify-end">
        <Button variant="ghost" size="sm" className="shrink-0 whitespace-nowrap" asChild>
          <Link href={`/movilidad/vehiculos/${traslado.mov_cuentas_vehiculos?.placa}`}>
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Link>
        </Button>
        {puedeDescargar && (
          <BotonDescargarRemision
            trasladoId={traslado.id}
            placa={traslado.mov_cuentas_vehiculos?.placa || ''}
            showIcon={false}
            className="shrink-0 whitespace-nowrap"
          >
            PDF
          </BotonDescargarRemision>
        )}
      </div>
    )
  },
  enableSorting: false,
  enableColumnFilter: false,
}

// Columnas para traslados activos
export const columnasTraslados: ColumnDef<TrasladoData>[] = [
  crearColumnaNumeroCuenta(),
  crearColumnaPlaca(),
  crearColumnaOrganismo('Destino'),
  columnaVencimientoConDias,
  columnaEstado,
  columnaTransporte,
  columnaAccionesConRemision,
]

// Columna fecha completado
const columnaFechaCompletado: ColumnDef<TrasladoData> = {
  accessorKey: 'fecha_completado',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Completado" />
  ),
  cell: ({ row }) => (
    <div className="text-sm whitespace-nowrap">
      {row.getValue('fecha_completado') ? formatDateForDisplay(row.getValue('fecha_completado')) : '-'}
    </div>
  ),
  sortingFn: 'datetime',
}

// Columnas para traslados completados
export const columnasTrasladosCompletados: ColumnDef<TrasladoData>[] = [
  crearColumnaNumeroCuenta(),
  crearColumnaPlaca(),
  crearColumnaOrganismo('Destino'),
  columnaFechaCompletado,
  columnaEstado,
  columnaTransporte,
  {
    id: 'acciones',
    header: () => <div className="text-right">Acciones</div>,
    cell: ({ row }) => {
      const traslado = row.original
      return (
        <div className="text-right flex flex-nowrap items-center gap-1.5 justify-end">
          <Button variant="ghost" size="sm" className="shrink-0 whitespace-nowrap" asChild>
            <Link href={`/movilidad/vehiculos/${traslado.mov_cuentas_vehiculos?.placa}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <BotonDescargarRemision
            trasladoId={traslado.id}
            placa={traslado.mov_cuentas_vehiculos?.placa || ''}
            showIcon={false}
            className="shrink-0 whitespace-nowrap"
          >
            PDF
          </BotonDescargarRemision>
        </div>
      )
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
]
