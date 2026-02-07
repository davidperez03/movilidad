"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, CheckCircle, XCircle, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import type { VistaInspeccion } from "@/lib/parqueadero/types"
import type { PermisoParqueadero } from "@/lib/types/permissions"
import { TURNOS } from "@/lib/parqueadero/config"
import { formatearFecha, formatearHora } from "@/lib/parqueadero/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BotonDescargarInspeccion } from "./boton-descargar-inspeccion"

interface TablaInspeccionesProps {
  inspecciones: VistaInspeccion[]
  permisos: Record<PermisoParqueadero, boolean>
}

export function TablaInspecciones({ inspecciones, permisos }: TablaInspeccionesProps) {
  const columns: ColumnDef<VistaInspeccion>[] = [
    {
      accessorKey: "fecha",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" />,
      cell: ({ row }) => formatearFecha(row.getValue("fecha")),
    },
    {
      accessorKey: "hora",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Hora" />,
      cell: ({ row }) => formatearHora(row.getValue("hora")),
    },
    {
      accessorKey: "placa",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Placa" />,
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.getValue("placa")}</span>
      ),
    },
    {
      accessorKey: "turno",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Turno" />,
      cell: ({ row }) => {
        const turno = row.getValue("turno") as string | null
        if (!turno) return "-"
        const config = TURNOS[turno]
        return config ? (
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
        ) : turno
      },
    },
    {
      accessorKey: "operador_nombre",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Operador" />,
      cell: ({ row }) => row.getValue("operador_nombre") || "-",
    },
    {
      accessorKey: "es_apto",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
      cell: ({ row }) => {
        const esApto = row.getValue("es_apto") as boolean
        return (
          <Badge variant={esApto ? "default" : "destructive"} className="gap-1">
            {esApto ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Apto
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                No Apto
              </>
            )}
          </Badge>
        )
      },
    },
    {
      accessorKey: "items_malos",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Items" />,
      cell: ({ row }) => {
        const buenos = row.original.items_buenos || 0
        const regulares = row.original.items_regulares || 0
        const malos = row.original.items_malos || 0
        return (
          <div className="flex gap-1 text-xs">
            <span className="text-green-600">{buenos}B</span>
            <span className="text-yellow-600">{regulares}R</span>
            <span className="text-red-600">{malos}M</span>
          </div>
        )
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/parqueadero/inspecciones/${row.original.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Ver detalles
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <BotonDescargarInspeccion
                inspeccionId={row.original.id}
                placa={row.original.placa}
                variant="ghost"
                size="sm"
                className="w-full justify-start px-2 py-1.5 h-auto font-normal cursor-pointer"
                showIcon={true}
              >
                Descargar PDF
              </BotonDescargarInspeccion>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={inspecciones}
      enableGlobalFilter
      globalFilterPlaceholder="Buscar por placa, operador..."
      emptyMessage="No hay inspecciones registradas"
    />
  )
}
