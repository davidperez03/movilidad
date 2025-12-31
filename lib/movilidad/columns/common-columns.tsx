'use client'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { BadgeEstadoProceso } from '@/components/movilidad/shared/badge-estado-proceso'
import { formatDateForDisplay } from '@/lib/utils'
import { calcularDiasRestantes } from '@/lib/movilidad/formatters'

// Interfaces compartidas
export interface Organismo {
  nombre: string
  municipio: string
  departamento: string
}

export interface Cuenta {
  placa: string
  numero_cuenta: string
  tipo_servicio: string
}

export interface Perfil {
  nombre_completo: string
}

export interface EmpresaTransporte {
  id: string
  nombre: string
}

// Tipos base para procesos
export interface ProcesoBase {
  id: string
  cuenta_id: string
  estado: string
  fecha_tramite: string
  fecha_vencimiento: string
  fecha_completado?: string | null
  observaciones?: string | null
  creado_por: string
  mov_cuentas_vehiculos?: Cuenta
  organismo?: Organismo
  perfiles?: Perfil
}

// Factory functions para columnas comunes

export function crearColumnaPlaca<T extends { mov_cuentas_vehiculos?: Cuenta }>(): ColumnDef<T> {
  return {
    accessorKey: 'mov_cuentas_vehiculos.placa',
    id: 'placa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Placa" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.mov_cuentas_vehiculos?.placa}</div>
    ),
  }
}

export function crearColumnaNumeroCuenta<T extends { mov_cuentas_vehiculos?: Cuenta }>(): ColumnDef<T> {
  return {
    accessorKey: 'mov_cuentas_vehiculos.numero_cuenta',
    id: 'numero_cuenta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="N° Cuenta" />
    ),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.original.mov_cuentas_vehiculos?.numero_cuenta}</div>
    ),
  }
}

export function crearColumnaOrganismo<T extends { organismo?: Organismo }>(titulo: string): ColumnDef<T> {
  return {
    accessorKey: 'organismo.nombre',
    id: 'organismo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={titulo} />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.original.organismo?.nombre || '-'}</div>
    ),
  }
}

export function crearColumnaFechaTramite<T extends { fecha_tramite: string }>(): ColumnDef<T> {
  return {
    accessorKey: 'fecha_tramite',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Trámite" />
    ),
    cell: ({ row }) => (
      <div className="text-sm whitespace-nowrap">
        {formatDateForDisplay(row.original.fecha_tramite)}
      </div>
    ),
  }
}

export function crearColumnaFechaVencimiento<T extends { fecha_vencimiento: string }>(): ColumnDef<T> {
  return {
    accessorKey: 'fecha_vencimiento',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vencimiento" />
    ),
    cell: ({ row }) => (
      <div className="text-sm whitespace-nowrap">
        {formatDateForDisplay(row.original.fecha_vencimiento)}
      </div>
    ),
  }
}

export function crearColumnaDiasRestantes<T extends { fecha_vencimiento: string; estado: string }>(): ColumnDef<T> {
  return {
    accessorKey: 'dias_restantes',
    id: 'dias_restantes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Días Restantes" />
    ),
    cell: ({ row }) => {
      const dias = calcularDiasRestantes(row.original.fecha_vencimiento)

      if (row.original.estado === 'completado' || row.original.estado === 'trasladado' || row.original.estado === 'radicado') {
        return <Badge variant="outline" className="bg-green-50 text-green-700">Completado</Badge>
      }

      if (dias === null) {
        return <span className="text-sm text-muted-foreground">-</span>
      }

      return (
        <Badge
          variant={dias < 7 ? 'destructive' : dias < 15 ? 'secondary' : 'outline'}
          className={dias < 7 ? 'bg-red-50 text-red-700' : dias < 15 ? 'bg-yellow-50 text-yellow-700' : ''}
        >
          {dias} días
        </Badge>
      )
    },
  }
}

export function crearColumnaEstado<T extends { estado: string }>(): ColumnDef<T> {
  return {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => <BadgeEstadoProceso estado={row.original.estado} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  }
}

export function crearColumnaCreador<T extends { perfiles?: Perfil }>(): ColumnDef<T> {
  return {
    accessorKey: 'perfiles.nombre_completo',
    id: 'creador',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creado por" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.original.perfiles?.nombre_completo || '-'}</div>
    ),
  }
}

export function crearColumnaAcciones<T extends { id: string; cuenta_id: string }>(
  rutaDetalle: (row: T) => string
): ColumnDef<T> {
  return {
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <Link href={rutaDetalle(row.original)}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
    ),
  }
}
