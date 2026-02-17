'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { BadgeEstadoProceso } from '@/components/movilidad/shared/badge-estado-proceso'
import { formatDateForDisplay } from '@/lib/utils'
import { calcularDiasVencidosCalendario, formatearVencidoHace } from '@/lib/movilidad/formatters'
import {
  type ProcesoBase,
  crearColumnaPlaca,
  crearColumnaNumeroCuenta,
  crearColumnaOrganismo,
  crearColumnaFechaTramite,
  crearColumnaCreador,
} from '@/lib/movilidad/columns/common-columns'

export interface RadicacionData extends ProcesoBase {
  dias_restantes?: number | null
  notificacion_radicacion?: {
    id: string
    solicitante_notificado: boolean
    notificado_en: string | null
    observaciones: string | null
  } | null
}

// Columna de vencimiento: hábiles para vigentes, calendario para vencidos
const columnaVencimientoConDias: ColumnDef<RadicacionData> = {
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

// Columna de estado (para radicaciones)
const columnaEstado: ColumnDef<RadicacionData> = {
  accessorKey: 'estado',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Estado" />
  ),
  cell: ({ row }) => (
    <BadgeEstadoProceso estado={row.getValue('estado')} />
  ),
}

// Columna de notificación al solicitante
const columnaNotificacionSolicitante: ColumnDef<RadicacionData> = {
  id: 'notificacion_solicitante',
  meta: { className: 'hidden md:table-cell' },
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Solicitante" />
  ),
  accessorFn: (row) => {
    if (row.estado !== 'pendiente_radicar') return 'no_aplica'
    return row.notificacion_radicacion?.solicitante_notificado ? 'notificado' : 'pendiente'
  },
  cell: ({ row }) => {
    if (row.original.estado !== 'pendiente_radicar') {
      return <span className="text-sm text-muted-foreground">No aplica</span>
    }

    const notificado = row.original.notificacion_radicacion?.solicitante_notificado
    return (
      <Badge
        variant={notificado ? 'default' : 'outline'}
        className={notificado ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'text-amber-700 border-amber-300'}
      >
        {notificado ? 'Notificado' : 'Pendiente'}
      </Badge>
    )
  },
}

// Columna de acciones
const columnaAcciones: ColumnDef<RadicacionData> = {
  id: 'acciones',
  header: () => <div className="text-right">Acciones</div>,
  cell: ({ row }) => (
    <div className="text-right">
      <Button variant="ghost" size="sm" className="whitespace-nowrap" asChild>
        <Link href={`/movilidad/vehiculos/${row.original.mov_cuentas_vehiculos?.placa}`}>
          <Eye className="h-4 w-4 mr-1" />
          Ver
        </Link>
      </Button>
    </div>
  ),
  enableSorting: false,
  enableColumnFilter: false,
}

// Columna fecha completado
const columnaFechaCompletado: ColumnDef<RadicacionData> = {
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

// Columnas para radicaciones activas
export const columnasRadicaciones: ColumnDef<RadicacionData>[] = [
  crearColumnaNumeroCuenta(),
  crearColumnaPlaca(),
  crearColumnaOrganismo('Origen'),
  columnaVencimientoConDias,
  columnaNotificacionSolicitante,
  columnaEstado,
  columnaAcciones,
]

// Columnas para radicaciones completadas
export const columnasRadicacionesCompletadas: ColumnDef<RadicacionData>[] = [
  crearColumnaNumeroCuenta(),
  crearColumnaPlaca(),
  crearColumnaOrganismo('Origen'),
  columnaFechaCompletado,
  columnaEstado,
  columnaAcciones,
]
