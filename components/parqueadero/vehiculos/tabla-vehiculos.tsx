"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, MoreHorizontal, Pencil } from "lucide-react"
import Link from "next/link"
import type { VistaVehiculo } from "@/lib/parqueadero/types"
import type { PermisoParqueadero } from "@/lib/types/permissions"
import { TIPOS_VEHICULO, ESTADOS_DOCUMENTO } from "@/lib/parqueadero/config"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModalEditarVehiculo } from "./modal-editar-vehiculo"

interface TablaVehiculosProps {
  vehiculos: VistaVehiculo[]
  permisos: Record<PermisoParqueadero, boolean>
}

export function TablaVehiculos({ vehiculos, permisos }: TablaVehiculosProps) {
  const [vehiculoEditar, setVehiculoEditar] = useState<VistaVehiculo | null>(null)

  const columns: ColumnDef<VistaVehiculo>[] = [
    {
      accessorKey: "placa",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Placa" />,
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.getValue("placa")}</span>
      ),
    },
    {
      accessorKey: "tipo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
      cell: ({ row }) => {
        const tipo = row.getValue("tipo") as string
        const config = TIPOS_VEHICULO[tipo]
        return config ? (
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
        ) : tipo
      },
    },
    {
      accessorKey: "marca",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Marca" />,
      cell: ({ row }) => row.getValue("marca") || "-",
    },
    {
      accessorKey: "modelo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Modelo" />,
      cell: ({ row }) => row.getValue("modelo") || "-",
    },
    {
      accessorKey: "estado_soat",
      header: ({ column }) => <DataTableColumnHeader column={column} title="SOAT" />,
      cell: ({ row }) => {
        const estado = row.getValue("estado_soat") as string
        const config = ESTADOS_DOCUMENTO[estado]
        return config ? (
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
        ) : "-"
      },
    },
    {
      accessorKey: "estado_tecnomecanica",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tecnomecánica" />,
      cell: ({ row }) => {
        const estado = row.getValue("estado_tecnomecanica") as string
        const config = ESTADOS_DOCUMENTO[estado]
        return config ? (
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
        ) : "-"
      },
    },
    {
      accessorKey: "total_inspecciones",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Inspecciones" />,
      cell: ({ row }) => row.getValue("total_inspecciones") || 0,
    },
    {
      accessorKey: "activo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
      cell: ({ row }) => {
        const activo = row.getValue("activo") as boolean
        return (
          <Badge variant={activo ? "default" : "secondary"}>
            {activo ? "Activo" : "Inactivo"}
          </Badge>
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
              <Link href={`/parqueadero/vehiculos/${row.original.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Ver detalles
              </Link>
            </DropdownMenuItem>
            {permisos.gestionar_vehiculos && (
              <DropdownMenuItem onClick={() => setVehiculoEditar(row.original)}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={vehiculos}
        enableGlobalFilter
        globalFilterPlaceholder="Buscar por placa, marca..."
        emptyMessage="No hay vehículos registrados"
      />
      {vehiculoEditar && (
        <ModalEditarVehiculo
          vehiculo={vehiculoEditar}
          onCerrar={() => setVehiculoEditar(null)}
        />
      )}
    </>
  )
}
