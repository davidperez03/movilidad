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
import { calcularDiasRestantes } from '@/lib/movilidad/formatters'
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
}

// Columna de vencimiento con días restantes (específica para traslados activos)
const columnaVencimientoConDias: ColumnDef<TrasladoData> = {
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
}

// Columna de transporte (específica para traslados)
const columnaTransporte: ColumnDef<TrasladoData> = {
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
}

// Columna de estado (para traslados)
const columnaEstado: ColumnDef<TrasladoData> = {
  accessorKey: 'estado',
  header: 'Estado',
  cell: ({ row }) => (
    <BadgeEstadoProceso estado={row.getValue('estado')} tipoProceso="traslado" />
  ),
  enableSorting: false,
}

// Columna de acciones con descarga de remisión
const columnaAccionesConRemision: ColumnDef<TrasladoData> = {
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
}

// Columnas para traslados activos
export const columnasTraslados: ColumnDef<TrasladoData>[] = [
  crearColumnaPlaca(),
  crearColumnaNumeroCuenta(),
  crearColumnaOrganismo('Organismo Destino'),
  crearColumnaFechaTramite(),
  columnaVencimientoConDias,
  columnaTransporte,
  columnaEstado,
  crearColumnaCreador(),
  columnaAccionesConRemision,
]

// Columnas para traslados completados
export const columnasTrasladosCompletados: ColumnDef<TrasladoData>[] = [
  crearColumnaPlaca(),
  crearColumnaNumeroCuenta(),
  crearColumnaOrganismo('Organismo Destino'),
  crearColumnaFechaTramite(),
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
  columnaTransporte,
  columnaEstado,
  crearColumnaCreador(),
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
